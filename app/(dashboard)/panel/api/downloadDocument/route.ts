import { NextResponse, type NextRequest } from "next/server";
import { join } from "path";
import isCorrectUserAuth from "../../actions/isCorrectUserAuth";
import z from "zod";
import logger from "@/winston-config";
import { existsSync, readFileSync } from "fs";

//return a document of the period
export async function GET(
  request: NextRequest,
): Promise<NextResponse | Response> {
  const email = request.nextUrl.searchParams.get("email");
  const periodIdParam = request.nextUrl.searchParams.get("periodId");
  const weekNoParam = request.nextUrl.searchParams.get("weekNo");
  const filename = request.nextUrl.searchParams.get("filename");

  //check parameters' presence
  if (!email || !periodIdParam || !weekNoParam || !filename)
    return NextResponse.json(
      { error: "Period parameter is missing." },
      { status: 400 },
    );

  //validation schema
  const schema = z.object({
    email: z.string().min(1).max(150).email(),
    periodId: z.number().min(0),
    weekNo: z.number().min(0),
    filename: z.string().min(1).max(300),
  });

  const periodId = parseInt(periodIdParam);
  const weekNo = parseInt(weekNoParam);

  //validate the parameters
  const validation = schema.safeParse({
    email: email,
    periodId: periodId,
    weekNo: weekNo,
    filename: filename,
  });
  if (!validation.success) {
    //validation failed
    logger.error("Parameter validation failed.");
    return NextResponse.json(
      { error: "Parameter validation failed." },
      { status: 400 },
    );
  }

  //check authorization
  try {
    if (!(await isCorrectUserAuth(email))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  } catch (e) {
    logger.error("isCorrectUserAuth error", e);
  }

  //concatenate the path
  const path = join(
    process.cwd(),
    `/app/documents/${periodId}/${weekNo}/`,
    filename,
  );

  try {
    if (!existsSync(path))
      return NextResponse.json({ error: "No such file" }, { status: 404 });

    let buffer = readFileSync(path);

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (e) {
    //db error
    logger.error("error reading document", e);
    return NextResponse.json(
      { error: "Database error: Couldn't read document." },
      { status: 500 },
    );
  }
}
