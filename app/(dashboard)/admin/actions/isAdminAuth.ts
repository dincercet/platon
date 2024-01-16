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
      console.log(e, "token verification failed");
      return false;
    }
    console.log("email: ", user.email);
    //get user role from db
    try {
      var role = await getUserRole(user.email);
    } catch {
      console.log("couldn't get user role");
      return false;
    }
    console.log("role: ", role);
    //if admin return true
    return role === "ADMIN" ? true : false;
  } else {
    //token not found
    console.log("no token");
    return false;
  }
}
