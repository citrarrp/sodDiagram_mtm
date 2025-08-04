"use client";
import { timetoIndex } from "@/app/utils/timeDuration";
import React from "react";
import {
  ResponsiveContainer,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  TooltipProps,
  Legend,
  LegendProps,
} from "recharts";

import {
  NameType,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";
import { FaSquareFull } from "react-icons/fa";

type Shift = {
  id: number;
  kode_shift: string;
  jam_mulai: string;
  jam_selesai: string;
};

const colors = ["#BFBBCE", "#a38f88", "#dab080", "#8CBEB2", "#F2B5D4"];

const CustomTooltip = ({
  active,
  payload,
  tooltipMap,
}: TooltipProps<ValueType, NameType> & {
  tooltipMap: { [shift: string]: string[] };
}) => {
  // if (active && payload && payload.length) {
  //   const data = payload[0].payload;
  //   const timeEntries = Object.entries(data).filter(([key]) =>
  //     /^\d{2}\.\d{2}$/.test(key)
  //   );
  //   const formatted = timeEntries.map(([time, shift]) => ({
  //     time,
  //     shift: String(shift),
  //   }));

  //   const grouped = formatted.reduce((acc, curr) => {
  //     if (!acc[curr.shift]) {
  //       acc[curr.shift] = [];
  //     }
  //     acc[curr.shift].push(curr.time);
  //     return acc;
  //   }, {} as { [key: string]: string[] });

  //   return (
  //     <div className="custom-tooltip bg-white/80 rounded-md p-5">
  //       {Object.entries(grouped).map(([shift, times]) => (
  //         <div key={shift}>
  //           <small className="text-secondary">
  //             {shift}: {times.join(" - ")}
  //           </small>
  //         </div>
  //       ))}
  //     </div>
  //   );
  // }
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip bg-white/80 rounded-md p-5">
        {payload.map((entry) => {
          const shift = entry.name;
          const times = tooltipMap[shift ?? "Shift 1"] ?? [];
          return (
            <div key={shift}>
              <strong>{shift}</strong>: {times.join(" - ")}
            </div>
          );
        })}
      </div>
    );
  }

  return null;
};

