import { NextResponse as res, NextRequest } from "next/server";
import { prisma } from "@/lib/db";
// export async function PUT(
//   req: Request,
//   { params }: { params: { id: string } }
// ) {
//   const {
//     customerName,
//     processName,
//     cycle,
//     id_process,
//     waktu,
//     kode
//   } = await req.json();
//   try {
//     const diagramSOD = await prisma.diagramsod.update({
//       where: { id: parseInt(params.id) },
//       data: {
//         customerName,
//         processName,
//         cycle,
//         id_process,
//         waktu,
//         kode
//       },
//     });
//     if (params.id) {
//       return res.json({ status: 200, success: true, data: diagramSOD });
//     } else {
//       return res.json({ status: 400, message: "Data Not Found" });
//     }
//   } catch (err) {
//     console.log(err);
//     return res.json({ status: 500, message: "Internal server error" });
//   }
// }

// export async function GETById(req, { params }) {
//   try {
//     const { id } = params;

//     const [customerName, cycle] = id.split("-");

//     const soddiagrams = await prisma.diagramsod.findFirst({
//       where: {
//         customerName: customerName,
//         cycle: cycle
//       }
//     });

//     if (soddiagrams) {
//       return res.json({ status: 200, success: true, data: soddiagrams });
//     } else {
//       return res.json({ status: 404, message: "Data Not Found" });
//     }
//   } catch (err) {
//     console.log(err);
//     return res.json({ status: 500, message: "Internal server error" });
//   }
// }

interface UpdateRow {
  id: number;
  processName: string;
  kode: string;
  waktu: string;
  id_process: number;
}

interface UpdatePayload {
  customerName: string;
  cycle: number;
  updates: UpdateRow[];
}

export async function PUT(req: NextRequest) {
  try {
    const body: UpdatePayload = await req.json();

    const { customerName, cycle, updates } = body;

    const existingData = await prisma.diagramsod.findMany({
      where: {
        customerName: customerName,
        cycle: cycle,
      },
    });

    if (existingData.length === 0) {
      return res.json({ message: "No matching data found" }, { status: 404 });
    }

    const updatePromises = updates.map((row) =>
      prisma.diagramsod.update({
        where: { id: row.id },
        data: {
          processName: row.processName,
          kode: row.kode,
          waktu: row.waktu ? new Date(`1970-01-01T${row.waktu}`) : null,
          id_process: row.id_process,
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

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = (await params).id;

    const [customerNameRaw, cycleRaw] = id.split("-");
    const customerName = decodeURIComponent(customerNameRaw);
    const cycle = decodeURIComponent(cycleRaw);

    const sodDiagram = await prisma.diagramsod.findMany({
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

// export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
//   try {
//     const { id } = params;
//     const { cycleProcess }: { cycleProcess: Task[] } = await req.json();

//     const [customerNameRaw, cycleRaw] = id.split("-");
//     const customerName = decodeURIComponent(customerNameRaw);
//     const cycle = parseInt(decodeURIComponent(cycleRaw));

//     const updated = await prisma.diagramsod.updateMany({
//       where: {
//         customerName,
//         cycle,
//       },
//       data: {
//         cycleProcess,
//       },
//     });

//     if (updated.count === 0) {
//       return res.json(
//         { status: 404, message: "Data Not Found" },
//         { status: 404 }
//       );
//     }

//     return res.json({
//       status: 200,
//       success: true,
//       message: "Updated successfully",
//     });
//   } catch (err) {
//     console.error("Error updating data: ", err);
//     return res.json(
//       { status: 500, message: "Internal Server Error" },
//       { status: 500 }
//     );
//   }
// }

// export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
//   try {
//     const { id } = params;
//     const { cycleProcess }: { cycleProcess: Task[] } = await req.json();

//     const [customerNameRaw, cycleRaw] = id.split("-");
//     const customerName = decodeURIComponent(customerNameRaw);
//     const cycle = parseInt(decodeURIComponent(cycleRaw));

//     const updated = await prisma.diagramsod.updateMany({
//       where: {
//         customerName,
//         cycle,
//       },
//       data: {
//         cycleProcess,
//       },
//     });

//     if (updated.count === 0) {
//       return res.json(
//         { status: 404, message: "Data Not Found" },
//         { status: 404 }
//       );
//     }

//     return res.json({
//       status: 200,
//       success: true,
//       message: "Updated successfully",
//     });
//   } catch (err) {
//     console.error("Error updating data: ", err);
//     return res.json(
//       { status: 500, message: "Internal Server Error" },
//       { status: 500 }
//     );
//   }
// }
