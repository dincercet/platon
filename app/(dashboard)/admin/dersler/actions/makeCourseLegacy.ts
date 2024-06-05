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
      //make related curriculums legacy
      await prisma.course_curriculums.updateMany({
        where: { course_id: id },
        data: { legacy: true },
      });
    } catch (e) {
      //database error
      logger.error(
        "prisma error: failed to update course related curriculum to legacy.",
        e,
      );
      return {
        success: false,
        error:
          "Database error: failed to update course related curriculum to legacy.",
      };
    }

    try {
      //make the course legacy
      await prisma.courses.update({
        where: { id: id },
        data: { legacy: true },
      });

      //successful
      return { success: true };
    } catch (e) {
      //database error
      logger.error("prisma error: failed to make course legacy.", e);
      return {
        success: false,
        error: "Database error: failed to make course legacy.",
      };
    }
  }
}
