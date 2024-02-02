"use server";
import { cookies } from "next/headers";

//set cookies for protected route access
//(timeout?)
export async function setAuthCookies(idToken: string) {
  cookies().set("idToken", idToken, { sameSite: "strict" });
}
