import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import isAdminAuth from "app/(dashboard)/admin/actions/isAdminAuth";
import logger from "@/winston-config";

const prisma = new PrismaClient();

//return list of courses that have curriculums
export async function GET(): Promise<NextResponse> {
  //check authorization
  try {
    if (!(await isAdminAuth())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  } catch (e) {
    logger.error("isAdminAuth error", e);
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

  try {
    //retrieve curriculums with course name from db
    const curriculums = await prisma.course_curriculums.findMany({
      select: {
        id: true,
        created_at: true,
        legacy: true,
        course: { select: { name: true } },
        weeks: { select: { id: true, week_no: true, description: true } },
      },
      orderBy: { legacy: "desc" },
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
      let bindedCurriculums = curriculums.map((curriculum) => {
        return { ...curriculum, isRelated: false };
      });
      //within nested for loops
      for (let i = 0; i < bindedCurriculums.length; i++) {
        for (let j = 0; j < relatedPeriods.length; j++) {
          //compare the ids
          if (bindedCurriculums[i].id === relatedPeriods[j].curriculum_id) {
            //if same, add flag and put it in the new array
            bindedCurriculums[i].isRelated = true;

            //remove the related id so we don't check the same id again
            relatedPeriods.splice(j, 1);
            break;
          }
        }
      }

      //success
      return NextResponse.json(
        { curriculums: bindedCurriculums },
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
