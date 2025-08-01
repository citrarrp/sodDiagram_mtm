// "use client";
// import { timetoIndex } from "@/app/utils/timeDuration";
// import React, { useState } from "react";
// import {
//   ResponsiveContainer,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ReferenceArea,
//   TooltipProps,
//   Legend,
//   LegendProps,
//   ComposedChart,
// } from "recharts";
// import {
//   NameType,
//   ValueType,
// } from "recharts/types/component/DefaultTooltipContent";
// import { getColor } from "@/app/utils/color";
// import { MdRectangle } from "react-icons/md";
// import { SOD } from "./gantt";

// type Break = {
//   id: number;
//   shift_id: number;
//   nama_istirahat: string;
//   jam_mulai: string;
//   jam_selesai: string;
// };

// type task = {
//   customerName: string;
//   preduration: number | null;
//   duration1: number | null;
//   duration2: number | null;
// };

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

// interface BreaksTime {
//   jam_mulai: string;
//   jam_selesai: string;
// }

// type waktuIstirahat = {
//   customerName: string;
//   waktu: string;
//   durasi: string;
// };

// type allCycles = {
//   cycle: number;
//   color: string;
//   dataProses: task[];
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

//   // const Tasks: task[] = [];

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

//   // const modifiedTasksSplit = sodD.map((Task) => {
//   //   const durasiIstirahat = groupedIstirahat.get(
//   //     `${Task.customerName}_${Task.cycle}`
//   //   )?.durasi;
//   //   const istirahatNumber = timetoIndex(
//   //     new Intl.DateTimeFormat("id-ID", {
//   //       hour: "2-digit",
//   //       minute: "2-digit",
//   //       hour12: false,
//   //       timeZone: "UTC",
//   //     }).format(new Date(durasiIstirahat == null ? 0 : durasiIstirahat))
//   //   );

//   //   const waktu = new Intl.DateTimeFormat("id-ID", {
//   //     hour: "2-digit",
//   //     minute: "2-digit",
//   //     hour12: false,
//   //     timeZone: "UTC",
//   //   }).format(new Date(Task.waktu));

//   //   const durasi = new Intl.DateTimeFormat("id-ID", {
//   //     hour: "2-digit",
//   //     minute: "2-digit",
//   //     hour12: false,
//   //     timeZone: "UTC",
//   //   }).format(new Date(Task.durasi));

//   //   const waktuStart = timetoIndex(waktu);
//   //   const duration = timetoIndex(durasi);
//   //   const isPulling = Task.processName.includes("PULLING");
//   //   const totalEnd = waktuStart + duration;
//   //   if (totalEnd <= 1440) {
//   //     return {
//   //       ...Task,
//   //       customerName: Task.customerName,
//   //       cycle: Task.cycle,
//   //       preDuration: null,
//   //       durationPart1: waktuStart,
//   //       durationPart2: duration + (isPulling ? istirahatNumber : 0),
//   //     };
//   //   } else {
//   //     return {
//   //       ...Task,
//   //       customerName: Task.customerName,
//   //       cycle: Task.cycle,
//   //       preDuration:
//   //         waktuStart + duration + (isPulling ? istirahatNumber : 0) - 1440,
//   //       durationPart1: 1440 - (duration + (isPulling ? istirahatNumber : 0)),
//   //       durationPart2: 1440 - waktuStart,
//   //     };
//   //   }
//   // });

//   // const groupedTasks = sodD.map((Task) => {
//   //   const durasiIstirahat = groupedIstirahat.get(
//   //     `${Task.customerName}_${Task.cycle}`
//   //   )?.durasi;
//   //   const istirahatNumber = timetoIndex(
//   //     new Intl.DateTimeFormat("id-ID", {
//   //       hour: "2-digit",
//   //       minute: "2-digit",
//   //       hour12: false,
//   //       timeZone: "UTC",
//   //     }).format(new Date(durasiIstirahat == null ? 0 : durasiIstirahat))
//   //   );

