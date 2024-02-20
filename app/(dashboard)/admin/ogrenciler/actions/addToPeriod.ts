"use server";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import isAdminAuth from "../../actions/isAdminAuth";

const prisma = new PrismaClient();

export default async function addToPeriod(
  studentId: number,
  periodId: number,
): Promise<{ success: boolean; error?: string }> {
  //check authorization
  if (!(await isAdminAuth())) return { success: false, error: "Unauthorized." };

  //create zod schema
  const schema = z.object({
    studentId: z.number().min(0),
    periodId: z.number().min(0),
  });

  //validation result
  const validation = schema.safeParse({
    studentId: studentId,
    periodId: periodId,
  });

  if (!validation.success) {
    //validation failed

    console.error("Form validation failed.");
    return { success: false, error: "Form validation failed." };
  } else {
    //validation successful

    try {
      // create an entry in users_periods table
      await prisma.users_periods.create({
        data: {
          user_id: studentId,
          period_id: periodId,
        },
      });

      //successful
      return { success: true };
    } catch (e) {
      //database error
      console.error("prisma error: failed to add to period", e);
      return {
        success: false,
        error: "Database error: Failed to add to period.",
      };
    }
  }
}
