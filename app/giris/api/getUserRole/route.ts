import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

//create zod schema
const schema = z.object({
  email: z.string().min(1).max(100).email(),
});

//return user role based on email
export async function GET(request: NextRequest): Promise<NextResponse> {
  const email = request.nextUrl.searchParams.get("email");

  //if no email provided
  if (!email)
    return NextResponse.json({ error: "Email is missing." }, { status: 400 });

  //validation result
  const validation = schema.safeParse({ email: email });

  if (!validation.success) {
    //validation error

    return NextResponse.json({ error: "Email is invalid." }, { status: 400 });
  } else {
    try {
      //retrieve role from db
      const user = await prisma.users.findUnique({
        where: {
          email: email,
        },
        select: { role: true },
      });

      //success
      return NextResponse.json({ role: user?.role }, { status: 200 });
    } catch (e) {
      //db error
      console.error("error fetching role", e);
      return NextResponse.json(
        { error: "Database error: Couldn't fetch role" },
        { status: 500 },
      );
    }
  }
}
