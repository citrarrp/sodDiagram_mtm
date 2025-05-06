import { prisma } from "@/lib/db";
import { NextRequest, NextResponse as res } from "next/server";

export async function GET() {
  try {
    const users = await prisma.user.findMany();
    if (users.length > 0) {
      return res.json({ status: 200, success: true, data: users });
    } else {
      return res.json({ status: 400, message: "Data tidak ditemukan!" });
    }
  } catch (err) {
    console.log(err);
    return res.json({
      status: 500,
      message: "Terjadi kesalahan saat mengambil data!",
    });
  }
}


export async function DELETE(
    req: NextRequest,

  ) {
    try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id')
  
      if (!id) {
        return new Response(
          JSON.stringify({ message: "Data user tidak diketahui!" }),
          {
            status: 400,
          }
        );
      }
  
      const deletedData = await prisma.user.deleteMany({
        where: {
          id: Number(id),
        },
      });
  
      if (deletedData.count === 0) {
        return new Response(
          JSON.stringify({ message: "No matching data found" }),
          { status: 404 }
        );
      }
      return new Response(JSON.stringify({ message: "Data berhasil dihapus" }), {
        status: 200,
      });
    } catch (error) {
      console.error("Error deleting data:", error);
      return new Response(JSON.stringify({ message: "Internal Server Error" }), {
        status: 500,
      });
    }
  }
  
