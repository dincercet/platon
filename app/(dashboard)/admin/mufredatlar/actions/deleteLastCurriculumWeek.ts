"use server";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import isAdminAuth from "../../actions/isAdminAuth";
import logger from "@/winston-config";

const prisma = new PrismaClient();

export default async function deleteLastCurriculumWeek(
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

    try {
      //delete the last week by passing its id
      await prisma.curriculum_weeks.delete({
        where: { id: id },
      });

      //successful
      return { success: true };
    } catch (e) {
      //database error
      logger.error("prisma error: failed to delete last curriculum week", e);
      return {
        success: false,
        error: "Database error: Failed to delete last curriculum week.",
      };
    }
  }
}
