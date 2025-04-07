import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { userLoginSchema } from "../../../schema/userSchema";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { cookies } from "next/headers";

dotenv.config();
const SECRET_KEY = process.env.JWT_SECRET || "";

export async function POST(req: Request) {
  const cookieStore = await cookies();
  try {
    const body = await req.json();

    const result = userLoginSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { username, password } = result.data;

    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Username tidak ditemukan" },
        { status: 404 }
      );
    }

    if (!user.password) {
      throw new Error("Password not set");
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return NextResponse.json({ error: "Password salah" }, { status: 401 });
    }
    const token = jwt.sign(
      { id: user.id, username: user.username },
      SECRET_KEY,
      { expiresIn: "1h" }
    );

    const response = NextResponse.json(
      {
        message: "Login berhasil",
        user: { id: user.id, username: user.username },
      },
      { status: 200 }
    );

    cookieStore.set("accessToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60,
      path: "/",
      sameSite: "lax",
    });
    return response;
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Terjadi kesalahan di server" },
      { status: 500 }
    );
  }
}
