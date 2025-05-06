import { prisma } from "@/lib/db";
import { NextResponse as res } from "next/server";

export async function GET() {
  try {
    const jadwal = await prisma.shift.findMany();
    if (jadwal.length > 0) {
      return res.json({ status: 200, success: true, data: jadwal });
    } else {
      return res.json({ status: 400, message: "Data tidak ditemukan!" });
    }
  } catch (err) {
    console.log(err);
    return res.json({ status: 500, message: "Terjadi kesalahaan saat mengambil data!" });
  }
}
