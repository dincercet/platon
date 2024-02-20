"use server";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import isAdminAuth from "../../actions/isAdminAuth";

const prisma = new PrismaClient();

export default async function editStudent(
  studentId: number,
  email: string,
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
    email: z.string().min(1).max(150).email(),
  });

  //validation result
  const validation = schema.safeParse({
    studentId: studentId,
    firstName: firstName,
    lastName: lastName,
    email: email,
  });

  if (!validation.success) {
    //validation failed

    console.error("Form validation failed.");
    return { success: false, error: "Form validation failed." };
  } else {
    //validation successful

    try {
      //update the student based on id
      await prisma.users.update({
        where: { id: studentId },
        data: {
          email: email,
          first_name: firstName,
          last_name: lastName,
        },
      });

      //successful
      return { success: true };
    } catch (e) {
      //database error
      console.error("prisma error: failed to edit student", e);
      return {
        success: false,
        error: "Database error: Failed to edit student.",
      };
    }
  }
}
