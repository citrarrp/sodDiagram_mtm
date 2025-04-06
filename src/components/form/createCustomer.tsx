// import { useRouter } from "next/navigation";
// import { useState } from "react";

// const UpdateForm = () => {
//     const [customerName, setName] = useState('');
//     const [isLoading, setLoading] = useState<boolean>(false);
//     const router = useRouter();

//     const handleSubmit = async (e: any) => {
//         e.preventDefault();

//         setLoading(true);

//         await fetch('/api/sod', {
//             method: 'POST',
//             headers: {
//                 'content-type': 'application/json'
//             },
//             body: JSON.stringify({
//                 customerName
//             })
//         }).then((res) => {
//             console.log(res)
//         }).catch((e) => {
//             console.log(e)
//         })

//         setLoading(false)
//         router.push('/')
//     }

//     return (
//         <form className="w-[500px] mx-auto pt-20 flex flex-col gap-2" onSubmit={handleSubmit}>
//             <input type="text" placeholder="Input your Customer Name" value={customerName} onChange={(e)=> setName(e.target.value)} className="w-full border p-2 rounded-md"></input>
//             <button disabled={isLoading}>{isLoading ? 'Loading...' : 'Submit'}</button>
//         </form>
//     )
// }

"use client";
import {
  calculateBreakDuration,
  formatDuration,
  formatTime,
  parseTimetonumber,
} from "@/app/utils/timeDuration";
import { useRouter } from "next/navigation";
import React from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { IoArrowBackCircle, IoTime } from "react-icons/io5";
import Link from "next/link";
import Button from "../Button";
import { useToast } from "../toast";

interface ProcessRow {
  id: number;
  processName: string;
  waktu: string;
  durasi: string;
}

type sod = {
  id: number;
  customerName: string;
  cycle: number;
  waktu: string;
  durasi: string;
  processName: string;
};

interface FormValues {
  customerName: string;
  cycle: number;
  processRows: ProcessRow[];
}
interface Break {
  id: number;
  shift_id: number;
  nama_istirahat: string;
  jam_mulai: string;
  jam_selesai: string;
}

