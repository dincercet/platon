import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import isAdminAuth from "app/(dashboard)/admin/actions/isAdminAuth";

const prisma = new PrismaClient();

//return list of periods
export async function GET(): Promise<NextResponse> {
  //check authorization
  try {
    if (!(await isAdminAuth())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  } catch (e) {
    console.error("isAdminAuth error", e);
  }

  try {
    //retrieve periods with course name from db
    const periods = await prisma.curriculum_periods.findMany({
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
    if (!periods)
      return NextResponse.json({ error: "No periods found" }, { status: 404 });
    //success
    else return NextResponse.json({ periods: periods }, { status: 200 });
  } catch (e) {
    //db error
    console.error("error fetching periods", e);
    return NextResponse.json(
      { error: "Database error: Couldn't fetch periods" },
      { status: 500 },
    );
  }
}
