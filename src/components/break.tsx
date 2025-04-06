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
import { getColor } from "@/app/utils/color";

type Shift = {
  id: number;
  kode_shift: string;
  jam_mulai: string;
  jam_selesai: string;
};

const CustomTooltip = ({
  active,
  payload,
}: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const timeEntries = Object.entries(data).filter(([key]) =>
      /^\d{2}\.\d{2}$/.test(key)
    );
    const formatted = timeEntries.map(([time, shift]) => ({
      time,
      shift: String(shift),
    }));

    const grouped = formatted.reduce((acc, curr) => {
      if (!acc[curr.shift]) {
        acc[curr.shift] = [];
      }
      acc[curr.shift].push(curr.time);
      return acc;
    }, {} as { [key: string]: string[] });

    return (
      <div className="custom-tooltip bg-white/80 rounded-md p-5">
        {Object.entries(grouped).map(([shift, times]) => (
          <div key={shift}>
            <small className="text-secondary">
              {shift}: {times.join(" - ")}
            </small>
          </div>
        ))}
      </div>
    );
  }

  return null;
};

const RenderLegend = (props: LegendProps) => {
  const { payload } = props;
  const colors = [, "#F43F5E", "#FDE047", "#22D3EE"];
  return (
    <div className="flex justify-center text-xs text-center">
      {payload?.map((entry, index) =>
        index % 3 == 0 ? (
          <div key={index}>
            <FaSquareFull
              className="mx-2 items-center justify-center"
              size={10}
              color={colors[Math.floor(index / 3 + 1)]}
            />
            <span className="mx-2" key={`item-${index}`}>
              {entry.value}
            </span>
          </div>
        ) : (
          ""
        )
      )}
    </div>
  );
};

export default function Shifts({ data }: { data: Shift[] }) {
  const shift: { [key: string]: number | string } = {};
  for (let i = 0; i < data.length; i++) {
    const mulai = timetoIndex(
      new Intl.DateTimeFormat("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "UTC",
      }).format(new Date(data[i].jam_mulai))
    );
    const selesai = timetoIndex(
      new Intl.DateTimeFormat("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "UTC",
      }).format(new Date(data[i].jam_selesai))
    );

    shift[data[i].kode_shift] =
      selesai < mulai ? 1440 - mulai : selesai - mulai - 10;
    shift[
      new Intl.DateTimeFormat("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "UTC",
      }).format(new Date(data[i].jam_mulai))
    ] = data[i].kode_shift;
    shift[
      new Intl.DateTimeFormat("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "UTC",
      }).format(new Date(data[i].jam_selesai))
    ] = data[i].kode_shift;
  }

  const formatted = [
    {
      ...shift,
      nama: "shift",
    },
  ];
  return (
    <div
      className=" max-w-screen items-center place-center absolute"
      style={{ height: 100, width: "100%" }}
    >
      <ResponsiveContainer width="100%" height={60} className="top-10">
        <BarChart
          data={formatted}
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
            hide
            type="number"
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
              <CustomTooltip
                active={props.active}
                payload={props.payload}
                label={props.label}
              />
            )}
          />
          {Object.keys(formatted[0])
            .filter((key) => key !== "nama")
            .map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                fill={getColor(index + 9)}
                stackId="a"
              />
            ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
