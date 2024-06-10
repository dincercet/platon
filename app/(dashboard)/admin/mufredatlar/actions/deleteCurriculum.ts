"use server";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import isAdminAuth from "../../actions/isAdminAuth";
import logger from "@/winston-config";

const prisma = new PrismaClient();

export default async function deleteCurriculum(
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
      //check if there is a related period
      const found = await prisma.curriculum_periods.findFirst({
        where: { curriculum_id: id },
      });

      if (found)
        return {
          success: false,
          error: "Curriculum has related period. Delete the period first.",
        };
    } catch (e) {
      //database error
      logger.error("prisma error: failed to check curriculum period.", e);
      return {
        success: false,
        error: "Database error: Failed to check curriculum period.",
      };
    }

    try {
      //delete curriculum based on id
      await prisma.course_curriculums.delete({
        where: { id: id },
      });

      //successful
      return { success: true };
    } catch (e) {
      //database error
      logger.error("prisma error: failed to delete curriculum", e);
      return {
        success: false,
        error: "Database error: Failed to delete curriculum.",
      };
    }
  }
}
