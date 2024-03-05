"use server";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import isAdminAuth from "../../actions/isAdminAuth";
import logger from "@/winston-config";

const prisma = new PrismaClient();

export default async function addCurriculumWeek(
  curriculumId: number,
  weekNo: number,
  weekDescription: string,
): Promise<{ success: boolean; weekId?: number; error?: string }> {
  //check authorization
  if (!(await isAdminAuth())) return { success: false, error: "Unauthorized." };

  //create zod schema
  const schema = z.object({
    curriculumId: z.number().min(0),
    weekNo: z.number().min(0),
    weekDescription: z.string().min(1).max(500),
  });

  //validation result
  const validation = schema.safeParse({
    curriculumId: curriculumId,
    weekNo: weekNo,
    weekDescription: weekDescription,
  });

  if (!validation.success) {
    //validation failed

    logger.error("Form validation failed.");
    return { success: false, error: "Form validation failed." };
  } else {
    //validation successful

    try {
      //create an entry in curriculum_weeks table
      const addedWeek = await prisma.curriculum_weeks.create({
        data: {
          week_no: weekNo,
          description: weekDescription,
          curriculum_id: curriculumId,
        },
        select: { id: true },
      });

      return addedWeek.id
        ? { success: true, weekId: addedWeek.id } //successful
        : { success: false, error: "Failed to add curriculum week." }; //no week id returned
    } catch (e) {
      //database error
      logger.error("prisma error: failed to add curriculum week", e);
      return {
        success: false,
        error: "Database error: Failed to add curriculum week.",
      };
    }
  }
}
