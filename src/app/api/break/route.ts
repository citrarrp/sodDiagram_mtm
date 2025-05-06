import { prisma } from "@/lib/db";
import { NextResponse as res } from "next/server";

export async function GET() {
  try {
    const Break = await prisma.istirahat.findMany();
    if (Break.length > 0) {
      return res.json({ status: 200, success: true, data: Break });
    } else {
      return res.json({ status: 400, message: "Data tidak ditemukan!" });
    }
  } catch (err) {
    console.log(err);
    return res.json({ status: 500, message: "Terjadi kesalahan saat mengambil data!" });
  }
}
