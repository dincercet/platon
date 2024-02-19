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

  const param = request.nextUrl.searchParams.get("periodId");
  if (!param)
    return NextResponse.json(
      { error: "Period parameter is missing." },
      { status: 400 },
    );

  const periodId = parseInt(param);

  //create zod schema
  const schema = z.object({
    periodId: z.number().min(0),
  });

  //validation result
  const validation = schema.safeParse({
    periodId: periodId,
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
      //retrieve students of that period from db
      const students = await prisma.users_periods.findMany({
        where: { period_id: periodId },
        select: {
          user: {
            select: {
              id: true,
              email: true,
              first_name: true,
              last_name: true,
            },
          },
        },
      });

      //check if students is null
      if (!students.length)
        return NextResponse.json(
          { error: "No student found" },
          { status: 404 },
        );
      //success
      else return NextResponse.json({ students: students }, { status: 200 });
    } catch (e) {
      //db error
      console.error("error fetching students", e);
      return NextResponse.json(
        { error: "Database error: Couldn't fetch students" },
        { status: 500 },
      );
    }
  }
}
