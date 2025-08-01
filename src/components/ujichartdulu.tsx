// "use client";
// import { timetoIndex } from "@/app/utils/timeDuration";
// import React from "react";
// import {
//   ResponsiveContainer,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ReferenceArea,
//   TooltipProps,
//   //   Legend,
//   //   LegendProps,
//   ComposedChart,
// } from "recharts";
// import {
//   NameType,
//   ValueType,
// } from "recharts/types/component/DefaultTooltipContent";
// import { getColor } from "@/app/utils/color";
// // import { MdRectangle } from "react-icons/md";
// import { SOD } from "./gantt";

// type Break = {
//   id: number;
//   shift_id: number;
//   nama_istirahat: string;
//   jam_mulai: string;
//   jam_selesai: string;
// };

// // type task = {
// //   customerName: string;
// //   preduration: number | null;
// //   duration1: number | null;
// //   duration2: number | null;
// // };

// interface Task {
//   cycle: string;
//   customerName: string;
//   processName: string;
//   waktu: string; // Format: "HH:mm" (UTC)
//   durasi: string; // Format: "HH:mm" (UTC)
//   preDuration: number | null;
//   durationPart1: number; // waktuStart
//   durationPart2: number; // waktuEnd (+ istirahat jika pulling)
// }

// // interface BreaksTime {
// //   jam_mulai: string;
// //   jam_selesai: string;
// // }

// type waktuIstirahat = {
//   customerName: string;
//   waktu: string;
//   durasi: string;
// };

// type SOD = {
//   id: number;
//   customerName: string;
//   processName: string;
//   cycle: string;
//   waktu: string;
//   durasi: string;
//   updateMonth: string;
// };

// const ProsesChart = ({ sodD, breaks }: { sodD: SOD[]; breaks: Break[] }) => {
//   const formatDuration = (value: number) => {
//     const hours = Math.floor(value / 60);
//     const minutes = value % 60;
//     return `${hours.toString().padStart(2, "0")}:${minutes
//       .toString()
//       .padStart(2, "0")}`;
//   };

//   const breakItem = sodD.filter((item) =>
//     item.processName.toLowerCase().includes("istirahat")
//   );

//   const groupedIstirahat = new Map<string, waktuIstirahat>();

//   breakItem.forEach((item) => {
//     const key = `${item.customerName}_${item.cycle}`;
//     if (!groupedIstirahat.has(key)) {
//       groupedIstirahat.set(key, {
//         customerName: item.customerName,
//         waktu: item.waktu,
//         durasi: item.durasi,
//       });
//     }
//   });

//   const CustomTooltip = ({
//     active,
//     payload,
//   }: TooltipProps<ValueType, NameType>) => {
//     if (active && payload && payload.length) {
//       const data = payload[0].payload;

//       return (
//         <div className="custom-tooltip bg-white/80 rounded-md p-5">
//           <p className="text-md">{data.processName}</p>
//           <p className="text-xs">Start: {formatDuration(data.durationPart1)}</p>
//           <p className="text-xs">
//             End:{" "}
//             {formatDuration(
//               data.durationPart1 + data.durationPart2 > 1440
//                 ? data.preduration
//                 : data.durationPart1 + data.durationPart2
//             )}
//           </p>
//         </div>
//       );
//     }
//     // ternyata cycle nya lupa diatur maksimal. misal ga ada tetap tampil aja. pokoknya semua cycle satu chart.
//     // GROUPED BY CYCLEUNIQUE?? kayak string record tadi, tapi cek maksmial
//     return null;
//   };

//   const uniqueCycle = Array.from(new Set(sodD.map((item) => item.cycle)));
// //   console.log(uniqueCycle);

//   const uniqueCustomer = Array.from(
//     new Set(sodD.map((item) => item.customerName))
//   );

//   const barHeight = 40;
//   const chartHeight = (sodD.length / uniqueCustomer.length) * barHeight;

//   // Buat struktur data yang mencakup SEMUA kombinasi customer + cycle
//   const modifiedTasksSplit = uniqueCustomer.flatMap((customer) => {
//     return uniqueCycle.map((cycle) => {
//       // Cari task yang sesuai dengan customer dan cycle ini
//       const existingTask = sodD.find(
//         (task) => task.customerName === customer && task.cycle === cycle
//       );

