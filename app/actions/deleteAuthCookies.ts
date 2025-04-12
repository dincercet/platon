"use server";
import { cookies } from "next/headers";

//todo: check the sameSite not defined error on logout
//todo: check if secure

//delete auth cookies on logout
export async function deleteAuthCookies() {
  await cookies().delete({ name: "idToken", sameSite: "strict" });
}
