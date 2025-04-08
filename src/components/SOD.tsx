import Link from "next/link";
import DeleteButton from "./deleteButton";
import { MdEdit } from "react-icons/md";
import { getDiagram } from "@/lib/function";
type DiagramSOD = {
  id: number;
  processName: string;
  kode: string;
};

type SOD = {
  id: number;
  customerName: string;
  processName: string;
  cycle: string;
  waktu: string;
  durasi: string;
};

type SODProp = {
  status: number;
  success: boolean;
  data: SOD[];
};

type DiagramProp = {
  status: number;
  success: boolean;
  data: DiagramSOD[];
};

export default async function SODDiagram({
  data,
  Customer,
}: {
  data: SODProp;
  Customer: string;
}) {
  const sod: DiagramProp = await getDiagram();

  const uniqueProcessNames: string[] = Array.from(
    new Set(
      sod.data
        .map((item: DiagramSOD) => ({
          ...item,
          kode: String(item.kode).replace(/\s\d+$/, ""),
        }))
        .map((item: DiagramSOD) => item.kode)
    )
  );

  const grouped: Record<string, Record<string, SOD[]>> = {};
  data.data.forEach((data: SOD) => {
    if (!grouped[data.customerName]) {
      grouped[data.customerName] = {};
    }
    if (!grouped[data.customerName][data.cycle]) {
      grouped[data.customerName][data.cycle] = [];
    }
    grouped[data.customerName][data.cycle].push(data);
  });

  function addTimes(time1: Date, time2: Date): string {
    const hours1 = parseInt(String(time1.getUTCHours()).padStart(2, "0"));
    const mins1 = parseInt(String(time1.getUTCMinutes()).padStart(2, "0"));
    const hours2 = parseInt(String(time2.getUTCHours()).padStart(2, "0"));
    const mins2 = parseInt(String(time2.getUTCMinutes()).padStart(2, "0"));

    const totalMinutes1 = hours1 * 60 + mins1;
    const totalMinutes2 = hours2 * 60 + mins2;

    const sumMinutes = totalMinutes1 + totalMinutes2;
    const newHours = Math.floor(sumMinutes / 60) % 24; // biar gak lebih dari 24 jam
    const newMinutes = sumMinutes % 60;
    return `${String(newHours).padStart(2, "0")}:${String(newMinutes).padStart(
      2,
      "0"
    )}`;
  }

  const processMap: { [key: string]: string } = {
    "RECEIVING E-KBN": "RECEIVING E-KBN",
    "FINISH ADMINISTRASI (90')": "ADMINISTRASI (90')",
    "SETTING HEIJUNKA": "SETTING KBN DI HEIJUNKA POST (60')",
    "START PULLING": "PULLING (252')",
    "FINISH PULLING": "PULLING (252')",
    "START WRAPPING": "WRAPPING",
    "FINISH WRAPPING": "WRAPPING",
    "START LOADING": "LOADING TRUCK (30')",
    "FINISH LOADING": "LOADING TRUCK (30')",
    "LAMA WRAPPING": "WRAPPING",
    "LAMA LOADING": "LOADING TRUCK (30')",
    "TRUCK BERANGKAT": "TRUCK OUT",
    "DURASI PERSIAPAN": "TRUCK OUT",
  };

  return (
    <div className="container max-w-screen px-4 sm:px-6 lg:px-8 py-8 w-full items-center rounded-lg">
      <div className="overflow-x-auto rounded-lg shadow-md">
        <table className="rounded-lg text-[8px] text-center table-auto w-auto border-separate border border-spacing-0 border-gray-400">
          <thead>
            <tr className="bg-emerald-600/80 text-white rounded-lg">
              <th className="border px-2 py-2 border-emerald-500 rounded-tl-lg">
                CUSTOMER NAME
              </th>
              <th className="border px-2 py-2 border-emerald-500">CYCLE</th>
              {uniqueProcessNames.map((kode) => (
                <th key={kode} className="border px-2 py-2 border-emerald-500">
                  {kode}
                </th>
              ))}
              <th className="border border-emerald-500 px-2 py-2 rounded-tr-lg">
                ACTIONS
              </th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(grouped)
              .filter(([customer]) => customer === Customer)
              .map(([customerName, cycles]) =>
                Object.entries(cycles).map(([cycle, processes], cycleIndex) => {
                  return (
                    <tr
                      key={`${customerName}-${cycle}`}
                      className="odd:bg-gray-100 hover:bg-gray-200 transition"
                    >
                      {cycleIndex === 0 && (
                        <td
                          className="border px-2 py-2 border-gray-400 font-medium text-gray-800 rounded-bl-lg"
                          rowSpan={Object.keys(cycles).length}
                        >
                          {customerName}
                        </td>
                      )}

                      <td className="border px-2 py-2 border-gray-400">
                        {cycle}
                      </td>

                      {uniqueProcessNames.map((process) => {
                        const matchedProcess = processes.find(
                          (p) =>
                            p.processName?.includes(process) ||
                            p.processName === processMap[process]
                        );

                        let displayTime = "";
                        if (matchedProcess) {
                          if (process.startsWith("START")) {
                            displayTime = `${String(
                              new Date(matchedProcess.waktu).getUTCHours()
                            ).padStart(2, "0")}:${String(
                              new Date(matchedProcess.waktu).getUTCMinutes()
                            ).padStart(2, "0")}`;
                          } else if (process.startsWith("FINISH")) {
                            if (process.includes("PULLING")) {
                              let total =
                                new Date(matchedProcess.waktu).getUTCHours() *
                                  60 +
                                new Date(matchedProcess.waktu).getUTCMinutes() +
                                new Date(matchedProcess.durasi).getUTCHours() *
                                  60 +
                                new Date(matchedProcess.durasi).getUTCMinutes();

                              const previousIstirahat = processes.filter(
                                (item) =>
                                  item.processName.toLowerCase() === "istirahat"
                              );
                              previousIstirahat.forEach((item) => {
                                const durasiIstirahat = new Date(item.durasi);
                                total +=
                                  durasiIstirahat.getUTCHours() * 60 +
                                  durasiIstirahat.getUTCMinutes();
                              });
                              const finalHours = Math.floor(total / 60) % 24;
                              const finalMinutes = total % 60;
                              displayTime = `${String(finalHours).padStart(
                                2,
                                "0"
                              )}:${String(finalMinutes).padStart(2, "0")}`;
                            } else {
                              displayTime = addTimes(
                                new Date(matchedProcess.waktu),
                                new Date(matchedProcess.durasi)
                              );
                            }
                          } else if (
                            process === "ISTIRAHAT" ||
                            process === "WAITING SHIPPING AREA" ||
                            process.includes("LAMA") ||
                            process.includes("DURASI")
                          ) {
                            displayTime = `${String(
                              new Date(matchedProcess.durasi).getUTCHours()
                            ).padStart(2, "0")}:${String(
                              new Date(matchedProcess.durasi).getUTCMinutes()
                            ).padStart(2, "0")}`;
                          } else if (matchedProcess.waktu == null) {
                            displayTime = "";
                          } else {
                            displayTime = `${String(
                              new Date(matchedProcess.waktu).getUTCHours()
                            ).padStart(2, "0")}:${String(
                              new Date(matchedProcess.waktu).getUTCMinutes()
                            ).padStart(2, "0")}`;
                          }
                        }
                        return (
                          <td
                            key={`${cycle}-${process}`}
                            className="border px-2 py-2 border-gray-400 text-gray-800"
                          >
                            {displayTime}
                          </td>
                        );
                      })}
                      <td
                        className={`border px-2 py-2 border-gray-400 ${
                          cycleIndex === Object.keys(cycles).length - 1
                            ? "rounded-br-lg"
                            : ""
                        }`}
                      >
                        <Link href={`/update/${customerName}-${cycle}`}>
                          <button className="bg-emerald-500/90 cursor-pointer hover:bg-emerald-600 text-white justify-center w-full py-1 flex items-center gap-1.5 rounded">
                            <MdEdit />
                            Update
                          </button>
                        </Link>
                        <DeleteButton
                          customer={customerName}
                          cycle={Number(cycle)}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
