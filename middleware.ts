import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { initializeApp } from "firebase-admin/app";

export default function middleware(request: NextRequest) {
  const app = initializeApp();

  if (request.nextUrl.pathname.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/", request.url));
  } else if (request.nextUrl.pathname.startsWith("/student")) {
    return NextResponse.redirect(new URL("/", request.url));
  }
}

export const config = {
  matcher: ["/admin/:path*", "/student/:path*"],
};
