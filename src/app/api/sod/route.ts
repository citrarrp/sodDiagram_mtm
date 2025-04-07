import { prisma } from "@/lib/db";
import { NextResponse as res, NextRequest } from "next/server";
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
export async function POST(req: NextRequest) {
  const body: UpdatePayload = await req.json();
  const { customerName, cycle, updates }: UpdatePayload = body;
  const cleanedUpdates = updates.map((row) => ({
    ...row,
    waktu: row.waktu === "" ? null : row.waktu,
  }));

  try {
    const dataToInsert = cleanedUpdates.map((row) => {
      const isBreakOrWaiting =
        row.processName === "ISTIRAHAT" ||
        row.processName === "WAITING SHIPPING AREA";

      return {
        customerName: customerName,
        cycle: cycle,
        processName: row.processName,
        waktu: isBreakOrWaiting
          ? null
          : row.waktu
          ? new Date(`1970-01-01T${row.waktu}Z`).toISOString()
          : null,
        durasi: row.durasi
          ? new Date(`1970-01-01T${row.durasi}Z`).toISOString()
          : null,
      };
    });

    await prisma.soddiagram.createMany({
      data: dataToInsert,
    });

    return res.json({ message: "Data saved successfully!" }, { status: 200 });
  } catch (err) {
    console.error(err);
    return res.json({ error: "Failed to save data" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const soddiagrams = await prisma.soddiagram.findMany();
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
