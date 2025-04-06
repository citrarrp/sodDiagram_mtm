// import React from "react";

// import SODDiagram from "@/components/SOD";
// import GanttChart from "@/components/ganntChart";
// import Shifts from "@/components/break";
// import BarChartSimple from "@/components/simpleChart";
// import { SOD } from "@/components/gantt";
// import { getColor } from "@/app/utils/color";
// import { getShifts } from "@/lib/function";
// import Link from "next/link";
// import CustomerAccordion from "@/components/accordion";
// import { IoMdAddCircleOutline } from "react-icons/io";

// type task = {
//   processName: string;
//   waktuStart: number;
//   duration: number;
// };
// type cycleProcess = {
//   customerName: string;
//   cycle: number;
//   process: task[];
// };

// type groupedCust = {
//   customerName: string;
//   cycles: cycleProcess[];
// };

// type Shift = {
//   id: number;
//   kode_shift: string;
//   jam_mulai: string;
//   jam_selesai: string;
// };

// type ShiftResponse = {
//   status: number;
//   success: boolean;
//   data: Shift[];
// };

// type Task = {
//   processName: string;
//   waktuStart: number | null;
//   duration: number;
//   groupColor?: string;
// };

// type CycleProcess = {
//   customerName: string;
//   cycle: number;
//   process: Task[];
// };

// type GroupedCust = {
//   customerName: string;
//   cycles: CycleProcess[];
// };

// const getSOD = async () => {
//   // const isProduction = process.env.NODE_ENV === "production";

//   // if (isProduction) {
//   const res = await fetch(`${process.env.BASE_URL}/api/sod`, {
//     next: { revalidate: 0 },
//   });
//   const sod = await res.json();
//   return sod;
// };

// const res2 = await fetch(`${process.env.BASE_URL}/api/break/`, {
//   next: { revalidate: 0 },
// });
// const breaks = await res2.json();

// const generateColor = (index: number): string => {
//   const colors = [
//     "#FF69B4", // Hot Pink
//     "#FF6F91", // Coral Pink
//     "#DA70D6", // Orchid
//     "#FFA07A", // Salmon
//     "#00FFFF", // Light Cyan
//     "#40E0D0", // Turquoise
//     "#BFFF00", // Neon Lime
//     "#FF4500", // Neon Orange
//     "#E6E6FA", // Lavender
//   ];
//   return colors[index % colors.length];
// };

// const createUniqueProcessCyclePerCustomer = (
//   grouped: GroupedCust[]
// ): CycleProcess[] => {
//   const processColors: Record<string, string> = {};
//   let colorIndex = 0;

//   return grouped.map((cust) => {
//     const processOccurrences: Record<string, Set<string>> = {};
//     const processDetails: Record<string, Task> = {};
//     const processNamesSet = new Set<string>();

//     cust.cycles.forEach((cycle) => {
//       cycle.process.forEach((proc) => {
//         const key = `${proc.processName}&${proc.waktuStart}&${proc.duration}`;
//         const cycleKey = `${cust.customerName}&${cycle.cycle}`;

//         processNamesSet.add(proc.processName);

//         if (!processOccurrences[key]) {
//           processOccurrences[key] = new Set();
//         }
//         processOccurrences[key].add(cycleKey);

//         if (!processDetails[key]) {
//           processDetails[key] = { ...proc };
//         }

//         if (!processColors[proc.processName]) {
//           processColors[proc.processName] = generateColor(colorIndex);
//           colorIndex++;
//         }
//       });
//     });

//     const finalProcesses: Task[] = [];
//     processNamesSet.forEach((processName) => {
//       const matchingEntry = Object.entries(processOccurrences).find(
//         ([key, cycleSet]) => {
//           const [name] = key.split("&");
//           return name === processName && cycleSet.size > 1;
//         }
//       );

//       if (matchingEntry) {
//         const [key] = matchingEntry;
//         finalProcesses.push({
//           ...processDetails[key],
//           groupColor: processColors[processName],
//         });
//       } else {
//         finalProcesses.push({
//           processName,
//           waktuStart: null,
//           duration: 0,
//           groupColor: processColors[processName],
//         });
//       }
//     });

//     return {
//       customerName: cust.customerName,
//       cycle: 999,
//       process: finalProcesses,
//     };
//   });
// };

// export default async function Page() {
//   const sod = await getSOD();
//   const hasil = SOD(sod.data);
//   const data: ShiftResponse = await getShifts();

//   const grouped: groupedCust[] = (hasil || []).reduce((acc, item) => {
//     const exist = acc.find((cust) => cust.customerName === item.customerName);
//     if (exist) {
//       exist.cycles.push(item);
//     } else {
//       acc.push({
//         customerName: item.customerName,
//         cycles: [item],
//       });
//     }
//     return acc;
//   }, [] as groupedCust[]);

//   const allCycles = grouped.flatMap((customer) =>
//     customer.cycles.map((cycle, index) => {
//       return {
//         customer: customer.customerName,
//         cycle: cycle.cycle,
//         color: getColor(index),
//       };
//     })
//   );

//   const uniqueProcessPerCustomer = createUniqueProcessCyclePerCustomer(grouped);
//   return (
//     <div className="items-center justify-items-center p-6 sm:p-10 font-[family-name:var(--font-poppins)] max-w-screen min-h-screen w-full h-full grow border-blue-500 border-2 flex-1">
//       <main className="flex flex-col row-start-2 items-center sm:items-start w-full h-full min-h-screen border-red-500 border-2">
//         <div className="w-full justify-end my-10">
//           <Link href="/create">
//             <button className="border-emerald-600 border-2 text-emerald-600 cursor-pointer hover:bg-emerald-700 hover:text-white px-4 py-2 rounded flex items-center gap-2 ml-auto">
//               <IoMdAddCircleOutline size={20} />
//               Tambah Data
//             </button>
//           </Link>
//         </div>

//         <div className="grid grid-cols-1 gap-20 min-w-full">
//           {grouped?.map((customer, index) => {
//             const customerProcess = uniqueProcessPerCustomer.find(
//               (proc) => proc.customerName === customer.customerName
//             );
//             return (
//               <div key={customer.customerName}>
//                 <CustomerAccordion
//                   customer={customer.customerName}
//                   indeks={index}
//                 >
//                   <div
//                     key={`${customer.customerName}`}
//                     className={`w-full flex flex-col`}
//                   >
//                     <SODDiagram data={sod} Customer={customer.customerName} />

//                     <div className="relative w-full min-h-fit">
//                       <div className="w-full relative mb-10">
//                         <Shifts data={data.data} />
//                       </div>
//                       <div className="absolute inset-0 top-17 z-10">
//                         <BarChartSimple
//                           tasks={customerProcess?.process || []}
//                         />
//                       </div>
//                       {customer.cycles.map((cycle, index) => (
//                         <div
//                           key={`${customer.customerName}-${cycle.cycle}`}
//                           className={`relative mt-${index * 1}`}
//                         >
//                           <GanttChart
//                             task={cycle}
//                             color={getColor(index)}
//                             breaks={breaks.data}
//                             indeks={index}
//                             payload={allCycles}
//                           />
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 </CustomerAccordion>
//               </div>
//             );
//           })}
//         </div>
//       </main>
//     </div>
//   );
// }
