"use server";
import { join } from "path";
import { unlink } from "fs/promises";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import logger from "@/winston-config";
import isAdminAuth from "../../actions/isAdminAuth";

const prisma = new PrismaClient();

export default async function deleteLastWeek(
  periodId: number,
  weekId: number,
  weekNo: number,
  documents: { documentId: number; fileName: string }[],
): Promise<{ success: boolean; error?: string }> {
  //check authorization
  if (!(await isAdminAuth())) return { success: false, error: "Unauthorized." };

  //create zod schema
  const schema = z.object({
    periodId: z.number().min(0),
    weekId: z.number().min(0),
    weekNo: z.number().min(0),
  });

  const documentSchema = z.object({
    documentId: z.number().min(0),
    fileName: z.string().min(1).max(300),
  });

  //validate parameters
  const validation = schema.safeParse({
    periodId: periodId,
    weekId: weekId,
    weekNo: weekNo,
  });

  if (!validation.success)
    return { success: false, error: "Parameter validation failed." };

  //validate all document values
  for (let i = 0; i < documents.length; i++) {
    if (
      !documentSchema.safeParse({
        documentId: documents[i].documentId,
        fileName: documents[i].fileName,
      }).success
    )
      return { success: false, error: "Document values validation failed." };
  }

  //delete documents and then the week from database
  try {
    const deleteDocuments = prisma.week_documents.deleteMany({
      where: { week_id: weekId },
    });

    const deleteWeek = prisma.period_weeks.delete({
      where: { id: weekId },
    });

    //make sure both prisma queries are successful
    await prisma.$transaction([deleteDocuments, deleteWeek]);
  } catch (e) {
    //database error
    logger.error("prisma error: failed to delete last document week", e);
    return {
      success: false,
      error: "Database error: Failed to delete last document week.",
    };
  }

  //delete each document from path
  for (let i = 0; i < documents.length; i++) {
    //concatenate the path
    const path = join(
      process.cwd(),
      `/app/documents/${periodId}/${weekNo}/`,
      documents[i].fileName,
    );

    try {
      //delete the file from path
      await unlink(path);
    } catch (e) {
      logger.error(
        "Error deleting a file from path, after deletion from database. Will have to manually delete. path: ",
        path,
        e,
      );
      return { success: false, error: "Failed to delete a file from path." };
    }
  }

  return { success: true }; //successful
}
