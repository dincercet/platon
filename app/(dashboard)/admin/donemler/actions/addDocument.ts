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
  periodId: number,
  weekNo: number,
  data: FormData,
): Promise<{ success: boolean; error?: string }> {
  //check authorization
  if (!(await isAdminAuth())) return { success: false, error: "Unauthorized." };

  const file: File | null = data.get("file") as unknown as File;

  //check parameters
  if (!file || !periodId || !weekNo) {
    return { success: false, error: "Parameter missing." };
  }

  //create zod schema
  const schema = z.object({
    periodId: z.number().min(0),
    weekNo: z.number().min(0),
  });

  //validate parameters
  const validation = schema.safeParse({ periodId: periodId, weekNo: weekNo });
  if (!validation.success)
    return { success: false, error: "Parameter validation failed." };

  //normalize the filename
  const filename = file.name.replaceAll(" ", "_");

  //concatenate the path
  const path = join(
    process.cwd(),
    `/app/documents/${periodId}/${weekNo}/`,
    filename,
  );

  try {
    //check if file with same name already exists
    const fileFound = await prisma.period_files.findFirst({
      where: { week_no: weekNo, period_id: periodId, file_name: filename },
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
    await prisma.period_files.update({
      where: { period_id: periodId, week_no: weekNo },
      data: { file_name: filename },
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
