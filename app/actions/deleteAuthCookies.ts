"use server";
import { cookies } from "next/headers";

//delete auth cookies on logout
export async function deleteAuthCookies() {
  cookies().delete("idToken");
}
