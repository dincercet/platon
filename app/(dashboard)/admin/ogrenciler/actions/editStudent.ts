"use server";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import isAdminAuth from "../../actions/isAdminAuth";
import logger from "winston-config";

const prisma = new PrismaClient();

export default async function editStudent(
  studentId: number,
  firstName: string,
  lastName: string,
): Promise<{ success: boolean; error?: string }> {
  //check authorization
  if (!(await isAdminAuth())) return { success: false, error: "Unauthorized." };

  //create zod schema
  const schema = z.object({
    studentId: z.number().min(0),
    firstName: z.string().min(1).max(100),
    lastName: z.string().min(1).max(100),
  });

  //validation result
  const validation = schema.safeParse({
    studentId: studentId,
    firstName: firstName,
    lastName: lastName,
  });

  if (!validation.success) {
    //validation failed

    logger.error("Form validation failed.");
    return { success: false, error: "Form validation failed." };
  } else {
    //validation successful

    try {
      //update the student based on id
      await prisma.users.update({
        where: { id: studentId },
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      });

      //successful
      return { success: true };
    } catch (e) {
      //database error
      logger.error("prisma error: failed to edit student", e);
      return {
        success: false,
        error: "Database error: Failed to edit student.",
      };
    }
  }
}
