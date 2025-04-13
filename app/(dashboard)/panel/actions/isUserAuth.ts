"use server";
var admin = require("firebase-admin.init");
import { cookies } from "next/headers";
import logger from "@/winston-config";

export default async function isUserAuth(): Promise<boolean> {
  const cookieStore = await cookies();

  //retrieve idToken cookie
  const idToken = cookieStore.get("idToken")?.value;

  if (idToken) {
    //verify token via firebase
    try {
      await admin.auth().verifyIdToken(idToken);
    } catch (e) {
      logger.error("firebase: token verification failed", e);
      return false;
    }

    //success
    return true;
  } else {
    //token not found
    logger.error("no token");
    return false;
  }
}
