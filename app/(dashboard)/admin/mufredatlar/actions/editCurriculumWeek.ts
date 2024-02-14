"use server";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import isAdminAuth from "../../actions/isAdminAuth";

const prisma = new PrismaClient();

export default async function editCurriculumWeek(
  weekId: number,
  weekDescription: string,
): Promise<{ success: boolean; error?: string }> {
  //check authorization
  if (!(await isAdminAuth())) return { success: false, error: "Unauthorized." };

  //create zod schema
  const schema = z.object({
    weekId: z.number().min(0),
    weekDescription: z.string().min(1).max(500),
  });

  //validation result
  const validation = schema.safeParse({
    weekId: weekId,
    weekDescription: weekDescription,
  });

  if (!validation.success) {
    //validation failed

    console.error("Form validation failed.");
    return { success: false, error: "Form validation failed." };
  } else {
    //validation successful

    try {
      //create an entry in curriculum_weeks table
      await prisma.curriculum_weeks.update({
        where: { id: weekId },
        data: {
          description: weekDescription,
        },
      });

      return { success: true }; //successful
    } catch (e) {
      //database error
      console.error("prisma error: failed to edit curriculum week", e);
      return {
        success: false,
        error: "Database error: Failed to edit curriculum week.",
      };
    }
  }
}
