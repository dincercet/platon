import { NextResponse, type NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";
import isCorrectUserAuth from "../../actions/isCorrectUserAuth";
import z from "zod";
import logger from "@/winston-config";

const prisma = new PrismaClient();

//return list of documents of the period
export async function GET(request: NextRequest): Promise<NextResponse> {
  const email = request.nextUrl.searchParams.get("email");
  const periodIdParam = request.nextUrl.searchParams.get("periodId");

  //check parameters' presence
  if (!email || !periodIdParam)
    return NextResponse.json(
      { error: "Period parameter is missing." },
      { status: 400 },
    );

  //validation schema
  const schema = z.object({
    email: z.string().min(1).max(150).email(),
    periodId: z.number().min(0),
  });

  const periodId = parseInt(periodIdParam);

  //validate the parameters
  const validation = schema.safeParse({
    email: email,
    periodId: periodId,
  });
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
    const documents = await prisma.period_weeks.findMany({
      where: { period_id: periodId },
      select: {
        id: true,
        week_no: true,
        documents: { select: { id: true, file_name: true } },
      },
    });

    //check if documents is null
    if (!documents)
      return NextResponse.json(
        { error: "No documents found" },
        { status: 404 },
      );
    //success
    else return NextResponse.json({ documents: documents }, { status: 200 });
  } catch (e) {
    //db error
    logger.error("error fetching documents", e);
    return NextResponse.json(
      { error: "Database error: Couldn't fetch documents." },
      { status: 500 },
    );
  }
}
