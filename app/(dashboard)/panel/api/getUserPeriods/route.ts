import { NextResponse, type NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";
import isCorrectUserAuth from "../../actions/isCorrectUserAuth";
import { z } from "zod";
import logger from "@/winston-config";

const prisma = new PrismaClient();

const schema = z.object({ email: z.string().min(1).max(150).email() });

//return list of user's periods
export async function GET(request: NextRequest): Promise<NextResponse> {
  const email = request.nextUrl.searchParams.get("email");

  //check if parameter is empty
  if (!email)
    return NextResponse.json({ error: "Missing parameter." }, { status: 400 });

  const validation = schema.safeParse({ email: email });
  if (!validation.success) {
    //validation failed
    logger.error("Validation failed.");
    return NextResponse.json({ error: "Validation failed." }, { status: 400 });
  }

  //check authorization
  try {
    if (!(await isCorrectUserAuth(email))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  } catch (e) {
    logger.error("isCorrectUserAuth error", e);
  }

  try {
    //retrieve periods with week descriptions and course name
    const userPeriods = await prisma.curriculum_periods.findMany({
      where: { users_periods: { some: { user: { email: email } } } },
      select: {
        id: true,
        begins_at: true,
        ends_at: true,
        curriculum: {
          select: {
            weeks: { select: { week_no: true, description: true } },
            course: { select: { name: true } },
          },
        },
      },
    });

    //check if periods is null
    if (!userPeriods)
      return NextResponse.json(
        { error: "No user periods found" },
        { status: 404 },
      );
    //success
    else
      return NextResponse.json({ userPeriods: userPeriods }, { status: 200 });
  } catch (e) {
    //db error
    logger.error("error fetching user periods", e);
    return NextResponse.json(
      { error: "Database error: Couldn't fetch user periods" },
      { status: 500 },
    );
  }
}
