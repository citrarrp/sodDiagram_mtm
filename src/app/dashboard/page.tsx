"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import SODDiagram from "@/components/SOD";
import GanttChart from "@/components/ganntChart";
import Shifts from "@/components/break";
import BarChartSimple from "@/components/simpleChart";
import { SOD } from "@/components/gantt";
import { getColor } from "@/app/utils/color";
import {
  getBreaks,
  getDataSOD,
  getDiagram,
  getShifts,
  getSODData,
} from "@/lib/function";
import Link from "next/link";
import CustomerAccordion from "@/components/accordion";
import { IoMdAddCircleOutline } from "react-icons/io";
import GeneratePDF from "@/components/generatePDF";
import { IoMdSearch } from "react-icons/io";
import { useDebouncedCallback } from "use-debounce";
import LogoutButton from "@/components/logoutButton";
import { useAuth } from "../context/useAuth";
import { FaUserPlus } from "react-icons/fa";
import { useRouter } from "next/navigation";
// import Button from "@/components/Button";

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
  const { isAdmin, setIsAdmin } = useAuth();
  const router = useRouter();
  const [sod, setDataSOD] = useState<SODResponse>();
  const [filteredSOD, setfilteredSOD] = useState<SODResponse>();
  const [searchData, setSearchData] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [data, setShifts] = useState<ShiftResponse>();
  const [breaks, setBreaks] = useState<BreakResponse>();
  const [diagram, setDiagram] = useState<DiagramResponse>();

  const onPageChange = (page: number) => {
    setCurrentPage(page);
    setSearchData("");
  };

  const controllerRef = useRef<AbortController>(null);
  useEffect(() => {
    const fetchUser = async () => {
      const res = await fetch("/api/me", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        const isAdmin = (data.user?.username || "").includes("admin");
        setIsAdmin(isAdmin);
      } else {
        router.replace("/login");
      }
    };

    fetchUser();

    const controller = new AbortController();
    controllerRef.current = controller;
    const fetchFiltered = async () => {
      setLoading(true);
      try {
        const [sodRes, shiftRes, breakRes, diagramRes] = await Promise.all([
          getDataSOD(currentPage, 5, controllerRef.current?.signal),
          getShifts(),
          getBreaks(),
          getDiagram(),
        ]);
        if (sodRes.success && sodRes.data) {
          setDataSOD(sodRes);
          setTotalPages(sodRes.totalPages);
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
  }, [currentPage, router, setIsAdmin]);

  const handleClientAction = (customer: string, cycle: number) => {
    if (!filteredSOD || !filteredSOD.data) return;

    const updatedData = filteredSOD.data.filter(
      (item) =>
        !(
          item.customerName === customer && Number(item.cycle) === Number(cycle)
        )
    );

    const updatedSOD: SODResponse = {
      ...filteredSOD,
      data: updatedData,
    };

    setfilteredSOD(updatedSOD);
  };

  const searchCustomer = useDebouncedCallback(async () => {
    setLoading(true);
    if (searchData.trim() !== "") {
      const retrieveSODresponse: SODResponse = await getSODData(
        searchData,
        currentPage,
        5,
        controllerRef.current?.signal
      );

      if (!retrieveSODresponse.success) {
        setfilteredSOD(sod);
        setLoading(false);
        return;
      }
      if (retrieveSODresponse.data) {
        setfilteredSOD(retrieveSODresponse);
        setTotalPages(retrieveSODresponse.totalPages);
        setLoading(false);
      }
    } else {
      if (sod) {
        setfilteredSOD(sod);
        setTotalPages(sod.totalPages);
      }
      setLoading(false);
      return;
    }
  }, 1000);

  const handleChange = (value: string) => {
    setSearchData(value);
    searchCustomer();
  };
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
  const windowSize = 10;
  const currentWindow = Math.floor((currentPage - 1) / windowSize);
  const start = currentWindow * windowSize + 1;
  const end = Math.min(start + windowSize - 1, totalPages);

  const handlePrev = () => {
    const newStart = Math.max(start - windowSize, 1);
    onPageChange(newStart);
  };

  const handleNext = () => {
    const newStart = Math.min(start + windowSize, totalPages);
    onPageChange(newStart);
  };

  return (
    <div className="items-center justify-items-center p-6 sm:p-10 font-[family-name:var(--poppins-font)] max-w-screen min-h-screen w-full h-full growflex-1">
      <div className="w-full flex justify-between mb-5">
        <h1 className="font-semibold text-3xl text-emerald-600 border-b-2 h-[50px]">
          SOD Menara Terus Makmur
        </h1>
        <div className="flex items-center gap-5">
          {isAdmin && (
            <Link href={`/register`}>
              <button className="mb-7 cursor-pointer text-red-500">
                <FaUserPlus size={30} />
              </button>
            </Link>
          )}

          <LogoutButton />
        </div>
      </div>
      {/* <div className="w-full mx-auto mb-10">
        <Button type="button" onClick={() => router.replace("/display")}>
          Lihat Display
        </Button>
      </div> */}
      {sod && data && breaks && diagram && (
        <main className="flex flex-col row-start-2 items-center sm:items-start w-full h-full min-h-screen overflow-hidden">
          <div className="flex justify-between items-center w-full mb-5 gap-4">
            <div className="relative w-3/4">
              <input
                type="text"
                placeholder="Cari data..."
                className="border px-4 py-2 rounded focus:border-emerald-700 w-full pl-10"
                value={searchData}
                onChange={(e) => handleChange(e.target.value)}
              />
              <IoMdSearch
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                size={18}
              />
            </div>
            <div className="w-1/4  flex justify-end">
              <Link href="/create">
                <button className="border-emerald-600 border-2 text-emerald-600 cursor-pointer hover:bg-emerald-700 flex hover:text-white px-4 py-2 rounded items-center gap-2">
                  <IoMdAddCircleOutline size={20} />
                  Tambah Data
                </button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-10 min-w-full h-full w-full">
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
                          <p className="mt-1 text-lg text-gray500 dark:text-white">
                            {searchData
                              ? "Tidak ada customer yang ditemukan!."
                              : "Data tidak tersedia!."}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              grouped?.map((customer: groupedCust, index: number) => {
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
                        <SODDiagram
                          sodHeader={diagram}
                          data={sod}
                          Customer={customer.customerName}
                          onDelete={handleClientAction}
                        />

                        <GeneratePDF
                          customer={customer.customerName}
                          updateMonth={customer.updateMonth}
                          countCycle={customer.cycles.length}
                        >
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
              })
            )}
            <div className="flex justify-center items-center gap-2 mt-4">
              {start > 1 && (
                <button
                  onClick={handlePrev}
                  className="px-3 py-1 border rounded cursor-pointer bg-white"
                >
                  &larr;
                </button>
              )}

              {Array.from({ length: end - start + 1 }, (_, idx) => {
                const pageNum = start + idx;
                return (
                  <button
                    key={pageNum}
                    onClick={() => onPageChange(pageNum)}
                    className={`w-[30px] py-1 text-center border rounded cursor-pointer ${
                      currentPage === pageNum
                        ? "bg-blue-700 text-white"
                        : "bg-white"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              {end < totalPages && (
                <button
                  onClick={handleNext}
                  className="px-3 py-1 border rounded cursor-pointer bg-white"
                >
                  &rarr;
                </button>
              )}
            </div>
          </div>
        </main>
      )}
    </div>
  );
}
