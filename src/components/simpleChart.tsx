"use client";
import React from "react";
import {
  Bar,
  XAxis,
  YAxis,
  Cell,
  CartesianGrid,
  ResponsiveContainer,
  BarChart,
} from "recharts";

type Task = {
  processName: string;
  waktuStart: number | null;
  duration: number;
  groupColor?: string;
};

interface BarChartSimpleProps {
  tasks: Task[];
}

export default function BarChartSimple({ tasks}: BarChartSimpleProps) {
  const barHeight = 40;
  const chartHeight = tasks.length * barHeight;

  //   const data = tasks.map((task) => ({
  //     processName: task.processName,
  //     duration: task.duration,
  //     fill: task.groupColor || "#8884d8", // Default color kalau tidak ada groupColor
  //   }));

  const groupedTasks = tasks.reduce((acc, curr) => {
    if (!acc[curr.processName]) {
      acc[curr.processName] = [];
    }
    acc[curr.processName].push(curr);
    return acc;
  }, {} as Record<string, Task[]>);

  //   Object.keys(groupedTasks).forEach((key) => {
  //     groupedTasks[key].sort((a, b) => a.waktuStart - b.waktuStart);
  //   });

  const modifiedTasks = Object.entries(groupedTasks).flatMap(
    ([processName, tasks], groupIndex) =>
      tasks.map((task, taskIndex) => {
        const totalEnd =
          (task.waktuStart ? task.waktuStart : 0) + task.duration;
        if (totalEnd <= 1440) {
          return {
            ...task,
            uniqueProcessName: `${processName}_${groupIndex}_${taskIndex}`,
            preDuration: 0,
            durationPart1: task.waktuStart,
            durationPart2: task.duration,
          };
        } else {
          return {
            ...task,
            uniqueProcessName: `${processName}_${groupIndex}_${taskIndex}`,
            preDuration: totalEnd - 1440,
            durationPart1: 1440 - task.duration - (totalEnd - 1440),
            durationPart2: task.duration,
          };
        }
      })
  );

//   const dataLine:lineData[] = data.flatMap((tes) => 
//   tes.cycles.flatMap((proc) => 
//     proc.process.flatMap((Task, index, array):lineData[] => {
//     const current = Task.waktuStart || 0;
//     const nextTask = array[index + 1];
//     const nextStart = nextTask?.waktuStart ?? null;
//     const finish = current + Task.duration;
//     const result:lineData[] = [
//       {
//         name: Task.newProcessName,
//         time: current,
//         color: Task.color
//       },
//       {
//         name: Task.newProcessName,
//         time: finish,
//         color: Task.color
//       },
//     ];

//     if (nextStart) {
//       if (nextStart !== null && nextStart >= finish) {
//         result.push({
//           name: Task.newProcessName,
//           time: nextTask.waktuStart,
//           color: Task.color
//         });

//         result.push({
//           name: nextTask.newProcessName,
//           time: nextTask.waktuStart,
//           color: Task.color
//         });
//       } else {
//         result.push({
//           name: Task.newProcessName,
//           time: 1440,
//           color: Task.color
//         });

//         result.push({
//           name: Task.newProcessName,
//           time: null,
//           color: Task.color
//         });

//         result.push({
//           name: nextTask.newProcessName,
//           time: 0,
//           color: Task.color
//         })
//       }
//     }
    
//     return result;
//   }))
// )

  return (
    <div style={{height: chartHeight }} className="w-auto">
      <ResponsiveContainer width="100%" height="120%">
        <BarChart
          data={modifiedTasks}
          layout="vertical"
          barSize={40}
          barGap={0}
          barCategoryGap="20%"
        >
        
          <CartesianGrid stroke="transparent" />
          <XAxis type="number" domain={[0, 1440]} hide />
          <YAxis
            dataKey="processName"
            type="category"
            width={100}
            tick={{ fontSize: 11, fill: "transparent" }}
            axisLine={false}
            tickLine={false}
            yAxisId={1}
          />
          <Bar dataKey="preDuration" stackId="a" yAxisId={1}>
            {tasks.map((entry, index) => (
              <Cell
                key={`cell-pre-${index}`}
                fill={entry.groupColor || "#8884d8"}
              />
            ))}
          </Bar>

          <Bar
            dataKey="durationPart1"
            fill="transparent"
            stackId="a"
            yAxisId={1}
          />

          <Bar dataKey="durationPart2" stackId="a" yAxisId={1}>
            {tasks.map((entry, index) => (
              <Cell
                key={`cell-main-${index}`}
                fill={entry.groupColor || "#8884d8"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