//   // const waktu = new Intl.DateTimeFormat("id-ID", {
//   //   hour: "2-digit",
//   //   minute: "2-digit",
//   //   hour12: false,
//   //   timeZone: "UTC",
//   // }).format(new Date(Task.waktu));

//   // const durasi = new Intl.DateTimeFormat("id-ID", {
//   //   hour: "2-digit",
//   //   minute: "2-digit",
//   //   hour12: false,
//   //   timeZone: "UTC",
//   // }).format(new Date(Task.durasi));

//   // const waktuStart = timetoIndex(waktu);
//   // const duration = timetoIndex(durasi);
//   //   const isPulling = Task.processName.includes("PULLING");
//   //   const totalEnd = waktuStart + duration;
//   //   if (totalEnd <= 1440) {
//   //     return {
//   //       ...Task,
//   //       customerName: Task.customerName,
//   //       cycle: Task.cycle,
//   //       preDuration: null,
//   //       durationPart1: waktuStart,
//   //       durationPart2: duration + (isPulling ? istirahatNumber : 0),
//   //     };
//   //   } else {
//   //     return {
//   //       ...Task,
//   //       customerName: Task.customerName,
//   //       cycle: Task.cycle,
//   //       preDuration:
//   //         waktuStart + duration + (isPulling ? istirahatNumber : 0) - 1440,
//   //       durationPart1: 1440 - (duration + (isPulling ? istirahatNumber : 0)),
//   //       durationPart2: 1440 - waktuStart,
//   //     };
//   //   }
//   // }, {} as Record<string, task[]>);

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
//   console.log(uniqueCycle);

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
//   // const groupedTasks = task.process.reduce((acc, curr) => {
//   //   if (!acc[curr.processName]) {
//   //     acc[curr.processName] = [];
//   //   }
//   //   acc[curr.processName].push(curr);
//   //   return acc;
//   // }, {} as Record<string, task[]>);

//   // Object.keys(groupedTasks).forEach((key) => {
//   //   groupedTasks[key].sort((a, b) => a.waktuStart - b.waktuStart);
//   // });

//   breaks.map((item) => {
//     const istirahat: { time1: number; time2: number }[] = [];
//     istirahat.push({
//       time1: timetoIndex(item.jam_mulai),
//       time2: timetoIndex(item.jam_selesai),
//     });
//   });

//   // const filteredCycles = payload.sort((a, b) => a.cycle - b.cycle);

//   // const RenderLegend = (props: LegendProps) => {
//   //   const { payload } = props;
//   //   return (
//   //     <div className="flex flex-wrap justify-center items-center w-full text-xs text-center gap-2">
//   //       {payload?.map((entry, index) => (
//   //         <div key={index} className="relative w-12">
//   //           <MdRectangle
//   //             className="h-full w-full"
//   //             size={12}
//   //             color={getColor(index)}
//   //           />
//   //           <div
//   //             className="absolute inset-0 w-full flex items-center justify-center whitespace-nowrap text-white text-[9px] p-1"
//   //             key={`item-${index}`}
//   //           >
//   //             {entry.value}
//   //           </div>
//   //         </div>
//   //       ))}
//   //     </div>
//   //   );
//   // };

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
//   const [activeCycle, setActiveCycle] = useState(
//     Object.keys(groupTasksByCycle(modifiedTasksSplit))[0]
//   );

//   const [activeTooltips, setActiveTooltips] = useState<Record<string, number>>(
//     {}
//   );

//   // Fungsi untuk mengatur tooltip yang aktif
//   const setAlwaysActiveTooltip = (cycle: string, index: number) => {
//     setActiveTooltips((prev) => ({ ...prev, [cycle]: index }));
//   };
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
//             className="absolute"
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
//                   // domain={[0, uniqueCustomer.size - 1]}
//                 />

