"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import GanttChart from "@/components/ganntChart";
import Shifts from "@/components/break";
import BarChartSimple from "@/components/simpleChart";
import { SOD } from "@/components/gantt";
import { getColor } from "@/app/utils/color";
import { getBreaks, getDiagram, getShifts, getSOD } from "@/lib/function";
import Link from "next/link";
import { IoArrowBackCircle } from "react-icons/io5";
import ProsesChart from "@/components/chartProses";

type task = {
  processName: string;
  waktuStart: number;
  duration: number;
};
type cycleProcess = {
  customerName: string;
  cycle: number;
  process: task[];
  updateMonth: string;
};

type groupedCust = {
  customerName: string;
  cycles: cycleProcess[];
  updateMonth: string;
};

type Shift = {
  id: number;
  kode_shift: string;
  jam_mulai: string;
  jam_selesai: string;
};

type ShiftResponse = {
  status: number;
  success: boolean;
  data: Shift[];
};

type breaksData = {
  id: number;
  shift_id: number;
  nama_istirahat: string;
  jam_mulai: string;
  jam_selesai: string;
};

type BreakResponse = {
  status: number;
  success: boolean;
  data: breaksData[];
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

type SODResponse = {
  status: number;
  success: boolean;
  data: SOD[];
  totalUniqueCustomer: number;
  page: number;
  totalPages: number;
};

type Task = {
  processName: string;
  waktuStart: number | null;
  duration: number;
  groupColor?: string;
};

type CycleProcess = {
  customerName: string;
  cycle: number;
  process: Task[];
};

type GroupedCust = {
  customerName: string;
  cycles: CycleProcess[];
};

type DiagramSOD = {
  id: number;
  processName: string;
  kode: string;
};

type DiagramResponse = {
  status: number;
  success: boolean;
  data: DiagramSOD[];
};

const generateColor = (index: number): string => {
  const colors = [
    "#FF69B4", // Hot Pink
    "#FF6F91", // Coral Pink (gelap)
    "#993365", // ungu gelap
    "#e36c0b", // Salmon ORANGE
    "#00FFFF", // Light Cyan BIRU TERANG
    "#40E0D0", // Turquoise HIJAU TOSCA
    "#3F6212", // hijau gelap
    "#FFC300", // Neon Orange
    "#0000fe", // Lavender UNGU TERANG pastel
  ];
  return colors[index % colors.length];
};

const createUniqueProcessCyclePerCustomer = (
  grouped: GroupedCust[]
): CycleProcess[] => {
  const processColors: Record<string, string> = {};
  let colorIndex = 0;

  return grouped.map((cust) => {
    const processOccurrences: Record<string, Set<string>> = {};
    const processDetails: Record<string, Task> = {};
    const processNamesSet = new Set<string>();

    cust.cycles.forEach((cycle) => {
      cycle.process.forEach((proc, idx) => {
        const key = `${proc.processName}&${proc.waktuStart}&${proc.duration}&${idx}`;
        const cycleKey = `${cust.customerName}&${cycle.cycle}`;

        processNamesSet.add(proc.processName);

        if (!processOccurrences[key]) {
          processOccurrences[key] = new Set();
        }
        processOccurrences[key].add(cycleKey);

        if (!processDetails[key]) {
          processDetails[key] = { ...proc };
        }
        if (!processColors[key]) {
          processColors[key] = generateColor(colorIndex);
          colorIndex++;
        }
      });
    });

    const finalProcesses: Task[] = [];
    processNamesSet.forEach((processName) => {
      const matchingEntry = Object.entries(processOccurrences).filter(
        ([key, cycleSet]) => {
          const [name] = key.split("&");
          return name === processName && cycleSet.size > 1;
        }
      );

      if (matchingEntry.length > 0) {
        matchingEntry.forEach(([key]) => {
          finalProcesses.push({
            ...processDetails[key],
            groupColor: processColors[key],
          });
        });
      } else {
        finalProcesses.push({
          processName,
          waktuStart: null,
          duration: 0,
          groupColor: processColors[processName],
        });
      }
    });

    return {
      customerName: cust.customerName,
      cycle: 999,
      process: finalProcesses,
    };
  });
};

export default function Page() {
  const [sod, setDataSOD] = useState<SODResponse>();
  const [filteredSOD, setfilteredSOD] = useState<SODResponse>();
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setShifts] = useState<ShiftResponse>();
  const [breaks, setBreaks] = useState<BreakResponse>();
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [diagram, setDiagram] = useState<DiagramResponse>();
  // const [isWrapping, setWrapping] = useState<boolean>(false);
  // const [isPulling, setPulling] = useState<boolean>(false);
  // const [isLoadTruck, setLoadTruck] = useState<boolean>(false);
  const [selectedProses, setSelectedProses] = useState<string | null>(null);

  const processes = ["PULLING (60')", "WRAPPING", "LOADING TRUCK (30')"];
  const controllerRef = useRef<AbortController>(null);
  useEffect(() => {
    const controller = new AbortController();
    controllerRef.current = controller;
    const fetchFiltered = async () => {
      setLoading(true);
      try {
        const [sodRes, shiftRes, breakRes, diagramRes] = await Promise.all([
          getSOD(),
          getShifts(),
          getBreaks(),
          getDiagram(),
        ]);
        if (sodRes.success && sodRes.data) {
          setDataSOD(sodRes);
          setfilteredSOD(sodRes);
          setShifts(shiftRes);
          setBreaks(breakRes);
          setDiagram(diagramRes);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchFiltered();
  }, []);

  const displayedData = useMemo(() => {
    if (!selectedCustomer || !sod?.data) return sod;
    return {
      ...sod,
      data: sod.data.filter((item) => item.customerName === selectedCustomer),
    };
  }, [selectedCustomer, sod]);

  const hasil = useMemo(() => SOD(filteredSOD?.data || []), [filteredSOD]);
  const grouped = useMemo(() => {
    return (hasil || []).reduce((acc: groupedCust[], item: cycleProcess) => {
      const existing = acc.find(
        (cust) => cust.customerName === item.customerName
      );
      if (existing) {
        existing.cycles.push(item);
      } else {
        acc.push({
          customerName: item.customerName,
          cycles: [item],
          updateMonth: item.updateMonth,
        });
      }
      return acc;
    }, []);
  }, [hasil]);

  const allCycles = useMemo(() => {
    return grouped.flatMap((customer) =>
      customer.cycles.map((cycle, index) => ({
        customer: customer.customerName,
        cycle: cycle.cycle,
        color: getColor(index),
      }))
    );
  }, [grouped]);

  const lineResult = useMemo(() => {
    return grouped.map((customer) => {
      const groupedProcesses: Record<string, string[]> = {};
      customer.cycles
        .sort((a, b) => a.cycle - b.cycle)
        .forEach((cycle, index) => {
          cycle.process.forEach((proc) => {
            if (!groupedProcesses[proc.processName]) {
              groupedProcesses[proc.processName] = [];
            }
            groupedProcesses[proc.processName].push(
              `${proc.processName}_${index}`
            );
          });
        });

      return {
        customerName: customer.customerName,
        processes: Object.values(groupedProcesses).flat(),
      };
    });
  }, [grouped]);

  const uniqueProcessPerCustomer = useMemo(
    () => createUniqueProcessCyclePerCustomer(grouped),
    [grouped]
  );

  const hasilProses = useMemo(
    () =>
      sod?.data.filter(
        (item) => item.processName === selectedProses || item.processName === ""
      ),
    [sod?.data, selectedProses]
  );
  // console.log(hasilProses);

  // const tinggiReal =
  //   Math.round((hasilProses?.length ? hasilProses.length : 0) / 9) * 300;

  // const hasilProsesSelect = useMemo(
  //   () => SOD(hasilProses || []),
  //   [hasilProses]
  // );
  // const groupedProses = useMemo(() => {
  //   return (hasilProsesSelect || []).reduce(
  //     (acc: groupedCust[], item: cycleProcess) => {
  //       const existing = acc.find(
  //         (cust) => cust.customerName === item.customerName
  //       );
  //       if (existing) {
  //         existing.cycles.push(item);
  //       } else {
  //         acc.push({
  //           customerName: item.customerName,
  //           cycles: [item],
  //           updateMonth: item.updateMonth,
  //         });
  //       }
  //       return acc;
  //     },
  //     []
  //   );
  // }, [hasilProsesSelect]);

  // const allCyclesProsesSelect = useMemo(() => {
  //   return groupedProses.flatMap((customer) =>
  //     customer.cycles.map((cycle, index) => ({
  //       customer: customer.customerName,
  //       cycle: cycle.cycle,
  //       color: getColor(index),
  //     }))
  //   );
  // }, [groupedProses]);

  return (
    <div className=" my-10 items-center mx-auto flex justify-center">
      {sod && data && breaks && diagram && (
        <main className="flex flex-col items-center w-full min-h-fit px-4">
          <div className="w-full max-w-[1200px] mx-auto mb-1">
            <div className="flex align-middle">
              <Link href="/" className="mx-5">
                <IoArrowBackCircle size={25} />
              </Link>
              <div className="flex justify-between gap-2">
                {processes.map((process) => (
                  <button
                    key={process}
                    onClick={() =>
                      setSelectedProses((prev) =>
                        prev === process ? null : process
                      )
                    }
                    className={`px-4 py-2 rounded-lg text-sm ${
                      selectedProses === process
                        ? "bg-blue-600 text-white font-medium"
                        : "bg-gray-200 hover:bg-gray-300"
                    }`}
                  >
                    {process.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
            <div className="relative mt-2">
              <div className="flex overflow-x-auto pb-4 gap-2 hide-scrollbar">
                {Array.from(new Set(sod.data.map((item) => item.customerName)))
                  .sort((a, b) => a.localeCompare(b))
                  .map((customer) => (
                    <button
                      key={customer}
                      onClick={() =>
                        setSelectedCustomer((prev) =>
                          prev === customer ? null : customer
                        )
                      }
                      className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap flex-shrink-0 ${
                        selectedCustomer === customer
                          ? "bg-blue-600 text-white font-medium"
                          : "bg-gray-200 hover:bg-gray-300"
                      }`}
                    >
                      {customer}
                    </button>
                  ))}
              </div>
              <div className="absolute right-0 top-0 bottom-0 w-10 bg-gradient-to-l from-white to-transparent pointer-events-none" />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-10 min-w-full w-full">
            {loading ? (
              <div className="flex items-center justify-center h-screen bg-white-100">
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>

                  <p className="text-lg font-semibold text-emerald-900 animate-pulse">
                    Loading...
                  </p>
                </div>
              </div>
            ) : !filteredSOD?.data?.length ? (
              <div className="min-h-full px-4 py-4 my-auto items-center m:px-6 sm:py-24 md:grid md:place-items-center lg:px-8">
                <div className="mx-auto max-w-max">
                  <div className="mt-5">
                    <div className="flex mt-6">
                      <p className="text-4xl font-extrabold text-blue600 sm:text-5xl">
                        Ooh
                      </p>
                      <div className="ml-6">
                        <div className="pl-6 border-l border-gray500">
                          <h2 className="text-3xl font-bold tracking-tight text-gray900 dark:text-white sm:text-4xl">
                            Something went wrong!
                          </h2>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : selectedProses == null || selectedProses == undefined ? (
              grouped
                ?.filter(
                  (customer) =>
                    !selectedCustomer ||
                    customer.customerName === selectedCustomer
                )
                .map((customer: groupedCust) => {
                  // console.log("disnis", selectedCustomer);
                  const customerProcess = uniqueProcessPerCustomer.find(
                    (proc) => proc.customerName === customer.customerName
                  );
                  const lineUnique = lineResult.find(
                    (proc) => proc.customerName === customer.customerName
                  );
                  return (
                    <div key={customer.customerName} className="h-full w-full">
                      <div className="relative w-[1145px] pb-115 pt-5 border-1 border-black h-full">
                        <div className="w-full relative mb-10">
                          <Shifts data={data.data} />
                        </div>
                        <div className="absolute inset-0 top-[90px] z-10 w-[1145px] h-auto mt-[1px]">
                          <BarChartSimple
                            tasks={customerProcess?.process || []}
                          />
                        </div>

                        {customer.cycles.map((cycle, index) => (
                          <div
                            key={`${customer.customerName}-${cycle.cycle}`}
                            className="relative w-full"
                          >
                            <GanttChart
                              sodD={displayedData?.data || []}
                              task={cycle}
                              color={getColor(index)}
                              breaks={breaks.data}
                              indeks={index}
                              payload={allCycles}
                              domainAx={lineUnique?.processes || []}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })
            ) : (
              // groupedProses.map((customer: groupedCust) => {
              //   const customerProcess = uniqueProcessPerCustomer.find(
              //     (proc) => proc.customerName === customer.customerName
              //   );
              // return (
              <div className="w-full h-full mb-20">
                <div className="relative w-[1145px] pb-115 pt-5 h-full">
                  <div className="relative mb-10 ml-25 w-[1040px]">
                    <Shifts data={data.data} />
                  </div>
                  <div className={`w-full`}>
                    <ProsesChart
                      sodD={hasilProses || []}
                      breaks={breaks.data}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      )}
    </div>
  );
}
