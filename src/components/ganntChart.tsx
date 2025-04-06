"use client";

import { timetoIndex } from "@/app/utils/timeDuration";
// import { useMemo } from "react";
import React from "react";
import {
  ResponsiveContainer,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ComposedChart,
  Line,
  Scatter,
  ReferenceArea,
  TooltipProps,
  Legend,
  LegendProps,
} from "recharts";
import {
  NameType,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";
import { FaSquareFull } from "react-icons/fa";
import { getColor } from "@/app/utils/color";

type task = {
  processName: string;
  waktuStart: number;
  duration: number;
};

type cycleProcess = {
  customerName: string;
  cycle: number;
  process: task[];
};

type Break = {
  id: number;
  shift_id: number;
  nama_istirahat: string;
  jam_mulai: string;
  jam_selesai: string;
};

type allCycles = {
  cycle: number;
  color: string;
  customer: string;
};

type SOD = {
  id: number;
  customerName: string;
  processName: string;
  cycle: string;
  waktu: string;
  durasi: string;
};

const GanttChart = ({
  sodD,
  task,
  color,
  breaks,
  indeks,
  payload,
  domainAx,
}: {
  sodD: SOD[];
  task: cycleProcess;
  breaks: Break[];
  color: string;
  indeks: number;
  payload: allCycles[];
  domainAx: string[];
}) => {
  const barHeight = 40;
  const chartHeight = task.process.length * barHeight;

  console.log("data task", task);
  const groupedTasks = task.process.reduce((acc, curr) => {
    if (!acc[curr.processName]) {
      acc[curr.processName] = [];
    }
    acc[curr.processName].push(curr);
    return acc;
  }, {} as Record<string, task[]>);

  Object.keys(groupedTasks).forEach((key) => {
    groupedTasks[key].sort((a, b) => a.waktuStart - b.waktuStart);
  });

  const modifiedTasks = Object.entries(groupedTasks).flatMap(
    ([processName, tasks], groupIndex) =>
      tasks.map((task, taskIndex) => ({
        ...task,
        uniqueProcessName: `${processName}_${groupIndex}_${taskIndex}`,
        preDuration: taskIndex === 0 ? task.waktuStart : 0,
        duration: task.duration,
      }))
  );

  const taskCp = [...modifiedTasks];

  // const Task = modifiedTasks.map((Task, index) => {
  //   if (index === modifiedTasks.length - 1) {
  //     return {
  //       ...Task,
  //       duration: null,
  //       waktuFinish: null,
  //       waktuStart: null,
  //       preDuration: null,
  //     };
  //   }
  //   return Task;
  // });

  const breakItem = sodD
    .filter((item) => item.customerName === task.customerName)
    .filter((item) => Number(item.cycle) === task.cycle)
    .find((item) => item.processName.toLowerCase().includes("istirahat"));

  const breakTime = {
    processName: breakItem?.processName,
    waktu: timetoIndex(
      new Intl.DateTimeFormat("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "UTC",
      }).format(new Date(breakItem?.durasi == null ? 0 : breakItem?.durasi))
    ),
  };

  console.log(breakTime, "istirahat", task.cycle);

  const modifiedTasksSplit = task.process.map((Task) => {
    const isPulling = Task.processName.includes("PULLING");
    const totalEnd = Task.waktuStart + Task.duration;
    console.log(isPulling, Task.processName, "status");
    if (totalEnd <= 1440) {
      return {
        ...Task,
        cycle: task.cycle,
        preDuration: null,
        durationPart1: Task.waktuStart,
        durationPart2: Task.duration + (isPulling ? breakTime.waktu : 0),
      };
    } else {
      return {
        ...Task,
        cycle: task.cycle,
        preDuration:
          Task.waktuStart +
          Task.duration +
          (isPulling ? breakTime.waktu : 0) -
          1440,
        durationPart1:
          1440 - (Task.duration + (isPulling ? breakTime.waktu : 0)),

        durationPart2: 1440 - Task.waktuStart,
      };
    }
  });

  const scatterdata = taskCp.map((Task, index) => {
    if (index < taskCp.length - 1) {
      return {
        ...Task,
        duration: null,
        waktuFinish: null,
        waktuStart: null,
        preDuration: null,
      };
    }
    return Task;
  });

  const scatter = scatterdata.map((d) => ({
    processName: d.processName,
    waktuFinish:
      (d.duration ? d.duration : 0) + (d.waktuStart ? d.waktuStart : 0),
  }));

  const modifScatter = scatter.map((d) => ({
    ...d,
    fillOpacity: d.waktuFinish === 0 ? 0 : 1,
  }));

  const formatDuration = (value: number) => {
    const hours = Math.floor(value / 60);
    const minutes = value % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  };

  const processMap = Object.fromEntries(
    domainAx.map((name, index) => [name, index])
  );
  console.log("mapping", processMap);

  console.log(modifiedTasksSplit, "data bar");

  const LineData = task.process.flatMap((Task, index, array) => {
    const isPulling = Task.processName.includes("PULLING");
    const current = Task.waktuStart;
    const nextTask = array[index + 1];
    const finish = current + Task.duration + (isPulling ? breakTime.waktu : 0);

    const name = processMap[`${Task.processName}_${indeks}`];
    const lines: {
      name: number;
      TaskLine: number | null;
      // PrevLine: number | null;
      NextLine: number | null;
    }[] = [];

    if (finish <= 1440) {
      lines.push(
        {
          name,
          TaskLine: current,
          // PrevLine: null,
          NextLine: null,
        },
        {
          name,
          TaskLine: finish,
          // PrevLine: null,
          NextLine: null,
        }
      );
    } else {
      const overflow = finish - 1440;

      lines.push(
        {
          name,
          TaskLine: 0,
          // PrevLine: null,
          NextLine: null,
        },
        {
          name,
          TaskLine: overflow,
          // PrevLine: null,
          NextLine: null,
        },
        {
          name,
          TaskLine: null,
          // PrevLine: null,
          NextLine: null,
        },
        {
          name,
          TaskLine: current,
          // PrevLine: null,
          NextLine: null,
        },
        {
          name,
          TaskLine: 1440,
          // PrevLine: null,
          NextLine: null,
        }
      );
    }

    // --- 2. PREV LINE ---
    // if (prevTask) {
    //   const prevFinish =
    //     prevTask.waktuStart +
    //     prevTask.duration +
    //     (isPulling ? breakTime.waktu : 0);
    //   // if (prevFinish > 1440 || current > 1440) {
    //   lines.push(
    //   {
    //     name: processMap[`${prevTask.processName}_${indeks}`],
    //     TaskLine: null,
    //     PrevLine: prevFinish > 1440 ? prevFinish - 1440 : prevFinish,
    //     NextLine: null,
    //   },
    //   {
    //     name,
    //     TaskLine: null,
    //     PrevLine: prevFinish > 1440 ? prevFinish - 1440 : prevFinish,
    //     NextLine: null,
    //   }
    // );
    // } else {
    //   lines.push(
    //     {
    //       name,
    //       TaskLine: null,
    //       PrevLine: prevFinish,
    //       NextLine: null,
    //     },
    //     {
    //       name,
    //       TaskLine: null,
    //       PrevLine: current,
    //       NextLine: null,
    //     }
    //   );
    // }
    // }

    // --- 3. NEXT LINE ---
    if (nextTask) {
      const nextStart = nextTask.waktuStart;
      // const adjustedFinish = finish > 1440 ? finish - 1440 : finish;
      const adjustedNextStart = nextStart > 1440 ? nextStart - 1440 : nextStart;

      if (nextStart > finish % 1440 || nextStart == finish % 1440) {
        lines.push(
          {
            name,
            TaskLine: null,
            PrevLine: null,
            NextLine: finish % 1440,
          },
          {
            name: processMap[`${nextTask.processName}_${indeks}`],
            TaskLine: null,
            PrevLine: null,
            NextLine: finish % 1440,
          },
          {
            name: processMap[`${nextTask.processName}_${indeks}`],
            TaskLine: null,
            PrevLine: null,
            NextLine: adjustedNextStart,
          }
        );
      } else {
        lines.push(
          {
            name,
            TaskLine: null,
            PrevLine: null,
            NextLine: finish,
          },
          {
            name,
            TaskLine: null,
            PrevLine: null,
            NextLine: 1440,
          },
          {
            name,
            TaskLine: null,
            PrevLine: null,
            NextLine: null,
          },
          {
            name: processMap[`${nextTask.processName}_${indeks}`],
            TaskLine: null,
            PrevLine: null,
            NextLine: 0,
          },
          {
            name: processMap[`${nextTask.processName}_${indeks}`],
            TaskLine: null,
            PrevLine: null,
            NextLine: nextStart,
          }
        );
      }
    }

    console.log(lines, "line data");
    return lines;
  });

  const dataLine = task.process.flatMap((Task, index, array) => {
    const isPulling = Task.processName.includes("PULLING");
    const current = Task.waktuStart;
    const nextTask = array[index + 1];
    const prevTask = array[index - 1];
    const nextStart = nextTask?.waktuStart ?? null;
    const finish = current + Task.duration + (isPulling ? breakTime.waktu : 0);
    // const endTime = finish < current ? null : current;

    const result: { name: number; time: number | null }[] = [
      {
        name: processMap[`${Task.processName}_${indeks}`],
        time: current,
      },
      {
        name: processMap[`${Task.processName}_${indeks}`],
        time: finish,
      },
    ];

    console.log(result);

    if (
      prevTask &&
      prevTask.waktuStart +
        prevTask.duration +
        (isPulling ? breakTime.waktu : 0) >
        1440
    ) {
      result.push({
        name: processMap[`${Task.processName}_${indeks}`],
        time: null,
      });
      result.push({
        name: processMap[`${prevTask.processName}_${indeks}`],
        time: Task.waktuStart,
      });
      // result.push({
      //   name: processMap[`${prevTask.processName}_${indeks}`],
      //   time: prevTask.waktuStart + prevTask.duration + (isPulling ? breakTime.waktu : 0) - 1440
      // });
      // result.push({
      //   name: processMap[`${Task.processName}_${indeks}`],
      //   time: prevTask.waktuStart + prevTask.duration + (isPulling ? breakTime.waktu : 0) - 1440
      // });
      // result.push({
      //   name: processMap[`${prevTask.processName}_${indeks}`],
      //   time: Task.waktuStart
      // });
    }

    if (nextStart && index !== -1) {
      if (nextStart > finish || nextStart == finish) {
        const nextTaskFinish =
          nextStart + nextTask.duration + (isPulling ? breakTime.waktu : 0);
        if (nextTaskFinish > 1440) {
          result.push({
            name: processMap[`${Task.processName}_${indeks}`],
            time: finish,
          });
          result.push({
            name: processMap[`${nextTask.processName}_${indeks}`],
            time: finish,
          });
          result.push({
            name: processMap[`${nextTask.processName}_${indeks}`],
            time: nextTask.waktuStart,
          });
          result.push({
            name: processMap[`${nextTask.processName}_${indeks}`],
            time: 1440,
          });
          result.push({
            name: processMap[`${nextTask.processName}_${indeks}`],
            time: null,
          });

          // result.push({
          //   name: processMap[`${nextTask.processName}_${indeks}`],
          //   time: 0 ,
          // });
          // result.push({
          //   name: processMap[`${nextTask2.processName}_${indeks}`],
          //   time: nextTask.duration + nextTask.waktuStart  - 1440,
          // });
          // result.push({
          //   name: processMap[`${nextTask2.processName}_${indeks}`],
          //   time: nextTask.waktuStart
          // });
        } else {
          result.push({
            name: processMap[`${Task.processName}_${indeks}`],
            time: finish,
          });

          result.push({
            name: processMap[`${nextTask.processName}_${indeks}`],
            time: finish,
          });

          result.push({
            name: processMap[`${nextTask.processName}_${indeks}`],
            time: nextTask.waktuStart,
          });
        }
      } else {
        result.push({
          name: processMap[`${Task.processName}_${indeks}`],
          time: 1440,
        });

        result.push({
          name: processMap[`${Task.processName}_${indeks}`],
          time: null,
        });

        result.push({
          name: processMap[`${nextTask.processName}_${indeks}`],
          time: 0,
        });

        result.push({
          name: processMap[`${nextTask.processName}_${indeks}`],
          time: nextTask.waktuStart,
        });
      }
    }
    return result;
  });

  console.log(task.process);
  console.log(dataLine, "contoh line");

  breaks.map((item) => {
    const istirahat: { time1: number; time2: number }[] = [];
    istirahat.push({
      time1: timetoIndex(item.jam_mulai),
      time2: timetoIndex(item.jam_selesai),
    });
  });

  const CustomTooltip = ({
    active,
    payload,
  }: TooltipProps<ValueType, NameType>) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;

      return (
        <div className="custom-tooltip bg-white/80 rounded-md p-5">
          <p className="text-md">{data.processName}</p>
          <p className="text-xs">Durasi : {formatDuration(data.duration)}</p>
        </div>
      );
    }

    return null;
  };

  const filteredCycles = payload
    .filter((item) => item.customer === task.customerName)
    .sort((a, b) => a.cycle - b.cycle);
  const RenderLegend = (props: LegendProps) => {
    const { payload } = props;

    return (
      <div className="flex justify-center text-xs text-center">
        {payload?.map((entry, index) => (
          <div key={index}>
            <FaSquareFull
              className="mx-2 items-center justify-center"
              size={10}
              color={getColor(index)}
            />
            <span className="mx-2" key={`item-${index}`}>
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div
      className={`max-w-screen items-center place-center absolute
      `} //absolute ya kalau gabungin
      style={{ height: 1.5 * chartHeight, width: "100%" }}
    >
      <ResponsiveContainer
        width={"100%"}
        height={450}
        minWidth={400}
        minHeight={300}
      >
        <ComposedChart
          data={modifiedTasksSplit}
          layout="vertical"
          barSize={37}
          barGap={0}
          barCategoryGap={0}
        >
          <CartesianGrid stroke="transparent" />
          {indeks === 0 &&
            breaks.map((b, index) => (
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
                yAxisId={1}
                strokeOpacity={0.05}
              />
            ))}

          <XAxis
            type="number"
            domain={[0, 1440]}
            ticks={[...Array(49)].map((_, i) => i * 30)}
            tickFormatter={(tick) => formatDuration(tick)}
            orientation="top"
            interval={0}
            tick={indeks == 0 ? { fontSize: 7 } : { opacity: 0 }} // Kalau bukan chart pertama, hide tick/label
            axisLine={indeks == 0} // Hide garis juga kalau bukan chart pertama
            tickLine={indeks == 0}
          />

          <YAxis
            allowDuplicatedCategory={false}
            tick={{ fontSize: 9 }}
            dataKey="processName"
            type="category"
            width={100}
            yAxisId={1}
            interval={"preserveStartEnd"}
            hide
          />
          <YAxis
            dataKey={"name"}
            padding={{ top: 4, bottom: 6 }}
            domain={[0, domainAx.length - 1]}
            type="number"
            width={100}
            height={90}
            ticks={domainAx}
            yAxisId={2}
            tick={indeks == 0 ? { fontSize: 5 } : { opacity: 0 }}
            orientation="right"
            hide
          />

          <YAxis
            dataKey="processName"
            type="category"
            width={100}
            fontSize={11}
            yAxisId={3}
            interval={"preserveStartEnd"}
            tick={indeks == 0 ? { fontSize: 11 } : { opacity: 0 }} // Kalau bukan chart pertama, hide tick/label
            axisLine={indeks == 0} // Hide garis juga kalau bukan chart pertama
            tickLine={indeks == 0}
          />
          <Tooltip
            wrapperStyle={{ transition: "none" }}
            content={(props) => (
              <CustomTooltip
                active={props.active}
                payload={props.payload}
                label={props.label}
              />
            )}
          />

          <Legend
            content={<RenderLegend />}
            payload={filteredCycles.map((item) => ({
              value: `Cycle ${item.cycle}`,
              color: item.color,
            }))}
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
            className="text-center items-center"
            wrapperStyle={{
              paddingTop: 20,
              color: "black",
              opacity: indeks === 0 ? 1 : 0,
              pointerEvents: indeks === 0 ? "auto" : "none",
            }}
          />

          <Bar dataKey="preDuration" stackId="a" fill={color} yAxisId={3} />
          <Bar
            dataKey="durationPart1"
            stackId="a"
            fill="transparent"
            yAxisId={3}
          />
          <Bar dataKey="durationPart2" stackId="a" fill={color} yAxisId={3} />

          <Line
            data={LineData}
            type="stepAfter"
            dataKey="TaskLine"
            stroke={color}
            strokeWidth={2}
            height={400}
            dot={false}
            yAxisId={2}
            connectNulls={false}
            className="mt-150"
          />

          <Line
            data={LineData}
            type="stepAfter"
            dataKey="NextLine"
            stroke={color}
            strokeWidth={2}
            height={400}
            dot={false}
            yAxisId={2}
            connectNulls={false}
            className="mt-150"
          />
          <Scatter
            data={modifScatter}
            dataKey="waktuFinish"
            fill={color}
            shape="circle"
            name="processName"
            yAxisId={1}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};
export default GanttChart;
