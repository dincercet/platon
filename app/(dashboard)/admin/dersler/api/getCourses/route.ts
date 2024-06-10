import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import isAdminAuth from "app/(dashboard)/admin/actions/isAdminAuth";
import logger from "@/winston-config";

const prisma = new PrismaClient();

//return list of courses
export async function GET(): Promise<NextResponse> {
  //check authorization
  try {
    if (!(await isAdminAuth())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  } catch (e) {
    logger.error("isAdminAuth error", e);
  }

  try {
    //retrieve courses from db
    const courses = await prisma.courses.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        legacy: true,
        curriculums: { select: { course_id: true } },
      },
      orderBy: { legacy: "desc" },
    });

    //if courses not null, return courses
    if (!courses)
      return NextResponse.json({ error: "No courses found" }, { status: 404 });
    else return NextResponse.json({ courses: courses }, { status: 200 });
  } catch (e) {
    //db error
    logger.error("error fetching courses", e);
    return NextResponse.json(
      { error: "Database error: Couldn't fetch courses" },
      { status: 500 },
    );
  }
}
