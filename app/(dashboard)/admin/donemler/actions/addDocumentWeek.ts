"use server";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import logger from "@/winston-config";
import isAdminAuth from "../../actions/isAdminAuth";

const prisma = new PrismaClient();

export default async function addDocument(
  periodId: number,
): Promise<{ success: boolean; error?: string }> {
  //check authorization
  if (!(await isAdminAuth())) return { success: false, error: "Unauthorized." };

  //create zod schema
  const schema = z.object({
    periodId: z.number().min(0),
  });

  //validate parameters
  const validation = schema.safeParse({ periodId: periodId });
  if (!validation.success)
    return { success: false, error: "Parameter validation failed." };
}
