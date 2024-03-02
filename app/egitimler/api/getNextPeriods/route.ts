import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import logger from "@/winston-config";

const prisma = new PrismaClient();

//return list of periods
export async function GET(): Promise<NextResponse> {
  try {
    //retrieve periods with course name from db
    const nextPeriods = await prisma.curriculum_periods.findMany({
      where: { begins_at: { gt: new Date() } },
      select: {
        id: true,
        begins_at: true,
        ends_at: true,
        curriculum: {
          select: {
            course: { select: { name: true } },
          },
        },
      },
    });

    //check if periods is null
    if (!nextPeriods)
      return NextResponse.json({ error: "No periods found" }, { status: 404 });
    //success
    else
      return NextResponse.json({ nextPeriods: nextPeriods }, { status: 200 });
  } catch (e) {
    //db error
    logger.error("error fetching periods", e);
    return NextResponse.json(
      { error: "Database error: Couldn't fetch periods" },
      { status: 500 },
    );
  }
}
