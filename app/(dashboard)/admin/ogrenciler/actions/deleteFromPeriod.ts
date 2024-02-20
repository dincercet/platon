"use server";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import isAdminAuth from "../../actions/isAdminAuth";

const prisma = new PrismaClient();

export default async function deleteFromPeriod(
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
      // delete the user from the period
      await prisma.users_periods.deleteMany({
        where: {
          user_id: studentId,
          period_id: periodId,
        },
      });

      //successful
      return { success: true };
    } catch (e) {
      //database error
      console.error("prisma error: failed to delete from period", e);
      return {
        success: false,
        error: "Database error: Failed to delete from period.",
      };
    }
  }
}
