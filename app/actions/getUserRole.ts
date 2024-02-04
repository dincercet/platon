"use server";

import { z } from "zod";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function getUserRole(
  email: string,
): Promise<{ success: boolean; role?: string; error?: string }> {
  //create zod schema
  const schema = z.object({
    email: z.string().min(1).max(100).email(),
  });

  //validation result
  const validation = schema.safeParse({ email: email });

  if (!validation.success) {
    //validation error
    return { success: false, error: "Email validation failed." };
  } else {
    try {
      //fetch user role based on email
      const user = await prisma.user.findUnique({
        where: {
          email: email,
        },
        select: { role: true },
      });

      //fetching role success
      return { success: true, role: user.role };
    } catch (e) {
      //fetching role error
      console.error("prisma error: failed fetching role", e);
      return { success: false, error: "Database error: Couldn't fetch role." };
    }
  }
}