const CreateForm = ({
  data,
  istirahat,
}: {
  data: sod[];
  istirahat: Break[];
}) => {
  const router = useRouter();
  const { showToast } = useToast();
  const filteredData = data.filter(
    (item) =>
      item.processName && !item.processName.toLowerCase().includes("lama")
  );

  const uniqueFields = Array.from(
    new Map(filteredData.map((field) => [field.processName, field])).values()
  );

  const {
    control,
    setValue,
    handleSubmit,
    register,
    clearErrors,
    setError,
    getValues,
  } = useForm<FormValues>({
    defaultValues: {
      customerName: "",
      cycle: 1,
      processRows: uniqueFields.map((field) => ({
        processName: field.processName,
        waktu: "",
        durasi: "",
      })),
    },
  });

  const { fields } = useFieldArray({
    control,
    name: "processRows",
  });

  const onSubmit = async (formData: FormValues) => {
    const customerCycles = data
      .filter(
        (item) =>
          item.customerName.toLowerCase() ===
          formData.customerName.toLowerCase()
      )
      .map((item) => item.cycle);

    if (customerCycles.includes(formData.cycle)) {
      showToast(
        "failed",
        `Cycle ${formData.cycle} sudah ada untuk customer ${formData.customerName}`
      );
      return;
    }
    const payload = {
      customerName: formData.customerName,
      cycle: formData.cycle,
      updates: formData.processRows,
    };
    try {
      const response = await fetch("/api/sod/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        showToast("success", "Data berhasil disimpan!");
        router.push("/dashboard");
      } else {
        showToast("failed", "Terjadi kesalahan saat menyimpan data.");
      }
    } catch (error) {
      showToast("failed", `Terjadi kesalahan saat menyimpan data: ${error}`);
    }
  };

  const updateProcessTimes = (processRows: ProcessRow[], index: number) => {
    const getProcessIndex = (name: string) =>
      processRows.findIndex((row) =>
        row.processName.toLowerCase().includes(name)
      );

    const waitingIndex = getProcessIndex("waiting shipping area");
    const wrappingIndex = getProcessIndex("wrapping");
    const loadingIndex = getProcessIndex("loading");
    const pullingIndex = getProcessIndex("pulling");
    const breakIndex = getProcessIndex("istirahat");

    const isValid = (value: unknown): value is number =>
      typeof value === "number" && !isNaN(value);

    if (waitingIndex !== -1 && wrappingIndex !== -1 && loadingIndex !== -1) {
      setValue(`processRows.${waitingIndex}.durasi`, "");
      const wrappingTime = parseTimetonumber(processRows[wrappingIndex]?.waktu);
      const wrappingDuration = parseTimetonumber(
        processRows[wrappingIndex]?.durasi
      );
      const loadingTime = parseTimetonumber(processRows[loadingIndex]?.waktu);

      if (
        isValid(wrappingTime) &&
        isValid(wrappingDuration) &&
        isValid(loadingTime)
      ) {
        setValue(
          `processRows.${waitingIndex}.durasi`,
          formatDuration(
            (loadingTime - (wrappingTime + wrappingDuration) + 1440) % 1440
          )
        );
      }
    }

    if (breakIndex !== -1 && pullingIndex !== -1) {
      setValue(`processRows.${breakIndex}.waktu`, "");
      let pullingTime = parseTimetonumber(processRows[pullingIndex].waktu);
      const pullingDuration = parseTimetonumber(
        processRows[pullingIndex].durasi
      );

      if (isValid(pullingDuration)) {
        setValue(
          `processRows.${pullingIndex}.waktu`,
          formatDuration(
            parseTimetonumber(processRows[wrappingIndex].waktu) -
              pullingDuration
          )
        );
        pullingTime = parseTimetonumber(processRows[pullingIndex].waktu);
        const loadingTime = parseTimetonumber(processRows[loadingIndex]?.waktu);
        const wrappingDuration = parseTimetonumber(
          processRows[wrappingIndex].durasi
        );
        const breakDuration = calculateBreakDuration(
          pullingTime,
          pullingDuration,
          istirahat
        );
        setValue(`processRows.${breakIndex}.durasi`, breakDuration);

        if (wrappingIndex !== -1) {
          // const newPullingTime =
          //   parseTimetonumber(processRows[wrappingIndex].waktu) -
          //   pullingDuration -
          //   parseTimetonumber(breakDuration) +
          //   1440;
          const newWrappingTime =
            parseTimetonumber(processRows[wrappingIndex].waktu) +
            parseTimetonumber(breakDuration) +
            1440;

          setValue(
            `processRows.${wrappingIndex}.waktu`,
            formatDuration(newWrappingTime % 1440)
          );

          const newWaitingTime =
            loadingTime - newWrappingTime - wrappingDuration + +1440;

          setValue(
            `processRows.${waitingIndex}.durasi`,
            formatDuration(newWaitingTime % 1440)
          );
        }
      }
    }

    if (index >= processRows.length - 2) {
      if (index == processRows.length - 2) {
        const lastDuration = parseTimetonumber(processRows[index].durasi ?? "");
        if (lastDuration) {
          let lastTime =
            parseTimetonumber(processRows[index + 1]?.waktu) -
            parseTimetonumber(processRows[index + 1]?.durasi) -
            lastDuration;
          if (lastTime < 0) lastTime += 1440;

          setValue(`processRows.${index}.waktu`, formatDuration(lastTime));
        }
      } else {
        const prevDuration = parseTimetonumber(processRows[index - 1].durasi);
        if (prevDuration) {
          let prevTime =
            parseTimetonumber(processRows[index]?.waktu) -
            parseTimetonumber(processRows[index]?.durasi) -
            prevDuration;
          if (prevTime < 0) prevTime += 1440;

          setValue(`processRows.${index - 1}.waktu`, formatDuration(prevTime));
        }
      }
    }

    if (index <= processRows.length - 3) {
      for (let i = index; i > 3; i--) {
        if (processRows[i].durasi && processRows[i + 1].waktu) {
          const nextTime = parseTimetonumber(processRows[i + 1].waktu);
          const duration = parseTimetonumber(processRows[i].durasi);
          setValue(
            `processRows.${i}.waktu`,
            formatDuration((nextTime - duration + 1440) % 1440)
          );
        }
      }
      // else if (processRows[i].durasi && processRows[i + 1].waktu && i < processRows.length - 2) {
      //   const prevDuration = parseTimetonumber(processRows[index].durasi ?? "");
      // if (prevDuration) {
      //   let prevTime = parseTimetonumber(processRows[index - 1]?.waktu ?? "");
      //   prevTime -= prevDuration;
      //   if (prevTime < 0) prevTime += 1440;
      //   setValue(`processRows.${index - 1}.waktu`, formatDuration(prevTime));
      // }
      // }
    }

    if (index < 3 && index <= processRows.length - 3 && index != -1) {
      for (let i = index; i < 2; i++) {
        if (processRows[i].waktu && processRows[i].durasi) {
          const prevTime = parseTimetonumber(processRows[i].waktu);
          const duration = parseTimetonumber(processRows[i].durasi);
          setValue(
            `processRows.${i + 1}.waktu`,
            formatDuration((prevTime + duration) % 1440)
          );
        }
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-screen mx-20 my-10 p-10 bg-white shadow-md rounded-md items-center"
    >
      <Link href="/" className="mx-5">
        <IoArrowBackCircle size={25} />
      </Link>
      <h2 className="text-xl font-bold mb-10">Tambah Data Diagram SOD</h2>

      <div className="mb-4">
        <label className="block mb-1">Customer Name</label>
        <input
          {...register("customerName", { required: true })}
          className="border rounded w-auto p-3"
        />
      </div>

      <div className="mb-4">
        <label className="block mb-1">Cycle</label>
        <input
          type="number"
          min={1}
          {...register("cycle", {
            required: true,
            valueAsNumber: true,
          })}
          className="w-auto border rounded p-3"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-x-10 w-auto">
        {fields.map((field, index) => {
          const processName = getValues(`processRows.${index}.processName`);

          return (
            <div key={field.id} className="mb-4 p-2 border rounded w-auto">
              <input
                {...register(`processRows.${index}.processName` as const, {
                  required: true,
                })}
                className="font-semibold max-w-150"
                disabled
              />

              {processName.toLowerCase() !== "istirahat" &&
                processName.toLowerCase() !== "waiting shipping area" && (
                  <>
                    <label className="block mb-1">Waktu</label>
                    <Controller
                      control={control}
                      name={`processRows.${index}.waktu` as const}
                      rules={{
                        pattern: {
                          value: /^([01]\d|2[0-3]):([0-5]\d)$/,
                          message: "Format waktu salah! Gunakan HH:mm",
                        },
                      }}
                      render={({ field }) => (
                        <div className="relative">
                          <div className="absolute inset-y-0 end-0 top-0 flex items-center pe-3.5 pointer-events-none">
                            <IoTime />
                          </div>
                          {field.value !== null && (
                            <input
                              type="text"
                              {...field}
                              className="bg-gray-50 border leading-none border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-emerald-500 dark:focus:border-emerald-500"
                              onChange={(e) => {
                                const formatted = formatTime(e.target.value);
                                field.onChange(formatted);
                                const regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
                                if (regex.test(formatted)) {
                                  clearErrors(`processRows.${index}.waktu`);
                                  setValue(
                                    `processRows.${index}.waktu`,
                                    formatted
                                  );
                                  updateProcessTimes(
                                    getValues("processRows"),
                                    index
                                  );
                                } else {
                                  setError(`processRows.${index}.waktu`, {
                                    type: "manual",
                                    message: "Format salah! Gunakan HH:mm",
                                  });
                                }
                              }}
                            />
                          )}
                        </div>
                      )}
                    />
                  </>
                )}

              <label className="block mb-1">Durasi (HH:mm)</label>
              <Controller
                control={control}
                name={`processRows.${index}.durasi` as const}
                render={({ field }) => (
                  <div className="relative">
                    <div className="absolute inset-y-0 end-0 top-0 flex items-center pe-3.5 pointer-events-none">
                      <IoTime />
                    </div>
                    <input
                      type="text"
                      {...field}
                      className="bg-gray-50 border leading-none border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-emerald-500 dark:focus:border-emerald-500"
                      required
                      onChange={(e) => {
                        const formatted = formatTime(e.target.value);
                        field.onChange(formatted);
                        const regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
                        if (regex.test(formatted)) {
                          clearErrors(`processRows.${index}.durasi`);
                          setValue(`processRows.${index}.durasi`, formatted);
                          updateProcessTimes(getValues("processRows"), index);
                        } else {
                          setError(`processRows.${index}.durasi`, {
                            type: "manual",
                            message: "Format salah! Gunakan HH:mm",
                          });
                        }
                      }}
                    />
                  </div>
                )}
              />
            </div>
          );
        })}
      </div>

      <div className="w-full flex justify-items-center ">
        <Button type="submit">Tambah Data</Button>
      </div>
    </form>
  );
};

//       <h3 className="font-semibold mb-5">Process Rows</h3>
//       <div className="grid grid-cols-2 gap-x-15">
//         {fields.map((field, index) => (
//           <div key={field.id} className="mb-4 p-2 border rounded">
//             <label className="block mb-1">Process Name</label>
//             <input
//               {...register(`processRows.${index}.processName` as const)}
//               defaultValue={field.processName}
//               className="w-full border px-2 py-1 mb-2 rounded"
//               disabled
//             />

//             <label className="block mb-1">Waktu (HH:mm)</label>
//             <Controller
//               control={control}
//               name={`processRows.${index}.waktu` as const}
//               render={({ field }) => (
//                 <input
//                   type="text"
//                   {...field}
//                   className="w-full border px-2 py-1 rounded"
//                   placeholder="00:00"
//                 />
//               )}
//             />

//             <label className="block mb-1">Durasi (HH:mm)</label>
//             <Controller
//               control={control}
//               name={`processRows.${index}.durasi` as const}
//               render={({ field }) => (
//                 <input
//                   type="text"
//                   {...field}
//                   className="w-full border px-2 py-1 rounded"
//                   placeholder="08:00"
//                 />
//               )}
//             />
//           </div>
//         ))}
//       </div>

//       <div className="w-full flex  justify-items-center ">
//         <button
//           type="submit"
//           className="bg-green-700/70 text-white px-4 py-2 mb-10 rounded w-md h-fit"
//         >
//           Tambah Data
//         </button>
//       </div>
//     </form>
//   );
// };

export default CreateForm;

// useEffect(() => {
//   const maxId = data.length > 0 ? Math.max(...data.map((item) => item.id)) : 1;

//   const initialRows = filteredData.map((item, index) => ({
//     id: maxId + index + 1,
//     processName: item.kode || "",
//     kode: item.kode || "",
//     waktu: item.waktu
//       ? new Intl.DateTimeFormat("id-ID", {
//         hour: "2-digit",
//         minute: "2-digit",
//         hour12: false,
//         timeZone: "UTC",
//       }).format(new Date(item.waktu))
//       : "",
//       id_process: item.id_process
//   }));

// }, [filteredData]);
