"use server";
import { join } from "path";
import { writeFile, unlink } from "fs/promises";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import logger from "@/winston-config";
import isAdminAuth from "../../actions/isAdminAuth";

const prisma = new PrismaClient();

//Add a document to an existing week in that period
export default async function addDocument(
  weekId: number,
  data: FormData,
): Promise<{ success: boolean; error?: string }> {
  //check authorization
  if (!(await isAdminAuth())) return { success: false, error: "Unauthorized." };

  const file: File | null = data.get("file") as unknown as File;

  //check parameters
  if (!file || !weekId) {
    return { success: false, error: "Parameter missing." };
  }

  //create zod schema
  const schema = z.object({
    weekId: z.number().min(0),
  });

  //validate parameters
  const validation = schema.safeParse({ weekId: weekId });
  if (!validation.success)
    return { success: false, error: "Parameter validation failed." };

  //normalize the filename
  const filename = file.name.replaceAll(" ", "_");

  let pathParams;
  try {
    //get the period id and week no to create a path for file
    pathParams = await prisma.period_weeks.findFirst({
      where: { id: weekId },
      select: { period_id: true, week_no: true },
    });
  } catch (e) {
    logger.error("Prisma error: couldn't get path params", e);
    return { success: false, error: "Couldn't get path parameters." };
  }

  //concatenate the path
  const path = join(
    process.cwd(),
    `/app/documents/${pathParams?.period_id}/${pathParams?.week_no}/`,
    filename,
  );

  try {
    //check if file with same name already exists
    const fileFound = await prisma.period_weeks.findFirst({
      where: {
        week_no: pathParams?.week_no,
        period_id: pathParams?.period_id,
        documents: { some: { file_name: filename } },
      },
    });

    if (fileFound)
      return { success: false, error: "File with same name already exists." };
  } catch (e) {
    logger.error("Prisma error checking file duplication", e);
    return { success: false, error: "Couldn't check if file already exists." };
  }

  //read the file and put it in a buffer
  let buffer;
  try {
    const bytes = await file.arrayBuffer();
    buffer = Buffer.from(bytes);
  } catch (e) {
    return { success: false, error: "Couldn't read file." };
  }

  try {
    //create the file
    await writeFile(path, buffer);
    logger.info(`open ${path} to see the uploaded file`);
  } catch (e) {
    logger.error("Error writing file", e);
    return { success: false, error: "Couldn't write file." };
  }

  try {
    //create the database entry for finding file location
    await prisma.week_documents.create({
      data: { week_id: weekId, file_name: filename },
    });
    return { success: true }; //successful
  } catch (e) {
    logger.error("Prisma error: couldn't add file to database", e);

    try {
      //delete the file from path to keep the folder in sync with database
      await unlink(path);
    } catch (e) {
      logger.error("Error deleting file after prisma failure.", e);
    }

    return { success: false, error: "Couldn't add file to database." };
  }
}
