import { prisma } from "@/lib/db";
import { NextResponse as res } from "next/server";
import { NextRequest } from "next/server";

export async function GET() {
  try {
    const soddiagrams = await prisma.diagramsod.findMany();
    if (soddiagrams.length > 0) {
      return res.json({ status: 200, success: true, data: soddiagrams });
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

export async function DELETE(req: NextRequest) {
  try {
    const customer = req.nextUrl.searchParams.get("customer");
    const cycle = req.nextUrl.searchParams.get("cycle") || "";

    if (!customer || !cycle) {
      return res.json(
        { message: "Tidak diketahui" },
        {
          status: 400,
        }
      );
    }

    const deletedData = await prisma.soddiagram.deleteMany({
      where: {
        customerName: customer,
        cycle: Number(cycle),
      },
    });

    if (deletedData.count === 0) {
      return res.json({ message: "No matching data found" }, { status: 404 });
    }
    return res.json({ message: "Data berhasil dihapus!" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting data:", error);
    return res.json(
      { message: "Terjadi kesalahan saat menghapus data!" },
      {
        status: 500,
      }
    );
  }
}
