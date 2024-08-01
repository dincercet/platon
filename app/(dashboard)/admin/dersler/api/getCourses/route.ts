import { NextResponse, type NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";
import isAdminAuth from "app/(dashboard)/admin/actions/isAdminAuth";
import z from "zod";
import logger from "@/winston-config";

const prisma = new PrismaClient();

//return list of courses
export async function GET(request: NextRequest): Promise<NextResponse> {
  //check authorization
  try {
    if (!(await isAdminAuth())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  } catch (e) {
    logger.error("isAdminAuth error", e);
  }

  const param = request.nextUrl.searchParams.get("cursor");

  //if there is cursor passed
  let cursor;
  if (param) {
    cursor = parseInt(param);

    //create zod schema
    const schema = z.object({
      cursor: z.number().min(0),
    });

    //validate parameters
    const validation = schema.safeParse({ cursor: cursor });
    if (!validation.success) {
      console.error("Form validation failed.");
      return NextResponse.json(
        { error: "Form validation failed." },
        { status: 400 },
      );
    }
  }

  try {
    //retrieve courses from db
    const courses = await prisma.courses.findMany({
      take: 5,
      //if there is a cursor, skip 1
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      select: {
        id: true,
        name: true,
        description: true,
        legacy: true,
        curriculums: { select: { course_id: true } },
      },

      orderBy: [{ legacy: "asc" }, { id: "desc" }],
    });

    //use the last course's id as cursor
    const nextCursor = courses[courses.length - 1].id;
    //true if there's no more courses to fetch
    const isFinal = courses.length < 5 ? true : false;

    //if courses not null, return courses
    if (!courses)
      return NextResponse.json({ error: "No courses found" }, { status: 404 });
    else
      return NextResponse.json(
        { courses: courses, nextCursor: nextCursor, isFinal: isFinal },
        { status: 200 },
      );
  } catch (e) {
    //db error
    logger.error("error fetching courses", e);
    return NextResponse.json(
      { error: "Database error: Couldn't fetch courses" },
      { status: 500 },
    );
  }
}
