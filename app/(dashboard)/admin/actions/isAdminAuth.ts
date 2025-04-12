"use server";
var admin = require("firebase-admin.init");
import getUserRole from "app/actions/getUserRole";
import { cookies } from "next/headers";
import logger from "winston-config";

export default async function isAdminAuth(): Promise<boolean> {
  const cookieStore = await cookies();

  //retrieve idToken cookie
  const idToken = cookieStore.get("idToken")?.value;

  if (idToken) {
    //verify token via firebase
    try {
      var user = await admin.auth().verifyIdToken(idToken);
    } catch (e) {
      logger.error("firebase: token verification failed", e);
      return false;
    }

    //get user role from db
    let role;
    try {
      const result = await getUserRole(user.email);
      if (result.success) {
        role = result.role;
      } else {
        //error returned from getUserRole
        logger.error(result.error);
      }
    } catch (e) {
      logger.error("getUserRole action: couldn't get user role", e);
      return false;
    }

    //if admin return true
    return role === "ADMIN" ? true : false;
  } else {
    //token not found
    logger.error("no token");
    return false;
  }
}