//       // Jika tidak ada, return "empty task"
//       if (!existingTask) {
//         return {
//           customerName: customer,
//           cycle: cycle,
//           processName: "",
//           waktu: "00:00",
//           durasi: "00:00",
//           preDuration: null,
//           durationPart1: 0,
//           durationPart2: 0,
//           isEmpty: true, // Flag untuk task kosong
//         };
//       }

//       // Jika ada, proses seperti biasa
//       const durasiIstirahat = groupedIstirahat.get(
//         `${customer}_${cycle}`
//       )?.durasi;
//       const istirahatNumber = timetoIndex(
//         new Intl.DateTimeFormat("id-ID", {
//           hour: "2-digit",
//           minute: "2-digit",
//           hour12: false,
//           timeZone: "UTC",
//         }).format(new Date(durasiIstirahat ?? 0))
//       );
//       const waktu = new Intl.DateTimeFormat("id-ID", {
//         hour: "2-digit",
//         minute: "2-digit",
//         hour12: false,
//         timeZone: "UTC",
//       }).format(new Date(existingTask.waktu));

//       const durasi = new Intl.DateTimeFormat("id-ID", {
//         hour: "2-digit",
//         minute: "2-digit",
//         hour12: false,
//         timeZone: "UTC",
//       }).format(new Date(existingTask.durasi));

//       const waktuStart = timetoIndex(waktu);
//       const duration = timetoIndex(durasi);
//       const isPulling = existingTask.processName.includes("PULLING");
//       const totalEnd = waktuStart + duration;

//       return {
//         ...existingTask,
//         preDuration:
//           totalEnd <= 1440
//             ? null
//             : totalEnd + (isPulling ? istirahatNumber : 0) - 1440,
//         durationPart1:
//           totalEnd <= 1440
//             ? waktuStart
//             : 1440 - (duration + (isPulling ? istirahatNumber : 0)),
//         durationPart2:
//           totalEnd <= 1440
//             ? duration + (isPulling ? istirahatNumber : 0)
//             : 1440 - waktuStart,
//         isEmpty: false,
//       };
//     });
//   });

//   breaks.map((item) => {
//     const istirahat: { time1: number; time2: number }[] = [];
//     istirahat.push({
//       time1: timetoIndex(item.jam_mulai),
//       time2: timetoIndex(item.jam_selesai),
//     });
//   });

//   const groupTasksByCycle = (tasks: Task[]): Record<string, Task[]> => {
//     {
//       return uniqueCycle.reduce((acc, cycle) => {
//         acc[cycle] = tasks.filter((task) => task.cycle === cycle);
//         return acc;
//       }, {} as Record<string, Task[]>);
//     }
//   };

//   const sortTasksByWaktuStart = (
//     groupedTasks: Record<string, Task[]>
//   ): Record<string, Task[]> => {
//     const sortedGroups: Record<string, Task[]> = {};
//     Object.keys(groupedTasks).forEach((cycle) => {
//       sortedGroups[cycle] = [...groupedTasks[cycle]].sort(
//         (a, b) => a.durationPart1 - b.durationPart1
//       );
//     });
//     return sortedGroups;
//   };

//   const sortedTasksByCycle = sortTasksByWaktuStart(
//     groupTasksByCycle(modifiedTasksSplit)
//   );

//   console.log(
//     groupTasksByCycle(modifiedTasksSplit),
//     sortedTasksByCycle,
//     "hasil sort dan group"
//   );
//   //   const [activeCycle, setActiveCycle] = useState(
//   //     Object.keys(groupTasksByCycle(modifiedTasksSplit))[0]
//   //   );

//   //   const [activeTooltips, setActiveTooltips] = useState<Record<string, number>>(
//   //     {}
//   //   );

