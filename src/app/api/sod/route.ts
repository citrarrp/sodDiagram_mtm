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
  kodeCustomer: string;
  cycle: number;
  updates: UpdateRow[];
}
export async function POST(req: NextRequest) {
  const body: UpdatePayload = await req.json();
  const { customerName, kodeCustomer, cycle, updates }: UpdatePayload = body;
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
        updateMonth: date.toLocaleString("default", { month: "long" }),
        kodeCustomer: kodeCustomer,
      };
    });

    await prisma.soddiagram.createMany({
      data: dataToInsert,
    });

    await prisma.soddiagram.updateMany({
      where: {
        customerName: customerName,
      },
      data: {
        updateMonth: date.toLocaleString("default", { month: "long" }),
      },
    });

    return res.json({ message: "Data berhasil disimpan!" }, { status: 200 });
  } catch (err) {
    console.error(err);
    return res.json(
      { error: "Terjadi kesalahan saat menyimpan data!" },
      { status: 500 }
    );
  }
}

// export async function GET(req: NextRequest) {
//   try {
//     const { searchParams } = new URL(req.url);
//     const search = searchParams.get("search") || "";
//     let page = parseInt(searchParams.get("page") || "1");
//     let limit = parseInt(searchParams.get("limit") || "100");

//     if (isNaN(page) || page < 1) page = 1;
//     if (isNaN(limit) || limit < 1) limit = 100;

//     const [uniqueTotal, uniqueCustomers] = await Promise.all([
//       prisma.soddiagram.findMany({
//         where: search
//           ? {
//               customerName: {
//                 contains: search.toLowerCase(),
//               },
//             }
//           : {},
//         select: {
//           customerName: true,
//         },
//         distinct: ["customerName"],
//       }),
//       prisma.soddiagram.findMany({
//         where: search
//           ? {
//               customerName: {
//                 contains: search.toLowerCase(),
//               },
//             }
//           : {},
//         select: {
//           customerName: true,
//         },
//         distinct: ["customerName"],
//         take: limit,
//         skip: (page - 1) * limit,
//       }),
//     ]);

//     const customerNames = uniqueCustomers.map((item) => item.customerName);
//     const data = await prisma.soddiagram.findMany({
//       where: {
//         customerName: {
//           in: customerNames,
//         },
//       },
//     });
//     const uniqueCustomerName = uniqueTotal.map((item) => item.customerName);
//     const totalUniqueCustomer = customerNames.length;
//     const totalPages = Math.ceil(uniqueCustomerName.length / limit);

//     return new Response(
//       JSON.stringify({
//         success: true,
//         data,
//         totalUniqueCustomer,
//         page,
//         totalPages,
//       }),
//       { status: 200 }
//     );
//   } catch (err) {
//     console.error(err);
//     return new Response(
//       JSON.stringify({ success: false, message: "Terjadi kesalahan saat mengambil data" }),
//       { status: 500 }
//     );
//   }
// }import { NextRequest } from "next/server";
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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "100"));

    // Ambil seluruh nama customer unik terlebih dahulu
    const allUniqueCustomerNames = await prisma.soddiagram.findMany({
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
    });

    const totalUniqueCustomer = allUniqueCustomerNames.length;
    const totalPages = Math.ceil(totalUniqueCustomer / limit);

    const paginatedCustomerNames = allUniqueCustomerNames
      .slice((page - 1) * limit, page * limit)
      .map((item) => item.customerName);

    // Sekarang ambil semua data berdasarkan nama customer di halaman ini
    const data = await prisma.soddiagram.findMany({
      where: {
        customerName: {
          in: paginatedCustomerNames,
        },
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        data,
        totalUniqueCustomer,
        page,
        totalPages,
      }),
      {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": "http://localhost:5173",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Terjadi kesalahan saat mengambil data",
      }),
      {
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "http://localhost:5173",
          "Content-Type": "application/json",
        },
      }
    );
  }
}
