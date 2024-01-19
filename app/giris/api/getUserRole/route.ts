import { NextResponse, type NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

//return user role based on email
export default async function GET(request: NextRequest): Promise<NextResponse> {
  const email = request.nextUrl.searchParams.get("email");
  try {
    //if email param is present
    if (email) {
      //retrieve role from db
      const user = await prisma.user.findUnique({
        where: {
          email: email,
        },
        select: { role: true },
      });
      return NextResponse.json({ role: user?.role }, { status: 200 });
    } else {
      //if no email param is present
      return NextResponse.json({ error: "no email provided" }, { status: 400 });
    }
  } catch (e) {
    //db error
    console.error("error fetching role", e);
    return NextResponse.json({ error: "error fetching role" }, { status: 500 });
  }
}