//   //   // Fungsi untuk mengatur tooltip yang aktif
//   //   const setAlwaysActiveTooltip = (cycle: string, index: number) => {
//   //     setActiveTooltips((prev) => ({ ...prev, [cycle]: index }));
//   //   };
//   return (
//     <div
//       className={`max-w-screen items-center place-center absolute
//       `} //absolute ya kalau gabungin
//       style={{ height: 1.5 * chartHeight, width: "100%" }}
//     >
//       {Object.entries(sortedTasksByCycle).map(([cycle, tasks], cycleIndex) => {
//         console.log(cycle, tasks, cycleIndex);
//         return (
//           <div
//             key={cycle}
//             className="relative"
//             // style={{
//             //   zIndex: cycleIndex,
//             // }}
//           >
//             <ResponsiveContainer
//               width={"100%"}
//               height={467}
//               minWidth={400}
//               minHeight={300}
//             >
//               <ComposedChart
//                 data={tasks}
//                 layout="vertical"
//                 barSize={40}
//                 barGap={0}
//                 barCategoryGap={0}
//                 // onMouseMove={(e) => {
//                 //   if (e.activeTooltipIndex !== undefined) {
//                 //     setAlwaysActiveTooltip(cycle, e.activeTooltipIndex);
//                 //   }
//                 // }}
//               >
//                 <CartesianGrid stroke="transparent" />
//                 {breaks.map((b, index) => {
//                   console.log(b, index, "istirahat");
//                   console.log(
//                     `x1=${timetoIndex(
//                       new Intl.DateTimeFormat("id-ID", {
//                         hour: "2-digit",
//                         minute: "2-digit",
//                         hour12: false,
//                         timeZone: "UTC",
//                       }).format(new Date(b.jam_mulai))
//                     )}, x2=${timetoIndex(
//                       new Intl.DateTimeFormat("id-ID", {
//                         hour: "2-digit",
//                         minute: "2-digit",
//                         hour12: false,
//                         timeZone: "UTC",
//                       }).format(new Date(b.jam_selesai))
//                     )}}`
//                   );
//                   return (
//                     <ReferenceArea
//                       key={index}
//                       x1={timetoIndex(
//                         new Intl.DateTimeFormat("id-ID", {
//                           hour: "2-digit",
//                           minute: "2-digit",
//                           hour12: false,
//                           timeZone: "UTC",
//                         }).format(new Date(b.jam_mulai))
//                       )}
//                       x2={timetoIndex(
//                         new Intl.DateTimeFormat("id-ID", {
//                           hour: "2-digit",
//                           minute: "2-digit",
//                           hour12: false,
//                           timeZone: "UTC",
//                         }).format(new Date(b.jam_selesai))
//                       )}
//                       stroke="black"
//                       fill="black"
//                       fillOpacity={0.05}
//                       strokeOpacity={0.05}
//                     />
//                   );
//                 })}

//                 <XAxis
//                   type="number"
//                   domain={[0, 1440]}
//                   ticks={[...Array(49)].map((_, i) => i * 30)}
//                   tickFormatter={(tick) => formatDuration(tick)}
//                   orientation="top"
//                   interval={0}
//                   width={2000}
//                   tick={{ fontSize: 6 }} // Kalau bukan chart pertama, hide tick/label
//                   axisLine={true} // Hide garis juga kalau bukan chart pertama
//                   tickLine={true}
//                 />

//                 <YAxis
//                   dataKey="customerName"
//                   allowDuplicatedCategory={false}
//                   type="category"
//                   width={100}
//                   fontSize={11}
//                   interval={"preserveStartEnd"}
//                 />

//                 <Tooltip
//                   active={true} // Memaksa tooltip selalu tampil
//                   //   payload={
//                   //     tasks.length > 0
//                   //       ? [
//                   //           {
//                   //             payload: tasks[activeTooltips[cycle] || 0],
//                   //             dataKey: "durationPart2",
//                   //             value:
//                   //               tasks[activeTooltips[cycle] || 0].durationPart2,
//                   //             // ... properti payload lainnya
//                   //           },
//                   //         ]
//                   //       : []
//                   //   }
//                   content={(props) => (
//                     <CustomTooltip
//                       active={props.active}
//                       payload={props.payload}
//                       label={props.label}
//                     />
//                   )}
//                 />
//                 {/* <Legend
//             content={<RenderLegend />}
//             payload={uniqueCycle.map((item, index) => ({
//               value: `Cycle ${item}`,
//               color: getColor(index),
//             }))}
//             layout="horizontal"
//             verticalAlign="bottom"
//             align="center"
//             className="text-center items-center"
//             wrapperStyle={{
//               paddingTop: 20,
//               color: "black",
//             }}
//           /> */}

//                 <Bar
//                   dataKey="preDuration"
//                   stackId="a"
//                   fill={getColor(cycleIndex)}
//                 />
//                 <Bar dataKey="durationPart1" stackId="a" fill="transparent" />
//                 <Bar
//                   dataKey="durationPart2"
//                   stackId="a"
//                   fill={getColor(cycleIndex)}
//                 />
//               </ComposedChart>
//             </ResponsiveContainer>
//           </div>
//         );
//       })}
//     </div>
//   );     
// };
// export default ProsesChart;
