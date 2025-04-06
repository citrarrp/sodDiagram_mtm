// "use client";
// import React from "react";
// import {
//   XAxis,
//   YAxis,
//   Line,
//   CartesianGrid,
//   ResponsiveContainer,
//   LineChart,
// } from "recharts";

// type Task = {
//   processName: string;
//   waktuStart: number | null;
//   duration: number;
//   groupColor?: string;
// };

// type lineTask = {
//   newProcessName: string;
//   waktuStart: number | null;
//   duration: number;
//   color: string;
// };

// type lineCycle = {
//   cycle: number;
//   process: lineTask[];
// };

// type lineData = {
//   name: string;
//   time: number | null;
//   color: string;
// };

// interface ChartSimpleProps {
//   tasks: Task[];
//   data: lineCycle[];
// }

// export default function LineChartSimple({ tasks, data }: ChartSimpleProps) {
//   const barHeight = 40;
//   const chartHeight = tasks.length * barHeight;

//   const dataLine: lineData[] = data.flatMap((proc) =>
//     proc.process.flatMap((Task, index, array): lineData[] => {
//       const current = Task.waktuStart || 0;
//       const nextTask = array[index + 1];
//       const nextStart = nextTask?.waktuStart ?? null;
//       const finish = current + Task.duration;
//       const result: lineData[] = [
//         {
//           name: Task.newProcessName,
//           time: current,
//           color: Task.color,
//         },
//         {
//           name: Task.newProcessName,
//           time: finish,
//           color: Task.color,
//         },
//       ];

//       if (nextStart) {
//         if (nextStart !== null && nextStart >= finish) {
//           result.push({
//             name: Task.newProcessName,
//             time: nextTask.waktuStart,
//             color: Task.color,
//           });

//           result.push({
//             name: nextTask.newProcessName,
//             time: nextTask.waktuStart,
//             color: Task.color,
//           });
//         } else {
//           result.push({
//             name: Task.newProcessName,
//             time: 1440,
//             color: Task.color,
//           });

//           result.push({
//             name: Task.newProcessName,
//             time: null,
//             color: Task.color,
//           });

//           result.push({
//             name: nextTask.newProcessName,
//             time: 0,
//             color: Task.color,
//           });
//         }
//       }

//       return result;
//     })
//   );

//   // console.log(dataLine, "line");
//   return (
//     <div style={{ width: "100%", height: chartHeight }}>
//       <ResponsiveContainer width="100%" height="120%">
//         <LineChart
//           data={dataLine}
//           layout="vertical"
//           barSize={40}
//           barGap={0}
//           barCategoryGap="20%"
//         >
//           {/* {dataLine.map((lineData, index) => { */}
//             <Line

//               type="stepAfter"
//               dataKey="time"
//               stroke={"black"}
//               strokeWidth={2}
//               height={400}
//               dot={false}
//               connectNulls={false}
//               className="mt-150"
//             />;
//           {/* })} */}

//           <CartesianGrid stroke="transparent" />
//           <XAxis type="number" domain={[0, 1440]} hide />
//           <YAxis
//             dataKey="name"
//             type="category"
//             width={100}
//             tick={{ fontSize: 5, fill: "black" }}
//             // axisLine={false}
//             // tickLine={false}
//           />
//         </LineChart>
//       </ResponsiveContainer>
//     </div>
//   );
// }
