"use server";
var admin = require("firebase-admin.init");
import getUserRole from "app/actions/getUserRole";
import { cookies } from "next/headers";

export default async function isAdminAuth(): Promise<boolean> {
  const cookieStore = cookies();

  //retrieve idToken cookie
  const idToken = cookieStore.get("idToken")?.value;

  if (idToken) {
    //verify token via firebase
    try {
      var user = await admin.auth().verifyIdToken(idToken);
    } catch (e) {
      console.error("firebase: token verification failed", e);
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
        console.error(result.error);
      }
    } catch (e) {
      console.error("getUserRole action: couldn't get user role", e);
      return false;
    }

    //if admin return true
    return role === "ADMIN" ? true : false;
  } else {
    //token not found
    console.error("no token");
    return false;
  }
}
