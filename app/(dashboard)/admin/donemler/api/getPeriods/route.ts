import { NextResponse, type NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";
import isAdminAuth from "app/(dashboard)/admin/actions/isAdminAuth";
import z from "zod";
import logger from "@/winston-config";

const prisma = new PrismaClient();

//return list of periods
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
    //retrieve periods with course name from db
    const periods = await prisma.curriculum_periods.findMany({
      take: 5,
      //if there is a cursor, skip 1
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      select: {
        id: true,
        begins_at: true,
        ends_at: true,
        curriculum: {
          select: {
            id: true,
            created_at: true,
            course: { select: { name: true } },
          },
        },
      },
      orderBy: { id: "desc" },
    });

    //use the last period's id as cursor
    const nextCursor = periods[periods.length - 1]?.id;
    //true if there's no more periods to fetch
    const isFinal = periods.length < 5 ? true : false;

    //check if periods is null
    if (!periods)
      return NextResponse.json({ error: "No periods found" }, { status: 404 });
    //success
    else
      return NextResponse.json(
        { periods: periods, nextCursor: nextCursor, isFinal: isFinal },
        { status: 200 },
      );
  } catch (e) {
    //db error
    logger.error("error fetching periods", e);
    return NextResponse.json(
      { error: "Database error: Couldn't fetch periods" },
      { status: 500 },
    );
  }
}
