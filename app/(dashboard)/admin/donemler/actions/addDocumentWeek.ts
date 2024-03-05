"use server";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import logger from "@/winston-config";
import isAdminAuth from "../../actions/isAdminAuth";

const prisma = new PrismaClient();

export default async function addDocumentWeek(
  periodId: number,
  weekNo: number,
): Promise<{ success: boolean; weekId?: number; error?: string }> {
  //check authorization
  if (!(await isAdminAuth())) return { success: false, error: "Unauthorized." };

  //create zod schema
  const schema = z.object({
    periodId: z.number().min(0),
    weekNo: z.number().min(0),
  });

  //validate parameters
  const validation = schema.safeParse({ periodId: periodId, weekNo: weekNo });
  if (!validation.success)
    return { success: false, error: "Parameter validation failed." };

  try {
    const addedWeek = await prisma.period_weeks.create({
      data: { week_no: weekNo, period_id: periodId },
      select: { id: true },
    });

    return addedWeek.id
      ? { success: true, weekId: addedWeek.id } //successful
      : { success: false, error: "Failed to add document week." }; //no week id returned
  } catch (e) {
    //database error
    logger.error("prisma error: failed to add document week", e);
    return {
      success: false,
      error: "Database error: Failed to add document week.",
    };
  }
}
