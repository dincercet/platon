import { NextResponse, type NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";
import isAdminAuth from "app/(dashboard)/admin/actions/isAdminAuth";
import { z } from "zod";

const prisma = new PrismaClient();

//return curriculum based on period
export async function GET(request: NextRequest): Promise<NextResponse> {
  //check authorization
  try {
    if (!(await isAdminAuth())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  } catch (e) {
    console.error("isAdminAuth error", e);
  }

  const param = request.nextUrl.searchParams.get("curriculumId");
  if (!param)
    return NextResponse.json({ error: "Email is missing." }, { status: 400 });

  const curriculumId = parseInt(param);

  //create zod schema
  const schema = z.object({
    curriculumId: z.number().min(0),
  });

  //validation result
  const validation = schema.safeParse({
    curriculumId: curriculumId,
  });

  if (!validation.success) {
    //validation failed

    console.error("Form validation failed.");
    return NextResponse.json(
      { error: "Form validation failed." },
      { status: 400 },
    );
  } else {
    try {
      //retrieve curriculums with course name from db
      const curriculum = await prisma.course_curriculums.findUnique({
        where: { id: curriculumId },
        select: {
          created_at: true,
          course: { select: { name: true } },
          weeks: { select: { week_no: true, description: true } },
        },
      });

      //check if curriculum is null
      if (!curriculum)
        return NextResponse.json(
          { error: "No curriculum found" },
          { status: 404 },
        );
      //success
      else
        return NextResponse.json({ curriculum: curriculum }, { status: 200 });
    } catch (e) {
      //db error
      console.error("error fetching curriculums", e);
      return NextResponse.json(
        { error: "Database error: Couldn't fetch curriculums" },
        { status: 500 },
      );
    }
  }
}
