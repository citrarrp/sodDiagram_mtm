import { NextResponse as res, NextRequest } from "next/server";
import { prisma } from "@/lib/db";

interface UpdateRow {
  id: number;
  customerName: string;
  processName: string;
  cycle: string;
  waktu: string;
  durasi: string;
}

interface UpdatePayload {
  customerName: string;
  cycle: number;
  updates: UpdateRow[];
}

// export async function POST(req: NextRequest) {
//   try {
//     const process: UpdatePayload = req.body

//     const { customerName, cycle, updates } = body;

//     const created = await prisma.soddiagram.createMany({
//         data: {
//          process
//         },

//       })
//     return res.json({ message: "Data updated successfully" }, { status: 200 });
//   } catch (error) {
//     console.error("Error updating data:", error);
//     return res.json({ message: "Internal server error" }, { status: 500 });
//   }
// }

export async function PUT(req: NextRequest) {
  try {
    const body: UpdatePayload = await req.json();

    const { customerName, cycle, updates } = body;

    const existingData = await prisma.soddiagram.findMany({
      where: {
        customerName: customerName,
        cycle: cycle,
      },
    });

    if (existingData.length === 0) {
      return res.json({ message: "No matching data found" }, { status: 404 });
    }

    const updatePromises = updates.map((row) =>
      prisma.soddiagram.update({
        where: { id: row.id },
        data: {
          processName: row.processName,
          waktu: row.waktu
            ? new Date(`1970-01-01T${row.waktu}Z`).toISOString()
            : null,
          durasi: row.durasi
            ? new Date(`1970-01-01T${row.durasi}Z`).toISOString()
            : null,
        },
      })
    );

    await Promise.all(updatePromises);

    return res.json({ message: "Data updated successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error updating data:", error);
    return res.json({ message: "Internal server error" }, { status: 500 });
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

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;

    const [customerNameRaw, cycleRaw] = id.split("-");
    const customerName = decodeURIComponent(customerNameRaw);
    const cycle = decodeURIComponent(cycleRaw);

    const sodDiagram = await prisma.soddiagram.findMany({
      where: {
        customerName: customerName,
        cycle: parseInt(cycle),
      },
    });

    if (!sodDiagram) {
      return res.json({ status: 404, message: "Data Not Found" });
    }

    return res.json({
      status: 200,
      success: true,
      data: sodDiagram,
    });
  } catch (err) {
    console.error("Error fetching data: ", err);
    return res.json(
      { status: 500, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
