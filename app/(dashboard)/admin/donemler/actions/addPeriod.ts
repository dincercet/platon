"use server";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import isAdminAuth from "../../actions/isAdminAuth";

const prisma = new PrismaClient();

export default async function addPeriod(
  curriculumId: number,
  dates: [Date, Date],
): Promise<{ success: boolean; periodId?: number; error?: string }> {
  //check authorization
  if (!(await isAdminAuth())) return { success: false, error: "Unauthorized." };

  //create zod schema
  const schema = z.object({
    curriculumId: z.number().min(0),
  });

  //validation result
  const validation = schema.safeParse({ curriculumId: curriculumId });

  if (!validation.success) {
    //validation failed

    console.error("Form validation failed.");
    return { success: false, error: "Form validation failed." };
  } else {
    //validation successful

    try {
      //create an entry in curriculum_periods table
      const addedPeriod = await prisma.curriculum_periods.create({
        data: {
          curriculum_id: curriculumId,
          begins_at: dates[0],
          ends_at: dates[1],
        },
        select: { id: true },
      });

      return addedPeriod.id
        ? { success: true, periodId: addedPeriod.id } //successful
        : { success: false, error: "Failed to add period." }; //no added period returned
    } catch (e) {
      //database error
      console.error("prisma error: failed to add period", e);
      return {
        success: false,
        error: "Database error: Failed to add period.",
      };
    }
  }
}
