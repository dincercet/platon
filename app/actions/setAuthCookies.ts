"use server";
import { cookies } from "next/headers";

//set cookies for protected route access
//(timeout?)
export async function setAuthCookies(idToken: string) {
  const cookieStore = await cookies();
  cookieStore.set("idToken", idToken, { sameSite: "strict" });
}
