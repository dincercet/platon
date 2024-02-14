import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import isAdminAuth from "app/(dashboard)/admin/actions/isAdminAuth";

const prisma = new PrismaClient();

//return list of courses that have curriculums
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
    //retrieve curriculums with course name from db
    const curriculums = await prisma.course_curriculums.findMany({
      select: {
        id: true,
        created_at: true,
        legacy: true,
        course: { select: { name: true } },
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
