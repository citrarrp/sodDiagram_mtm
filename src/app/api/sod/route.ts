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

// export async function GET() {
//   try {
//     const soddiagrams = await prisma.soddiagram.findMany();
//     if (soddiagrams.length > 0) {
//       return res.json({ status: 200, success: true, data: soddiagrams });
//     } else {
//       return res.json({ status: 400, message: "Data Not Found" });
//     }
//   } catch (err) {
//     console.log(err);
//     return res.json({ status: 500, message: "Internal server error" });
//   }
// }

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    let page = parseInt(searchParams.get("page") || "1");
    let limit = parseInt(searchParams.get("limit") || "100");

    if (isNaN(page) || page < 1) page = 1;
    if (isNaN(limit) || limit < 1) limit = 100;

    // const skip = (page - 1) * limit;

    // const whereClause = search
    //   ? {
    //       customerName: {
    //         contains: search.toLowerCase(),
    //       },
    //     }
    //   : {};

    // const [total, data] = await Promise.all([
    //   prisma.soddiagram.count({ where: whereClause }),
    //   prisma.soddiagram.findMany({
    //     where: whereClause,
    //     skip: skip,
    //     take: limit,
    //   }),
    // ]);

    // const totalPages = Math.ceil(total / limit);

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
})
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
      JSON.stringify({ success: false, message: "Server Error" }),
      { status: 500 }
    );
  }
}
