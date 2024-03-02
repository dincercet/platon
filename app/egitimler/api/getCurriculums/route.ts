import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

//return list of courses that have curriculums
export async function GET(): Promise<NextResponse> {
  try {
    //retrieve curriculums with course name from db
    const curriculums = await prisma.course_curriculums.findMany({
      where: { legacy: false },
      select: {
        id: true,
        created_at: true,
        course: { select: { name: true, description: true } },
        weeks: { select: { id: true, week_no: true, description: true } },
      },
    });

    //check if curriculums is null
    if (!curriculums)
      return NextResponse.json(
        { error: "No curriculums found" },
        { status: 404 },
      );
    //success
    else
      return NextResponse.json({ curriculums: curriculums }, { status: 200 });
  } catch (e) {
    //db error
    console.error("error fetching curriculums", e);
    return NextResponse.json(
      { error: "Database error: Couldn't fetch curriculums" },
      { status: 500 },
    );
  }
}
