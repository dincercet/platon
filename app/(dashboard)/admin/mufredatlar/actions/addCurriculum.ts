"use server";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import isAdminAuth from "../../actions/isAdminAuth";

const prisma = new PrismaClient();

export default async function addCurriculum(
  courseId: number,
): Promise<{ success: boolean; error?: string }> {
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

    console.error("Form validation failed.");
    return { success: false, error: "Form validation failed." };
  } else {
    //validation successful

    try {
      //create an entry in courses table
      await prisma.course_curriculums.create({
        data: { course_id: courseId },
      });

      //successful
      return { success: true };
    } catch (e) {
      //database error
      console.error("prisma error: failed to add curriculum", e);
      return {
        success: false,
        error: "Database error: Failed to add curriculum.",
      };
    }
  }
}