//                 {/* <Tooltip
//                   wrapperStyle={{ transition: "none" }}
//                   content={(props) => (
//                     <CustomTooltip
//                       active={props.active}
//                       payload={props.payload}
//                       label={props.label}
//                     />
//                   )}
//                 /> */}

//                 <Tooltip
//                   active={true} // Memaksa tooltip selalu tampil
//                   payload={
//                     tasks.length > 0
//                       ? [
//                           {
//                             payload: tasks[activeTooltips[cycle] || 0],
//                             dataKey: "durationPart2",
//                             value:
//                               tasks[activeTooltips[cycle] || 0].durationPart2,
//                             // ... properti payload lainnya
//                           },
//                         ]
//                       : []
//                   }
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

"use client";
import { timetoIndex } from "@/app/utils/timeDuration";
import {
  ResponsiveContainer,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceArea,
  TooltipProps,
  // Legend,
  // LegendProps,
  ComposedChart,
} from "recharts";
import {
  NameType,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";
// import { getColor } from "@/app/utils/color";
// import { MdRectangle } from "react-icons/md";
import { SOD } from "./gantt";

type Break = {
  id: number;
  shift_id: number;
  nama_istirahat: string;
  jam_mulai: string;
  jam_selesai: string;
};

// type task = {
//   customerName: string;
//   preduration: number | null;
//   duration1: number | null;
//   duration2: number | null;
// };

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

// interface BreaksTime {
//   jam_mulai: string;
//   jam_selesai: string;
// }

type waktuIstirahat = {
  customerName: string;
  waktu: string;
  durasi: string;
};

type SOD = {
  id: number;
  customerName: string;
  processName: string;
  cycle: string;
  waktu: string;
  durasi: string;
  updateMonth: string;
};

const ProsesChart = ({ sodD, breaks }: { sodD: SOD[]; breaks: Break[] }) => {
  const formatDuration = (value: number) => {
    const hours = Math.floor(value / 60);
    const minutes = value % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  };

  const breakItem = sodD.filter((item) =>
    item.processName.toLowerCase().includes("istirahat")
  );

  const groupedIstirahat = new Map<string, waktuIstirahat>();

  breakItem.forEach((item) => {
    const key = `${item.customerName}_${item.cycle}`;
    if (!groupedIstirahat.has(key)) {
      groupedIstirahat.set(key, {
        customerName: item.customerName,
        waktu: item.waktu,
        durasi: item.durasi,
      });
    }
  });

  const CustomTooltip = ({
    active,
    payload,
  }: TooltipProps<ValueType, NameType>) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;

      if (data.customerName.includes("ADM")) {
        console.log(data, "contoh payload");
      }
      return (
        <div className="custom-tooltip bg-white/80 rounded-md p-5">
          <p className="text-md">{data.processName}</p>
          <p className="text-xs">Start: {formatDuration(data.durationPart1)}</p>
          <p className="text-xs">
            End:{" "}
            {formatDuration(
              data.durationPart1 + data.durationPart2 > 1440
                ? data.preduration
                : data.durationPart1 + data.durationPart2
            )}
          </p>
        </div>
      );
    }
    // ternyata cycle nya lupa diatur maksimal. misal ga ada tetap tampil aja. pokoknya semua cycle satu chart.
    // GROUPED BY CYCLEUNIQUE?? kayak string record tadi, tapi cek maksmial
    return null;
  };

  // const uniqueCycle = Array.from(new Set(sodD.map((item) => item.cycle)));
  // console.log(uniqueCycle);

  // const uniqueCustomer = Array.from(
  //   new Set(sodD.map((item) => item.customerName))
  // );

  const barHeight = 40;
  const chartHeight = Math.round(sodD.length / 9) * barHeight;

  const modifiedTasksSplit = sodD.map((task) => {
    const { customerName, cycle, waktu, durasi, processName } = task;
    const customerCycle = `${customerName} - C${cycle}`;

    // console.log(customerCycle);

    const durasiIstirahat = groupedIstirahat.get(
      `${customerName}_${cycle}`
    )?.durasi;
    const istirahatNumber = timetoIndex(
      new Intl.DateTimeFormat("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "UTC",
      }).format(new Date(durasiIstirahat ?? 0))
    );
    const waktuMulai = new Intl.DateTimeFormat("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "UTC",
    }).format(new Date(waktu));

    const durasiProses = new Intl.DateTimeFormat("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "UTC",
    }).format(new Date(durasi));

    const waktuStart = timetoIndex(waktuMulai);
    const duration = timetoIndex(durasiProses);
    const isPulling = processName.includes("PULLING");
    const totalEnd = waktuStart + duration;

    return {
      ...task,
      waktuStart,
      duration,
      customerCycle,
      preDuration:
        totalEnd <= 1440
          ? null
          : totalEnd + (isPulling ? istirahatNumber : 0) - 1440,
      durationPart1:
        totalEnd <= 1440
          ? waktuStart
          : 1440 - (duration + (isPulling ? istirahatNumber : 0)),
      durationPart2:
        totalEnd <= 1440
          ? duration + (isPulling ? istirahatNumber : 0)
          : 1440 - waktuStart,
      isEmpty: false,
    };
  });
  // });

  breaks.map((item) => {
    const istirahat: { time1: number; time2: number }[] = [];
    istirahat.push({
      time1: timetoIndex(item.jam_mulai),
      time2: timetoIndex(item.jam_selesai),
    });
  });

  // const groupTasksByCycle = (tasks: Task[]): Record<string, Task[]> => {
  //   return tasks.reduce((acc, task) => {
  //     const key = `${task.customerName} - C${task.cycle}`;
  //     if (!acc[key]) acc[key] = [];
  //     acc[key].push(task);
  //     return acc;
  //   }, {} as Record<string, Task[]>);
  // };

  // const sortTasksByWaktuStart = (
  //   groupedTasks: Record<string, Task[]>
  // ): Record<string, Task[]> => {
  //   const sortedGroups: Record<string, Task[]> = {};
  //   for (const key in groupedTasks) {
  //     sortedGroups[key] = groupedTasks[key].sort(
  //       (a, b) => a.durationPart1 - b.durationPart1
  //     );
  //   }
  //   return sortedGroups;
  // };

  // const sortedTasksByCycle = sortTasksByWaktuStart(
  //   groupTasksByCycle(modifiedTasksSplit)
  // );

  // console.log(
  //   groupTasksByCycle(modifiedTasksSplit),
  //   sortedTasksByCycle,
  //   "hasil sort dan group"
  // );

  // const [activeTooltips, setActiveTooltips] = useState<Record<string, number>>(
  //   {}
  // );
  const allSortedTasks = [...modifiedTasksSplit].sort(
    (a, b) => a.durationPart1 - b.durationPart1
  );

  // const allSortedTasks = Object.values(sortedTasksByCycle).flat();

  console.log(allSortedTasks, "ini sort");
  // const setAlwaysActiveTooltip = (cycle: string, index: number) => {
  //   setActiveTooltips((prev) => ({ ...prev, [cycle]: index }));
  // };
  // console.log("apa contoh ini", allSortedTasks);
  // const tinggiReal = Math.round(sodD.length / 9) * 100;
  return (
    <div
      className={`max-w-screen items-center place-center absolute
      `} //absolute ya kalau gabungin
      style={{ height: 3 * chartHeight, width: "100%" }}
    >
      <div>
        <ResponsiveContainer
          width={"100%"}
          height={3 * chartHeight}
          // minWidth={400}
          minHeight={400}
        >
          <ComposedChart
            data={allSortedTasks}
            layout="vertical"
            barSize={40}
            barGap={0}
            barCategoryGap={0}
            // onMouseMove={(e) => {
            //   if (e.activeTooltipIndex !== undefined) {
            //     setAlwaysActiveTooltip(cycle, e.activeTooltipIndex);
            //   }
            // }}
          >
            <CartesianGrid stroke="transparent" />
            {breaks.map((b, index) => {
              // console.log(b, index, "istirahat");
              // console.log(
              //   `x1=${timetoIndex(
              //     new Intl.DateTimeFormat("id-ID", {
              //       hour: "2-digit",
              //       minute: "2-digit",
              //       hour12: false,
              //       timeZone: "UTC",
              //     }).format(new Date(b.jam_mulai))
              //   )}, x2=${timetoIndex(
              //     new Intl.DateTimeFormat("id-ID", {
              //       hour: "2-digit",
              //       minute: "2-digit",
              //       hour12: false,
              //       timeZone: "UTC",
              //     }).format(new Date(b.jam_selesai))
              //   )}}`
              // );
              return (
                <ReferenceArea
                  key={index}
                  x1={timetoIndex(
                    new Intl.DateTimeFormat("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                      timeZone: "UTC",
                    }).format(new Date(b.jam_mulai))
                  )}
                  x2={timetoIndex(
                    new Intl.DateTimeFormat("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                      timeZone: "UTC",
                    }).format(new Date(b.jam_selesai))
                  )}
                  stroke="black"
                  fill="black"
                  fillOpacity={0.05}
                  strokeOpacity={0.05}
                />
              );
            })}

            <XAxis
              type="number"
              domain={[0, 1440]}
              ticks={[...Array(49)].map((_, i) => i * 30)}
              tickFormatter={(tick) => formatDuration(tick)}
              orientation="top"
              interval={0}
              width={2000}
              tick={{ fontSize: 6 }} // Kalau bukan chart pertama, hide tick/label
              axisLine={true} // Hide garis juga kalau bukan chart pertama
              tickLine={true}
            />

            <YAxis
              dataKey="customerCycle"
              // allowDuplicatedCategory={false}
              type="category"
              width={200}
              minTickGap={40}
              fontSize={10}
              interval={0}
            />

            <Tooltip
              active={true} // Memaksa tooltip selalu tampil
              // payload={
              //   tasks.length > 0
              //     ? [
              //         {
              //           payload: tasks[activeTooltips[cycle] || 0],
              //           dataKey: "durationPart2",
              //           value:
              //             tasks[activeTooltips[cycle] || 0].durationPart2,
              //           // ... properti payload lainnya
              //         },
              //       ]
              //     : []
              // }
              content={(props) => (
                <CustomTooltip
                  active={props.active}
                  payload={props.payload}
                  label={props.label}
                />
              )}
            />
            {/* <Legend
            content={<RenderLegend />}
            payload={uniqueCycle.map((item, index) => ({
              value: `Cycle ${item}`,
              color: getColor(index),
            }))}
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
            className="text-center items-center"
            wrapperStyle={{
              paddingTop: 20,
              color: "black",
            }}
          /> */}

            <Bar dataKey="preDuration" stackId="a" fill={"#51b865"} />
            <Bar dataKey="durationPart1" stackId="a" fill="transparent" />
            <Bar dataKey="durationPart2" stackId="a" fill={"#51b865"} />
            {/* {uniqueCycle.map((cycle, index) => (
              <>
                <Bar
                  key={cycle}
                  dataKey={(entry) =>
                    entry.cycle === cycle ? "preDuration" : null
                  }
                  stackId="a"
                  fill={getColor(index)}
                  isAnimationActive={false}
                />
                <Bar
                  key={cycle}
                  dataKey={(entry) =>
                    entry.cycle === cycle ? "durationPart1" : null
                  }
                  stackId="a"
                  fill={getColor(index)}
                  isAnimationActive={false}
                />
                <Bar
                  key={cycle}
                  dataKey={(entry) =>
                    entry.cycle === cycle ? "durationPart2" : null
                  }
                  stackId="a"
                  fill={getColor(index)}
                  isAnimationActive={false}
                />
              </> 
             ))} */}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      {/* );
      })} */}
    </div>
  );
};
export default ProsesChart;
