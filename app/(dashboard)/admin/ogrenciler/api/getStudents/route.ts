import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import isAdminAuth from "app/(dashboard)/admin/actions/isAdminAuth";

const prisma = new PrismaClient();

//return list of students
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
    //retrieve all students from db
    //deeply nested because need to fetch period and course info as well
    const students = await prisma.users.findMany({
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

    //check if students is null
    if (!students)
      return NextResponse.json(
        { error: "No students found." },
        { status: 404 },
      );
    //success
    else return NextResponse.json({ students: students }, { status: 200 });
  } catch (e) {
    //db error
    console.error("error fetching students", e);
    return NextResponse.json(
      { error: "Database error: Couldn't fetch students." },
      { status: 500 },
    );
  }
}
