import { prisma } from "@/lib/db";
import { NextResponse as res } from "next/server";

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "http://localhost:5173",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function GET() {
  try {
    const jadwal = await prisma.shift.findMany();
    if (jadwal.length > 0) {
      return res.json({
        status: 200,
        success: true,
        data: jadwal,
        headers: {
          "Access-Control-Allow-Origin": "http://localhost:5173",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Content-Type": "application/json",
        },
      });
    } else {
      return res.json({ status: 400, message: "Data tidak ditemukan!" });
    }
  } catch (err) {
    console.log(err);
    return res.json({
      status: 500,
      headers: {
        "Access-Control-Allow-Origin": "http://localhost:5173",
        "Content-Type": "application/json",
      },
      message: "Terjadi kesalahaan saat mengambil data!",
    });
  }
}
