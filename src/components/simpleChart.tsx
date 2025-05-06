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

export default function BarChartSimple({ tasks }: BarChartSimpleProps) {
  const barHeight = 40;
  const chartHeight = tasks.length * barHeight;

  const groupedTasks = tasks.reduce((acc, curr) => {
    if (!acc[curr.processName]) {
      acc[curr.processName] = [];
    }
    acc[curr.processName].push(curr);
    return acc;
  }, {} as Record<string, Task[]>);

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
            color: task.groupColor,
          };
        } else {
          return {
            ...task,
            uniqueProcessName: `${processName}_${groupIndex}_${taskIndex}`,
            preDuration: totalEnd - 1440,
            durationPart1: 1440 - task.duration - (totalEnd - 1440),
            durationPart2: task.duration,
            color: task.groupColor,
          };
        }
      })
  );

  const processNames = Object.keys(groupedTasks);

  const maxBatchLength = Math.max(
    ...processNames.map((name) => groupedTasks[name].length)
  );
  const batches = Array.from({ length: maxBatchLength }, (_, taskIndex) => {
    return processNames.map((processName, groupIndex) => {
      const tasks = groupedTasks[processName];
      const realTaskIndex = Math.min(taskIndex, tasks.length - 1);
      const task = tasks[realTaskIndex];
      const totalEnd = (task.waktuStart ?? 0) + task.duration;

      return {
        ...task,
        uniqueProcessName: `${processName}_${groupIndex}_${realTaskIndex}`,
        preDuration: totalEnd > 1440 ? totalEnd - 1440 : 0,
        durationPart1:
          totalEnd > 1440
            ? 1440 - task.duration - (totalEnd - 1440)
            : task.waktuStart,
        durationPart2: task.duration,
        color: task.groupColor || "transparent",
      };
    });
  });

  const taskIndexMap: Record<number, Task[]> = {};

  modifiedTasks.forEach((task) => {
    const idx = parseInt(task.uniqueProcessName.split("_").pop() || "0");
    if (!taskIndexMap[idx]) taskIndexMap[idx] = [];
    taskIndexMap[idx].push(task);
  });

  return (
    <div
      style={{ position: "relative", height: chartHeight }}
      className="w-auto h-auto"
    >
      {Object.entries(batches).map(([taskIndex, taskList], index) => {
        return (
          <div
            key={taskIndex}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              zIndex: index,
              pointerEvents: "none",
            }}
          >
            <ResponsiveContainer height={367} minWidth={400} minHeight={300}>
              <BarChart
                data={taskList}
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
                  {taskList.map((entry, index) => (
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
                  {taskList.map((entry, index) => (
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
      })}
    </div>
  );
}
