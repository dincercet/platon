"use server";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import isAdminAuth from "../../actions/isAdminAuth";
import logger from "@/winston-config";

const prisma = new PrismaClient();

export default async function deleteCourse(
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
      //check if there is a related curriculum
      const found = await prisma.course_curriculums.findFirst({
        where: { course_id: id },
      });

      if (found)
        return {
          success: false,
          error: "Course has related curriculum. Delete the curriculum first.",
        };
    } catch (e) {
      //database error
      logger.error("prisma error: failed to check course curriculum", e);
      return {
        success: false,
        error: "Database error: Failed to check course curriculum.",
      };
    }

    try {
      //delete course based on id
      await prisma.courses.delete({
        where: { id: id },
      });

      //successful
      return { success: true };
    } catch (e) {
      //database error
      logger.error("prisma error: failed to delete course", e);
      return {
        success: false,
        error: "Database error: Failed to delete course.",
      };
    }
  }
}
