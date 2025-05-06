import { NextResponse as res } from "next/server";

export async function POST() {

  const response = res.json({ message: "Logout berhasil!" }, { status: 200 });

  try {
    response.cookies.set("accessToken", "", {
      path: "/",
      httpOnly: true,
      expires: new Date(0),
    });
    return response
  } catch (err) {
    console.error(err);
    return res.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
