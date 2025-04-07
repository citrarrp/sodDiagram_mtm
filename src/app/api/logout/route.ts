import { NextResponse as res } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();
  try {
    cookieStore.set("accessToken", "", {
      path: "/",
      httpOnly: true,
      expires: new Date(0),
    });
    return res.json({ message: "Logout successful" }, { status: 200 });
  } catch (err) {
    console.error(err);
    return res.json({ message: "Method Not Allowed" }, { status: 405 });
  }
}
