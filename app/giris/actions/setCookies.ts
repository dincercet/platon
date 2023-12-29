"use server";
import { cookies } from "next/headers";

//set cookies for protected route access
//(timeout?)
export async function setCookies(idToken: string) {
  cookies().set("idToken", idToken);
}
