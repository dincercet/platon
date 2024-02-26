"use server";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import isAdminAuth from "../../actions/isAdminAuth";
var admin = require("firebase-admin.init");
import logger from "winston-config";

const prisma = new PrismaClient();

export default async function deleteStudent(
  studentId: number,
): Promise<{ success: boolean; error?: string }> {
  //check authorization
  if (!(await isAdminAuth())) return { success: false, error: "Unauthorized." };

  //create zod schema
  const schema = z.object({
    studentId: z.number().min(0),
  });

  //validation result
  const validation = schema.safeParse({
    studentId: studentId,
  });

  if (!validation.success) {
    //validation failed

    logger.error("Form validation failed.");
    return { success: false, error: "Form validation failed." };
  } else {
    //validation successful

    try {
      //delete the student based on id
      const deletedUser = await prisma.users.delete({
        where: { id: studentId },
        select: { email: true, did_register: true },
      });

      try {
        //if user signed up to firebase
        if (deletedUser && deletedUser.did_register) {
          //get the user from firebase by passing email
          const fbUser = await admin.auth().getUserByEmail(deletedUser.email);
          //delete the user from firebase
          await admin.auth().deleteUser(fbUser.uid);
        }
      } catch (e) {
        logger.error("firebase error: failed to delete student", e);
        return {
          success: false,
          error: "Firebase error: Failed to delete student.",
        };
      }
      //successful
      return { success: true };
    } catch (e) {
      //database error
      logger.error("prisma error: failed to delete student", e);
      return {
        success: false,
        error: "Database error: Failed to delete student.",
      };
    }
  }
}
