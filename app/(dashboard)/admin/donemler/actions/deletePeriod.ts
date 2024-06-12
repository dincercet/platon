"use server";

import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import { join } from "path";
import { rm } from "fs";
import isAdminAuth from "../../actions/isAdminAuth";
import logger from "@/winston-config";

const prisma = new PrismaClient();

export default async function deletePeriod(
  id: number,
): Promise<{ success: boolean; error?: string }> {
  //check authorization
  if (!(await isAdminAuth())) return { success: false, error: "Unauthorized." };

  //create zod schema
  const schema = z.object({
    id: z.number().min(0),
  });

  //validation result
  const validation = schema.safeParse({
    id: id,
  });

  if (!validation.success) {
    //validation failed

    logger.error("Id validation failed.");
    return { success: false, error: "Id validation failed." };
  } else {
    //validation successful

    //concatenate the path
    const path = join(process.cwd(), `/app/documents/${id}`);

    //delete all the files and the folders from path
    rm(path, { recursive: true, force: true }, (err) => {
      if (err) {
        logger.error("Error deleting all files from path.", err);
      }
      return { success: false, error: "Error deleting all files from path." };
    });

    //delete the documents' data from database
    const deleteDocuments = prisma.week_documents.deleteMany({
      where: { week: { period: { id: id } } },
    });

    //delete the weeks from database
    const deleteWeeks = prisma.period_weeks.deleteMany({
      where: { period_id: id },
    });

    //delete the relation records between users and periods
    const deleteStudentRelations = prisma.users_periods.deleteMany({
      where: { period_id: id },
    });

    //finally, delete the period
    const deletePeriod = prisma.curriculum_periods.delete({
      where: { id: id },
    });

    try {
      //if one fails, then roll back changes
      await prisma.$transaction([
        deleteDocuments,
        deleteWeeks,
        deleteStudentRelations,
        deletePeriod,
      ]);

      //successful
      return { success: true };
    } catch (e) {
      logger.error(
        "Prisma error: Error completing transaction of deleting period",
        e,
      );
      return {
        success: false,
        error:
          "Database error: Error completing transaction of deleting period",
      };
    }
  }
}
