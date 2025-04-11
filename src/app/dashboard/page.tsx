import React from "react";
import SODDiagram from "@/components/SOD";
import GanttChart from "@/components/ganntChart";
import Shifts from "@/components/break";
import BarChartSimple from "@/components/simpleChart";
import { SOD } from "@/components/gantt";
import { getColor } from "@/app/utils/color";
import { getBreaks, getShifts, getSOD } from "@/lib/function";
import Link from "next/link";
import CustomerAccordion from "@/components/accordion";
import { IoMdAddCircleOutline } from "react-icons/io";
import GeneratePDF from "@/components/generatePDF";

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

type groupedCust = {
  customerName: string;
  cycles: cycleProcess[];
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

type SOD = {
  id: number;
  customerName: string;
  processName: string;
  cycle: string;
  waktu: string;
  durasi: string;
};

const generateColor = (index: number): string => {
  const colors = [
    "#FF69B4", // Hot Pink
    "#FF6F91", // Coral Pink
    "#DA70D6", // Orchid
    "#FFA07A", // Salmon
    "#00FFFF", // Light Cyan
    "#40E0D0", // Turquoise
    "#BFFF00", // Neon Lime
    "#cd4500", // Neon Orange
    "#E6E6FA", // Lavender
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

export default async function Page() {
  const sod = await getSOD();
  const hasil = SOD(sod.data);
  const data: ShiftResponse = await getShifts();
  const breaks = await getBreaks();

  const grouped: groupedCust[] = (hasil || []).reduce((acc, item) => {
    const exist = acc.find((cust) => cust.customerName === item.customerName);

    if (exist) {
      exist.cycles.push(item);
    } else {
      acc.push({
        customerName: item.customerName,
        cycles: [item],
      });
    }
    return acc;
  }, [] as groupedCust[]);


  const allCycles = grouped.flatMap((customer) =>
    customer.cycles.map((cycle, index) => {
      return {
        customer: customer.customerName,
        cycle: cycle.cycle,
        color: getColor(index),
      };
    })
  );

  const lineResult = grouped.map((customer) => {
    const groupedProcesses: Record<string, string[]> = {};
    customer.cycles
      .sort((a, b) => a.cycle - b.cycle)
      .map((cycle, index) => {
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

  const uniqueProcessPerCustomer = createUniqueProcessCyclePerCustomer(grouped);
  return (
    <div className="items-center justify-items-center p-6 sm:p-10 font-[family-name:var(--poppins-font)] max-w-screen min-h-screen w-full h-full growflex-1">
      <main className="flex flex-col row-start-2 items-center sm:items-start w-full h-full min-h-screen overflow-hidden">
        <div className="justify-end my-10 ml-auto">
          <Link href="/create">
            <button className="border-emerald-600 border-2 text-emerald-600 cursor-pointer hover:bg-emerald-700 hover:text-white px-4 py-2 rounded flex items-center gap-2">
              <IoMdAddCircleOutline size={20} />
              Tambah Data
            </button>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-10 min-w-full h-full w-full">
          {grouped?.map((customer, index) => {
            const customerProcess = uniqueProcessPerCustomer.find(
              (proc) => proc.customerName === customer.customerName
            );
            const lineUnique = lineResult.find(
              (proc) => proc.customerName === customer.customerName
            );
            return (
              <div key={customer.customerName} className="h-full w-full">
                <CustomerAccordion
                  customer={customer.customerName}
                  indeks={index}
                >
                  <div
                    key={`${customer.customerName}`}
                    className={`w-full flex flex-col min-w-full`}
                  >
                    <SODDiagram data={sod} Customer={customer.customerName} />

                    <GeneratePDF customer={customer.customerName}>
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
                              sodD={sod.data}
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
                    </GeneratePDF>
                  </div>
                </CustomerAccordion>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
