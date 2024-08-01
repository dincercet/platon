import { NextResponse, type NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";
import isAdminAuth from "app/(dashboard)/admin/actions/isAdminAuth";
import z from "zod";
import logger from "@/winston-config";

const prisma = new PrismaClient();

//return list of courses that have curriculums
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

  //we will have to check if there are related periods
  //if there are any, we need to know on the client side, to show the appropriate button (make legacy or delete)
  let relatedPeriods: { curriculum_id: number }[] | null;
  try {
    //find if there are related periods, if so get the curriculum ids
    relatedPeriods = await prisma.curriculum_periods.findMany({
      select: { curriculum_id: true },
      distinct: ["curriculum_id"],
    });
  } catch (e) {
    logger.error("prisma error fetching related periods", e);
    return NextResponse.json(
      { error: "Database error: Couldn't fetch related periods" },
      { status: 500 },
    );
  }

  let curriculums: any[] | null;
  try {
    //retrieve curriculums with course name from db
    curriculums = await prisma.course_curriculums.findMany({
      take: 5,
      //if there is a cursor, skip 1
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      select: {
        id: true,
        created_at: true,
        legacy: true,
        course: { select: { name: true } },
        weeks: { select: { id: true, week_no: true, description: true } },
      },
      orderBy: [{ legacy: "asc" }, { id: "desc" }],
    });

    //check if curriculums is null
    if (!curriculums) {
      return NextResponse.json(
        { error: "No curriculums found" },
        { status: 404 },
      );
    } else {
      //here we check each related period's curriculum_id and add a flag to each curriculum to show if it's related to a period

      //add a flag to each curriculum
      curriculums = curriculums.map((curriculum) => {
        curriculum.isRelated = false;
        return curriculum;
      });

      //within nested for loops
      for (let i = 0; i < curriculums.length; i++) {
        for (let j = 0; j < relatedPeriods.length; j++) {
          //compare the ids
          if (curriculums[i].id === relatedPeriods[j].curriculum_id) {
            //if same, add flag and put it in the new array
            curriculums[i]["isRelated"] = true;

            //remove the related id so we don't check the same id again
            relatedPeriods.splice(j, 1);
            break;
          }
        }
      }

      //use the last curriculum's id as cursor
      const nextCursor = curriculums[curriculums.length - 1].id;
      //true if there's no more curriculums to fetch
      const isFinal = curriculums.length < 5 ? true : false;

      //success
      return NextResponse.json(
        { curriculums: curriculums, nextCursor: nextCursor, isFinal: isFinal },
        { status: 200 },
      );
    }
  } catch (e) {
    //db error
    logger.error("prisma error fetching curriculums", e);
    return NextResponse.json(
      { error: "Database error: Couldn't fetch curriculums" },
      { status: 500 },
    );
  }
}
