"use server";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import isAdminAuth from "../../actions/isAdminAuth";

const prisma = new PrismaClient();

export default async function addStudent(
  email: string,
  firstName: string,
  lastName: string,
  periodId?: number,
): Promise<{ success: boolean; error?: string }> {
  //check authorization
  if (!(await isAdminAuth())) return { success: false, error: "Unauthorized." };

  //create zod schema
  const schema = z.object({
    firstName: z.string().min(1).max(100),
    lastName: z.string().min(1).max(100),
    email: z.string().min(1).max(150).email(),
    periodId: z.number().min(0).optional(),
  });

  //validation result
  const validation = schema.safeParse({
    firstName: firstName,
    lastName: lastName,
    email: email,
    periodId: periodId,
  });

  if (!validation.success) {
    //validation failed

    console.error("Form validation failed.");
    return { success: false, error: "Form validation failed." };
  } else {
    //validation successful

    try {
      // Check if a user with the same email already exists
      const existingUser = await prisma.users.findUnique({
        where: { email: email },
      });

      if (existingUser) {
        // User already exists, return an error
        return {
          success: false,
          error: "A student with this email already exists.",
        };
      }

      // If user does not exist, create a new one

      //create an entry in users table,
      //if periodId is passed, create an entry in users_periods table
      await prisma.users.create({
        data: {
          email: email,
          first_name: firstName,
          last_name: lastName,
          users_periods: periodId
            ? {
                create: {
                  period_id: periodId,
                },
              }
            : undefined,
        },
      });

      //successful
      return { success: true };
    } catch (e) {
      //database error
      console.error("prisma error: failed to add student", e);
      return {
        success: false,
        error: "Database error: Failed to add student.",
      };
    }
  }
}
