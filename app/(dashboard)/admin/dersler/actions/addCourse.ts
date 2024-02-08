"use server";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import isAdminAuth from "../../actions/isAdminAuth";

const prisma = new PrismaClient();

export default async function addCourse(
  name: string,
  description: string,
): Promise<{ success: boolean; error?: string }> {
  //check authorization
  if (!(await isAdminAuth())) return { success: false, error: "Unauthorized." };

  //create zod schema
  const schema = z.object({
    name: z.string().min(1).max(150),
    description: z.string().min(1).max(500),
  });

  //validation result
  const validation = schema.safeParse({ name: name, description: description });

  if (!validation.success) {
    //validation failed

    console.error("Form validation failed.");
    return { success: false, error: "Form validation failed." };
  } else {
    //validation successful

    try {
      //create an entry in courses table
      await prisma.courses.create({
        data: { name: name, description: description },
      });

      //successful
      return { success: true };
    } catch (e) {
      //database error
      console.error("prisma error: failed to add course", e);
      return { success: false, error: "Database error: Failed to add course." };
    }
  }
}
