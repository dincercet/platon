"use server";
import { join } from "path";
import { unlink } from "fs/promises";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import logger from "@/winston-config";
import isAdminAuth from "../../actions/isAdminAuth";

const prisma = new PrismaClient();

//delete a document based on documentId, both from path and database
export default async function deleteDocument(
  periodId: number,
  weekNo: number,
  documentId: number,
  fileName: string,
): Promise<{ success: boolean; error?: string }> {
  //check authorization
  if (!(await isAdminAuth())) return { success: false, error: "Unauthorized." };

  //create zod schema
  const schema = z.object({
    periodId: z.number().min(0),
    weekNo: z.number().min(0),
    documentId: z.number().min(0),
    fileName: z.string().min(1).max(300),
  });

  //validate parameters
  const validation = schema.safeParse({
    periodId: periodId,
    weekNo: weekNo,
    documentId: documentId,
    fileName: fileName,
  });

  if (!validation.success)
    return { success: false, error: "Parameter validation failed." };

  //concatenate the path
  const path = join(
    process.cwd(),
    `/app/documents/${periodId}/${weekNo}/`,
    fileName,
  );

  try {
    //delete the file from path
    await unlink(path);
  } catch (e) {
    logger.error("Error deleting file from path.", e);
  }

  try {
    //delete the file from database
    await prisma.week_documents.delete({
      where: { id: documentId },
    });

    return { success: true }; //successful
  } catch (e) {
    logger.error("Prisma error: couldn't delete file from database", e);

    return { success: false, error: "Couldn't delete file from database." };
  }
}