const RenderLegend = ({ payload }: LegendProps) => {
  // const { payload } = props;
  // return (
  //   <div className="flex justify-center text-xs text-center">
  //     {payload?.map((entry, index) =>
  //       index % 3 == 0 ? (
  //         <div key={index}>
  //           <FaSquareFull
  //             className="mx-2 items-center justify-center"
  //             size={10}
  //             color={colors[Math.floor(index / 3 + 1)]}
  //           />
  //           <span className="mx-2" key={`item-${index}`}>
  //             {entry.value}
  //           </span>
  //         </div>
  //       ) : (
  //         ""
  //       )
  //     )}
  //   </div>
  // );
  if (!payload) return null;
  return (
    <div className="flex justify-center text-center text-xs">
      {payload.map((entry, index) => (
        <div
          key={entry.value}
          className="flex items-center mx-2 justify-center"
        >
          <FaSquareFull size={10} color={colors[index % colors.length]} />
          <span>{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function Shifts({ data }: { data: Shift[] }) {
  //   const shift: { [key: string]: number | string } = {};
  //   for (let i = 0; i < data.length; i++) {
  //     const mulai = timetoIndex(
  //       new Intl.DateTimeFormat("id-ID", {
  //         hour: "2-digit",
  //         minute: "2-digit",
  //         hour12: false,
  //         timeZone: "UTC",
  //       }).format(new Date(data[i].jam_mulai))
  //     );
  //     const selesai = timetoIndex(
  //       new Intl.DateTimeFormat("id-ID", {
  //         hour: "2-digit",
  //         minute: "2-digit",
  //         hour12: false,
  //         timeZone: "UTC",
  //       }).format(new Date(data[i].jam_selesai))
  //     );

  //     shift[data[i].kode_shift] =
  //       selesai < mulai ? 1440 - mulai : selesai - mulai - 10;
  //     shift[
  //       new Intl.DateTimeFormat("id-ID", {
  //         hour: "2-digit",
  //         minute: "2-digit",
  //         hour12: false,
  //         timeZone: "UTC",
  //       }).format(new Date(data[i].jam_mulai))
  //     ] = data[i].kode_shift;
  //     shift[
  //       new Intl.DateTimeFormat("id-ID", {
  //         hour: "2-digit",
  //         minute: "2-digit",
  //         hour12: false,
  //         timeZone: "UTC",
  //       }).format(new Date(data[i].jam_selesai))
  //     ] = data[i].kode_shift;
  //   }

  //   const formatted = [
  //     {
  //       ...shift,
  //       nama: "shift",
  //     },
  //   ];
  //   return (
  //     <div
  //       className=" max-w-screen items-center place-center absolute"
  //       style={{ height: 100, width: "100%" }}
  //     >
  //       <ResponsiveContainer width="100%" height={60} className="top-10">
  //         <BarChart
  //           data={formatted}
  //           layout="vertical"
  //           width={100}
  //           height={10}
  //           margin={{ left: 45 }}
  //         >
  //           <CartesianGrid stroke="0" />
  //           <Legend
  //             content={<RenderLegend />}
  //             layout="horizontal"
  //             verticalAlign="top"
  //             align="center"
  //             className="text-center items-center"
  //           />
  //           <XAxis
  //             hide
  //             type="number"
  //             domain={[0, 1440]}
  //             ticks={[...Array(49)].map((_, i) => i * 30)}
  //           />
  //           <YAxis
  //             type="category"
  //             dataKey="nama"
  //             tickLine={false}
  //             color="transparent"
  //             tick={{ fontSize: 12 }}
  //             allowDuplicatedCategory={false}
  //           />

  //           <Tooltip
  //             wrapperStyle={{ top: -70, transition: "none" }}
  //             content={(props) => (
  //               <CustomTooltip
  //                 active={props.active}
  //                 payload={props.payload}
  //                 label={props.label}
  //               />
  //             )}
  //           />
  //           {Object.keys(formatted[0])
  //             .filter((key) => key !== "nama")
  //             .map((key, index) => (
  //               <Bar key={key} dataKey={key} fill={colors[index]} stackId="a" />
  //             ))}
  //         </BarChart>
  //       </ResponsiveContainer>
  //     </div>
  //   );
  // }

  const formatter = new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  });

  const shiftsDuration: { [shift: string]: number } = {};
  const tooltipMap: { [shift: string]: string[] } = {};

  data.forEach((shift) => {
    const jamMulai = formatter.format(new Date(shift.jam_mulai));
    const jamSelesai = formatter.format(new Date(shift.jam_selesai));

    const mulaiIndex = timetoIndex(jamMulai);
    const selesaiIndex = timetoIndex(jamSelesai);

    let durasi = selesaiIndex - mulaiIndex;
    if (durasi < 0) durasi = 1440 - mulaiIndex + selesaiIndex;
    durasi -= 10;

    shiftsDuration[shift.kode_shift] = durasi;
    tooltipMap[shift.kode_shift] = [jamMulai, jamSelesai];
  });

  const chartData = [
    {
      nama: "shift",
      ...shiftsDuration,
    },
  ];

  return (
    <div
      className=" max-w-screen items-center place-center absolute"
      style={{ height: 100, width: "100%" }}
    >
      <ResponsiveContainer width="100%" height={60} className="top-10">
        <BarChart
          data={chartData}
          layout="vertical"
          width={100}
          height={10}
          margin={{ left: 45 }}
        >
          <CartesianGrid stroke="0" />
          <Legend
            content={<RenderLegend />}
            layout="horizontal"
            verticalAlign="top"
            align="center"
            className="text-center items-center"
          />
          <XAxis
            type="number"
            hide
            domain={[0, 1440]}
            ticks={[...Array(49)].map((_, i) => i * 30)}
          />
          <YAxis
            type="category"
            dataKey="nama"
            tickLine={false}
            color="transparent"
            tick={{ fontSize: 12 }}
            allowDuplicatedCategory={false}
          />
          <Tooltip
            wrapperStyle={{ top: -70, transition: "none" }}
            content={(props) => (
              <CustomTooltip {...props} tooltipMap={tooltipMap} />
            )}
          />
          {Object.keys(shiftsDuration).map((key, index) => (
            <Bar
              key={key}
              dataKey={key}
              fill={colors[index % colors.length]}
              stackId="a"
              name={key}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
