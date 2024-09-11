import { NextResponse, type NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";
import z from "zod";
import isAdminAuth from "app/(dashboard)/admin/actions/isAdminAuth";

const prisma = new PrismaClient();

//return list of students
export async function GET(request: NextRequest): Promise<NextResponse> {
  //check authorization
  try {
    if (!(await isAdminAuth())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  } catch (e) {
    console.error("isAdminAuth error", e);
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
    //retrieve all students from db
    //deeply nested because need to fetch period and course info as well
    const students = await prisma.users.findMany({
      take: 5,
      //if there is a cursor, skip 1
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      where: { role: "STUDENT" },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        did_register: true,
        users_periods: {
          select: {
            period: {
              select: {
                id: true,
                begins_at: true,
                ends_at: true,
                curriculum: { select: { course: true } },
              },
            },
          },
        },
      },
      orderBy: { id: "desc" },
    });

    //use the last student's id as cursor
    const nextCursor = students[students.length - 1]?.id;
    //true if there's no more students to fetch
    const isFinal = students.length < 5 ? true : false;

    //check if students is null
    if (!students)
      return NextResponse.json(
        { error: "No students found." },
        { status: 404 },
      );
    //success
    else
      return NextResponse.json(
        { students: students, nextCursor: nextCursor, isFinal: isFinal },
        { status: 200 },
      );
  } catch (e) {
    //db error
    console.error("error fetching students", e);
    return NextResponse.json(
      { error: "Database error: Couldn't fetch students." },
      { status: 500 },
    );
  }
}
