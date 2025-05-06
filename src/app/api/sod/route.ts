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
  const date = new Date();
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
        updateMonth: date.toLocaleString('default', { month: 'long' })
      };
    });

    await prisma.soddiagram.createMany({
      data: dataToInsert,
    });

    return res.json({ message: "Data berhasil disimpan!" }, { status: 200 });
  } catch (err) {
    console.error(err);
    return res.json({ error: "Terjadi kesalahan saat menyimpan data!" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    let page = parseInt(searchParams.get("page") || "1");
    let limit = parseInt(searchParams.get("limit") || "100");

    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = 100;

    const [uniqueTotal, uniqueCustomers] = await Promise.all([
      prisma.soddiagram.findMany({
        where: search
          ? {
              customerName: {
                contains: search.toLowerCase(),
              },
            }
          : {},
        select: {
          customerName: true,
        },
        distinct: ["customerName"],
      }),
      prisma.soddiagram.findMany({
        where: search
          ? {
              customerName: {
                contains: search.toLowerCase(),
              },
            }
          : {},
        select: {
          customerName: true,
        },
        distinct: ["customerName"],
        take: limit,
        skip: (page - 1) * limit,
      }),
    ]);

    const customerNames = uniqueCustomers.map((item) => item.customerName);
    const data = await prisma.soddiagram.findMany({
      where: {
        customerName: {
          in: customerNames,
        },
      },
    });
    const uniqueCustomerName = uniqueTotal.map((item) => item.customerName);
    const totalUniqueCustomer = customerNames.length;
    const totalPages = Math.ceil(uniqueCustomerName.length / limit);

    return new Response(
      JSON.stringify({
        success: true,
        data,
        totalUniqueCustomer,
        page,
        totalPages,
      }),
      { status: 200 }
    );
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ success: false, message: "Terjadi kesalahan saat mengambil data" }),
      { status: 500 }
    );
  }
}
