import { NextApiRequest, NextApiResponse } from "next";
import { serialize } from "cookie";

export default function POST(req: NextApiRequest, res: NextApiResponse) {
  try {
    res.setHeader(
      "Set-Cookie",
      serialize("accessToken", "", {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        expires: new Date(0),
      })
    );

    return res.status(200).json({ message: "Logout successful" });
  } catch (err) {
    console.error(err);
    return res.status(405).json({ message: "Method Not Allowed" });
  }
}
