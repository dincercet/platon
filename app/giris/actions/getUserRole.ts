"use server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

//return user role based on email
export default async function getUserRole(
  email: string | undefined,
): Promise<string> {
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
      select: { role: true },
    });
    return user.role;
  } catch (e) {
    console.log(e);
    return "error fetching role";
  }
}
