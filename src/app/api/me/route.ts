import decodeJWT from "@/lib/function";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) {
    return NextResponse.json({ message: "Anda tidak memiliki izin sah!" }, { status: 401 });
  }

  try {
    const user = decodeJWT(token); 

    return NextResponse.json({
      message: "Success",
      user: {
        username: user?.username,
      },
    });
  } catch (error) {
    return NextResponse.json({ message: `Token tidak valid : ${error}` }, { status: 401 });
  }
}
