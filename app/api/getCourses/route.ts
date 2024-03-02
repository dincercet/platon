import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import logger from "@/winston-config";

const prisma = new PrismaClient();

//return list of courses
export async function GET(): Promise<NextResponse> {
  try {
    //retrieve courses from db
    const courses = await prisma.courses.findMany({ where: { legacy: false } });

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
