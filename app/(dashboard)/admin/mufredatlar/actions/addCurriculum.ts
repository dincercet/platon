"use server";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import isAdminAuth from "../../actions/isAdminAuth";
import logger from "@/winston-config";

const prisma = new PrismaClient();

export default async function addCurriculum(
  courseId: number,
): Promise<{ success: boolean; curriculumId?: number; error?: string }> {
  //check authorization
  if (!(await isAdminAuth())) return { success: false, error: "Unauthorized." };

  //create zod schema
  const schema = z.object({
    courseId: z.number().min(0),
  });

  //validation result
  const validation = schema.safeParse({ courseId: courseId });

  if (!validation.success) {
    //validation failed

    logger.error("Form validation failed.");
    return { success: false, error: "Form validation failed." };
  } else {
    //validation successful

    try {
      //check if there is an existing curriculum that is not legacy on the same course
      const existingCurriculum = await prisma.course_curriculums.findFirst({
        select: { id: true },
        where: { course_id: courseId, legacy: false },
      });

      //if exists, return error
      if (existingCurriculum) {
        return {
          success: false,
          error: "A non-legacy curriculum already exists for this course.",
        };
      }
    } catch (e) {
      //database error
      logger.error("prisma error: failed when checking existing curriculum", e);
      return {
        success: false,
        error: "Database error: Failed when checking existing curriculum.",
      };
    }

    try {
      //create an entry in course_curriculums table
      const addedCurriculum = await prisma.course_curriculums.create({
        data: { course_id: courseId },
        select: { id: true },
      });

      return addedCurriculum.id
        ? { success: true, curriculumId: addedCurriculum.id } //successful
        : { success: false, error: "Failed to add curriculum." }; //no added curriculum returned
    } catch (e) {
      //database error
      logger.error("prisma error: failed to add curriculum", e);
      return {
        success: false,
        error: "Database error: Failed to add curriculum.",
      };
    }
  }
}
