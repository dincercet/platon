"use server";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import isAdminAuth from "../../actions/isAdminAuth";
import logger from "@/winston-config";

const prisma = new PrismaClient();

export default async function editCourse(
  id: number,
  name: string,
  description: string,
): Promise<{ success: boolean; error?: string }> {
  //check authorization
  if (!(await isAdminAuth())) return { success: false, error: "Unauthorized." };

  //create zod schema
  const schema = z.object({
    id: z.number().min(0),
    name: z.string().min(1).max(150),
    description: z.string().min(1).max(500),
  });

  //validation result
  const validation = schema.safeParse({
    id: id,
    name: name,
    description: description,
  });

  if (!validation.success) {
    //validation failed

    logger.error("Form validation failed.");
    return { success: false, error: "Form validation failed." };
  } else {
    //validation successful

    try {
      //update the course based on id
      await prisma.courses.update({
        where: { id },
        data: { name: name, description: description },
      });

      //successful
      return { success: true };
    } catch (e) {
      //database error
      logger.error("prisma error: failed to edit course", e);
      return {
        success: false,
        error: "Database error: Failed to edit course.",
      };
    }
  }
}
