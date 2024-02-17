"use server";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import isAdminAuth from "../../actions/isAdminAuth";

const prisma = new PrismaClient();

export default async function editPeriod(
  periodId: number,
  curriculumId: number,
  dates: [Date, Date],
): Promise<{ success: boolean; error?: string }> {
  //check authorization
  if (!(await isAdminAuth())) return { success: false, error: "Unauthorized." };

  //create zod schema
  const schema = z.object({
    periodId: z.number().min(0),
    curriculumId: z.number().min(0),
    beginsAt: z.date(),
    endsAt: z.date(),
  });

  //validation result
  const validation = schema.safeParse({
    periodId: periodId,
    curriculumId: curriculumId,
    beginsAt: dates[0],
    endsAt: dates[1],
  });

  if (!validation.success) {
    //validation failed

    console.error("Form validation failed.");
    return { success: false, error: "Form validation failed." };
  } else {
    //validation successful

    try {
      //update an entry in curriculum_periods table
      await prisma.curriculum_periods.update({
        where: { id: periodId },
        data: {
          begins_at: dates[0],
          ends_at: dates[1],
          curriculum_id: curriculumId,
        },
      });

      return { success: true }; //successful
    } catch (e) {
      //database error
      console.error("prisma error: failed to edit period", e);
      return {
        success: false,
        error: "Database error: Failed to edit period.",
      };
    }
  }
}
