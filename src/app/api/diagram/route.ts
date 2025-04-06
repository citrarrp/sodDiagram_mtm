import { prisma } from "@/lib/db";
import { NextResponse as res } from "next/server";
import { NextRequest } from "next/server";

export async function GET() {
  try {
    const soddiagrams = await prisma.diagramsod.findMany();
    if (soddiagrams.length > 0) {
      return res.json({ status: 200, success: true, data: soddiagrams });
    } else {
      return res.json({ status: 400, message: "Data Not Found" });
    }
  } catch (err) {
    console.log(err);
    return res.json({ status: 500, message: "Internal server error" });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const customer = req.nextUrl.searchParams.get("customer");
    const cycle = req.nextUrl.searchParams.get("cycle") || "";

    if (!customer || !cycle) {
      return new Response(JSON.stringify({ message: "Missing parameters" }), {
        status: 400,
      });
    }

    const deletedData = await prisma.soddiagram.deleteMany({
      where: {
        customerName: customer,
        cycle: Number(cycle),
      },
    });

    if (deletedData.count === 0) {
      return new Response(
        JSON.stringify({ message: "No matching data found" }),
        { status: 404 }
      );
    }
    return new Response(
      JSON.stringify({ message: "Data deleted successfully" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting data:", error);
    return new Response(JSON.stringify({ message: "Internal Server Error" }), {
      status: 500,
    });
  }
}