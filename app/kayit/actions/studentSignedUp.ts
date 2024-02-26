"use server";

import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import isUserAuth from "app/(dashboard)/panel/actions/isUserAuth";
import logger from "winston-config";

const prisma = new PrismaClient();

export default async function studentSignedUp(
  email: string,
): Promise<{ success: boolean; error?: string }> {
  //check authorization
  if (!(await isUserAuth())) return { success: false, error: "Unauthorized." };

  //create zod schema
  const schema = z.object({
    email: z.string().min(1).max(150),
  });

  //validation result
  const validation = schema.safeParse({
    email: email,
  });

  if (!validation.success) {
    //validation failed

    logger.error("Form validation failed.");
    return { success: false, error: "Form validation failed." };
  } else {
    //validation successful

    try {
      //check if user already registered
      const user = await prisma.users.findUnique({
        where: { email: email },
        select: { did_register: true },
      });

      //if registered, return error
      if (user?.did_register) {
        logger.error(email + " User already registered.");
        return { success: false, error: "User already registered." };
      }

      //update the course based on id
      await prisma.users.update({
        where: { email: email },
        data: { did_register: true },
      });

      //successful
      return { success: true };
    } catch (e) {
      //database error
      logger.error(
        "prisma error: failed to update user's registered status",
        e,
      );
      return {
        success: false,
        error: "Database error: Failed to update user's registered status.",
      };
    }
  }
}
