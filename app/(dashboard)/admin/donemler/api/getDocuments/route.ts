import { NextResponse, type NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";
import isAdminAuth from "app/(dashboard)/admin/actions/isAdminAuth";
import z from "zod";

const prisma = new PrismaClient();

//return list of documents of the period
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

  //validate parameters
  const validation = schema.safeParse({ periodId: periodId });
  if (!validation.success) {
    console.error("Form validation failed.");
    return NextResponse.json(
      { error: "Form validation failed." },
      { status: 400 },
    );
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
    console.log(documents);

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
    console.error("error fetching documents", e);
    return NextResponse.json(
      { error: "Database error: Couldn't fetch documents." },
      { status: 500 },
    );
  }
}
