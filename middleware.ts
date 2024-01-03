import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import app from "firebase-admin.init";
import getUserRole from "app/giris/actions/getUserRole";

export async function middleware(request: NextRequest) {
  console.log("request url: " + request.url);
  const idToken = request.cookies.get("idToken")?.value;

  if (idToken) {
    try {
      var user = await app.verifyIdToken(idToken);
    } catch {
      return NextResponse.json(
        { success: false, message: "token verification failed" },
        { status: 401 },
      );
    }

    try {
      var role = await getUserRole(user.email);
    } catch {
      return NextResponse.json(
        { success: false, message: "couldn't fetch role" },
        { status: 401 },
      );
    }

    if (request.nextUrl.pathname.startsWith("/admin")) {
      return role === "admin"
        ? NextResponse.next()
        : NextResponse.redirect(new URL("/", request.url));
    } else if (request.nextUrl.pathname.startsWith("/student")) {
      return role === "user"
        ? NextResponse.next()
        : NextResponse.redirect(new URL("/", request.url));
    }
  } else {
    console.log("id token missing");
    return NextResponse.redirect(new URL("/", request.url));
  }
}

export const config = {
  matcher: ["/admin:path*", "/student:path*"],
};
