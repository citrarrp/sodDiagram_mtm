import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

function getLocalISODate() {
  const now: Date = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  const localISO = new Date(now.getTime() - offset).toISOString();
  return localISO;
}

export async function POST(req: Request) {
  try {
    const { id, username, password } = await req.json();
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        id: id,
        username: username,
        password: hashedPassword,
        createAt: getLocalISODate(),
      },
    });

    return NextResponse.json({ message: "User registered", user: newUser });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error registering user" },
      { status: 500 }
    );
  }
}
