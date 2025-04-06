"use client";
import {
  calculateBreakDuration,
  formatDuration,
  formatTime,
  parseTimetonumber,
  timetoIndex,
} from "@/app/utils/timeDuration";
import { useRouter } from "next/navigation";
import { IoArrowBackCircle, IoTime } from "react-icons/io5";
import Link from "next/link";
import React, { useMemo } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import Button from "../Button";
import { useToast } from "../toast";

interface ProcessRow {
  id: number;
  processName: string;
  waktu?: string | null;
  durasi?: string | null;
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

type istirahat = {
  id: number;
  shift_id: number;
  nama_istirahat: string;
  jam_mulai: string;
  jam_selesai: string;
};

const UpdateForm = ({
  customer,
  cyc,
  data,
  breaks,
}: {
  customer: string;
  cyc: number;
  data: sod[];
  breaks: istirahat[];
}) => {
  const router = useRouter();
  const { showToast } = useToast();
  const filteredData = useMemo(
    () =>
      data.filter((item) => !item.processName.toLowerCase().includes("lama")),
    [data]
  );
  const {
    control,
    handleSubmit,
    register,
    setError,
    setValue,
    getValues,
    clearErrors,
  } = useForm<FormValues>({
    defaultValues: {
      customerName: customer,
      cycle: cyc,
      processRows: filteredData.map((row) => ({
        ...row,
        processName: row.processName,
        waktu: row.waktu
          ? `${String(new Date(row.waktu).getUTCHours()).padStart(
              2,
              "0"
            )}:${String(new Date(row.waktu).getUTCMinutes()).padStart(2, "0")}`
          : null,
        durasi: row.durasi
          ? `${String(new Date(row.durasi).getUTCHours()).padStart(
              2,
              "0"
            )}:${String(new Date(row.durasi).getUTCMinutes()).padStart(2, "0")}`
          : null,
        finish: `${formatDuration(
          timetoIndex(
            new Intl.DateTimeFormat("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
              timeZone: "UTC",
            }).format(new Date(row.waktu))
          ) +
            timetoIndex(
              new Intl.DateTimeFormat("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
                timeZone: "UTC",
              }).format(new Date(row.durasi))
            )
        )}
        
                                  `,
      })),
    },
  });

  const { fields } = useFieldArray({
    control,
    name: "processRows",
  });
  const onSubmit = async (formData: FormValues) => {
    const cleanedRows = formData.processRows.map((row) => ({
      ...row,
      waktu: row.waktu == "" || row.waktu == undefined ? null : row.waktu,
    }));
    const payload = {
      customerName: formData.customerName,
      cycle: formData.cycle,
      updates: cleanedRows,
    };
    try {
      const res = await fetch(`/api/diagram/${customer}-${cyc}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (res.status === 200) {
        showToast("success", "Data updated successfully!");
        router.push("/dashboard");
      } else {
        showToast("failed", `Error: ${result.message}`);
      }
    } catch (err) {
      showToast("failed", `Error updating data: ${err}`);
    }
  };
  const recalculatePreviousRows = (index: number) => {
    const processRows = getValues("processRows");
    let currentTime = parseTimetonumber(processRows[index].waktu ?? "");

    for (let i = index - 1; i > 3; i--) {
      const isTruckOut =
        processRows[index].processName.toLowerCase() === "truck out";
      const currentDuration = parseTimetonumber(processRows[i].durasi ?? "");
      if (isTruckOut && i === index - 1) {
        const truckOutDuration = parseTimetonumber(
          processRows[index].durasi ?? ""
        );
        currentTime -= truckOutDuration + currentDuration;
      } else {
        currentTime -= currentDuration;
      }
      if (currentTime < 0) currentTime += 1440;
      setValue(`processRows.${i}.waktu`, formatDuration(currentTime));
    }
  };

  const recalculateNextRows = (index: number) => {
    const processRows = getValues("processRows");

    for (let i = index + 1; i < 3; i++) {
      const prevTime = parseTimetonumber(processRows[i - 1].waktu ?? "");
      const prevDuration = parseTimetonumber(processRows[i - 1].durasi ?? "");
      let currentTime = prevTime + prevDuration;
      if (currentTime >= 1440) currentTime -= 1440;
      setValue(`processRows.${i}.waktu`, formatDuration(currentTime));
    }
  };

  const updatePullingEffects = (index: number) => {
    const processRows = getValues("processRows");

    const istirahatIndex = processRows.findIndex(
      (row) => row.processName.toLowerCase() === "istirahat"
    );
    const loadingIndex = processRows.findIndex((row) =>
      row.processName.toLowerCase().includes("loading")
    );
    const waitingIndex = loadingIndex - 1;
    const wrappingIndex = processRows.findIndex((row) =>
      row.processName.toLowerCase().includes("wrapping")
    );
    const pullingIndex = processRows.findIndex((row) =>
      row.processName.toLowerCase().includes("pulling")
    );
    if (
      loadingIndex !== -1 &&
      waitingIndex >= 0 &&
      wrappingIndex !== -1 &&
      pullingIndex !== -1 &&
      index === wrappingIndex
    ) {
      // const wrappingTime =
      //   parseTimetonumber(processRows[index].waktu ?? "") +
      //   parseTimetonumber(processRows[index].durasi ?? "");
      const loadingTime = parseTimetonumber(
        processRows[loadingIndex].waktu ?? ""
      );
      const waitingTime = parseTimetonumber(
        processRows[waitingIndex].durasi ?? ""
      );

      // let waitingDuration = loadingTime - wrappingTime;
      // if (waitingDuration < 0) waitingDuration += 1440;

      let newWrappingTime =
        loadingTime -
        waitingTime -
        parseTimetonumber(processRows[index].durasi);
      if (newWrappingTime < 0) newWrappingTime += 1440;

      // setValue(
      //   `processRows.${wrappingIndex}.waktu`,
      //   formatDuration(newWrappingTime)
      // );

      const pullingDurasi = parseTimetonumber(
        processRows[pullingIndex].durasi ?? ""
      );

      let pullingTime = newWrappingTime - pullingDurasi;
      if (pullingTime < 0) pullingTime += 1440;

      const istirahatDurasi = calculateBreakDuration(
        pullingTime,
        pullingDurasi,
        breaks || []
      );
      const durasiIstirahat = parseTimetonumber(istirahatDurasi);

      // pullingTime = newWrappingTime - pullingDurasi - durasiIstirahat;
      // if (pullingTime < 0) pullingTime += 1440;

      setValue(`processRows.${istirahatIndex}.durasi`, istirahatDurasi);

      setValue(
        `processRows.${pullingIndex}.waktu`,
        formatDuration(pullingTime)
      );

      let WrappingTime = pullingTime + pullingDurasi + durasiIstirahat;
      if (WrappingTime >= 1440) WrappingTime -= 1440;

      setValue(
        `processRows.${wrappingIndex}.waktu`,
        formatDuration(WrappingTime)
      );

      // 8. Hitung ulang durasi waiting = loading - wrapping end
      const wrappingDurasi = parseTimetonumber(
        processRows[wrappingIndex].durasi ?? ""
      );
      const wrappingEnd = (WrappingTime + wrappingDurasi) % 1440;

      let waitingDurasi = loadingTime - wrappingEnd;
      if (waitingDurasi < 0) waitingDurasi += 1440;

      if (waitingIndex >= 0) {
        setValue(
          `processRows.${waitingIndex}.durasi`,
          formatDuration(waitingDurasi)
        );
      }
    }

    const pullingDuration = parseTimetonumber(processRows[index].durasi ?? "");

    if (istirahatIndex !== -1 && index != wrappingIndex) {
      const istirahatTime = calculateBreakDuration(
        parseTimetonumber(processRows[pullingIndex].waktu ?? ""),
        pullingDuration,
        breaks || []
      );
      const loadingTime = parseTimetonumber(
        processRows[loadingIndex].waktu ?? ""
      );
      let wrappingTime =
        parseTimetonumber(processRows[pullingIndex].waktu ?? "") +
        pullingDuration +
        parseTimetonumber(istirahatTime);
      if (wrappingTime >= 1440) wrappingTime -= 1440;
      setValue(
        `processRows.${wrappingIndex}.waktu`,
        formatDuration(wrappingTime)
      );

      const wrappingDurasi = parseTimetonumber(
        processRows[wrappingIndex].durasi ?? ""
      );

      let wrappingEnd = wrappingTime + wrappingDurasi;
      if (wrappingEnd >= 1440) wrappingEnd -= 1440;

      let waitingDurasi = loadingTime - wrappingEnd;
      if (waitingDurasi < 0) waitingDurasi += 1440;

      if (waitingIndex >= 0) {
        setValue(
          `processRows.${waitingIndex}.durasi`,
          formatDuration(waitingDurasi)
        );
      }
      setValue(`processRows.${istirahatIndex}.durasi`, istirahatTime);

      // for (let i = istirahatIndex + 1; i < 4; i++) {
      //   const prevTime = parseTimetonumber(processRows[i - 1].waktu ?? "");
      //   const prevDuration = parseTimetonumber(processRows[i - 1].durasi ?? "");
      //   let currentTime = prevTime + prevDuration;
      //   if (currentTime >= 1440) currentTime -= 1440;
      //   setValue(`processRows.${i}.waktu`, formatDuration(currentTime));
      // }
    }
  };

  const checkAndUpdatePullingDependencies = () => {
    const processRows = getValues("processRows");

    const pullingIndex = processRows.findIndex((row) =>
      row.processName.toLowerCase().includes("pulling")
    );
    const wrappingIndex = processRows.findIndex((row) =>
      row.processName.toLowerCase().includes("wrapping")
    );

    if (pullingIndex !== -1 && wrappingIndex !== -1) {
      updatePullingEffects(pullingIndex);
    }
  };

  const handleDurasiChange = (index: number, newDuration: string) => {
    const processRows = getValues("processRows");
    const currentProcess = processRows[index];

    setValue(`processRows.${index}.durasi`, newDuration);

    if (currentProcess.processName.toLowerCase().includes("pulling")) {
      updatePullingEffects(index);
    } else if (currentProcess.processName.toLowerCase().includes("wrapping")) {
      updatePullingEffects(index);
    } else if (currentProcess.processName.toLowerCase().includes("truck out")) {
      recalculatePreviousRows(index);
      checkAndUpdatePullingDependencies();
    } else if (currentProcess.processName.toLowerCase().includes("istirahat")) {
      updatePullingEffects(index);
    } else {
      recalculatePreviousRows(index);
      recalculateNextRows(index);
      checkAndUpdatePullingDependencies();
    }
  };

  const handleWaktuChange = (index: number, newTime: string) => {
    const processRows = getValues("processRows");
    const currentProcessName =
      processRows[index]?.processName?.toLowerCase() || "";

    setValue(`processRows.${index}.waktu`, newTime);
    if (currentProcessName.includes("pulling")) {
      updatePullingEffects(index);
    } else if (currentProcessName.includes("wrapping")) {
      updatePullingEffects(index);
    } else if (currentProcessName.includes("truck out")) {
      recalculatePreviousRows(index);
      checkAndUpdatePullingDependencies();
    } else {
      recalculatePreviousRows(index);
      recalculateNextRows(index);
      checkAndUpdatePullingDependencies();
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-screen mx-20 p-10 bg-white shadow-md rounded-md items-center"
    >
      <Link href="/" className="mx-5">
        <IoArrowBackCircle size={25} />
      </Link>

      <h2 className="text-xl font-bold mb-4">Update Diagram SOD</h2>

      <div className="mb-4">
        <label className="block mb-1">Customer Name</label>
        <input
          {...register("customerName", { required: true })}
          className="font-semibold"
          disabled
        />
      </div>

      <div className="mb-4">
        <label className="block mb-1">Cycle</label>
        <input
          type="number"
          {...register("cycle", { required: true, valueAsNumber: true })}
          className="w-auto font-semibold"
          disabled
        />
      </div>

      <div className="grid grid-cols-2 gap-x-10 w-full">
        {fields.map((field, index) => (
          <div key={field.id} className="mb-4 p-2 border rounded w-full">
            <input
              {...register(`processRows.${index}.processName` as const)}
              defaultValue={field.processName}
              className="font-semibold"
              disabled
            />

            {(field.waktu && field.processName != "ISTIRAHAT") ||
            (field.waktu && field.processName != "WAITING SHIPPING AREA") ? (
              <div>
                <label className="block mb-1">Waktu (HH:mm)</label>
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
                      <input
                        type="text"
                        {...field}
                        value={field.value || ""}
                        className="bg-gray-50 border leading-none border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-emerald-500 dark:focus:border-emerald-500"
                        onChange={(e) => {
                          const formatted = formatTime(e.target.value);
                          field.onChange(formatted);
                          const regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
                          if (regex.test(formatted)) {
                            clearErrors(`processRows.${index}.waktu`);
                            setValue(`processRows.${index}.waktu`, formatted);
                            handleWaktuChange(index, formatted);
                          } else {
                            setError(`processRows.${index}.waktu`, {
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
            ) : null}

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
                    value={field.value || ""}
                    className="bg-gray-50 border leading-none border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-emerald-500 dark:focus:border-emerald-500"
                    required
                    disabled={
                      field.name.includes("PULLING") ||
                      field.name.includes("ISTIRAHAT")
                    }
                    onChange={(e) => {
                      const formatted = formatTime(e.target.value);
                      field.onChange(formatted);
                      const regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
                      if (regex.test(formatted)) {
                        clearErrors(`processRows.${index}.durasi`);
                        setValue(`processRows.${index}.durasi`, formatted);

                        handleDurasiChange(index, formatted);
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
        ))}
      </div>

      <div className="w-full flex justify-items-center ">
        {/* <button
          type="submit"
          className="bg-green-700/70 text-white px-4 py-2 mb-10 rounded w-full h-fit"
        >
          Update Data
        </button> */}
        <Button type="submit">Update Data</Button>
      </div>
    </form>
  );
};

export default UpdateForm;

// onBlur={() => {
//   handleDurasiChange(
//     index,
//     getValues(`processRows.${index}.durasi`),
//     getValues(`processRows.${index}.waktu`)
//   );
// }}
// onKeyDown={(e) => {
//   if (e.key === "Tab") {
//     setTimeout(() => {
//       handleDurasiChange(
//         index,
//         getValues(`processRows.${index}.durasi`),
//         getValues(`processRows.${index}.waktu`)
//       );
//     }, 0);
//   }
// }}

// const handleDurasiChange = (
//   index: number,
//   durasiNew: string,
//   currentWaktu: string
// ) => {
//   let durasiMinutes = parseTimetonumber(durasiNew || "00:00");
//   let currentTime = parseTimetonumber(currentWaktu || "00:00");

//   console.log(index, currentTime, durasiMinutes);

//   for (let i = index - 1; i < 2; i--) {
//     const processName = getValues(
//       `processRows.${i + 1}.processName`
//     ).toLowerCase();
//     console.log(processName);
//     const durasiPrev = parseTimetonumber(
//       getValues(`processRows.${i}.durasi`)
//     );
//     console.log(durasiPrev);
//     if (processName.includes("truck out")) {
//       currentTime = currentTime - (durasiMinutes + durasiPrev);
//     } else {
//       currentTime -= durasiMinutes;
//     }
//     if (currentTime >= 1440) currentTime -= 1440;
//     if (currentTime < 0) currentTime += 1440;
//     setValue(`processRows.${i}.waktu`, formatDuration(currentTime));
//     durasiMinutes = parseTimetonumber(
//       getValues(`processRows.${i}.durasi`) || "00:00"
//     );
//   }
// };

// const handleWaktuChange = (index: number, waktuNew: string) => {
//   let currentTime = parseTimetonumber(waktuNew);

//   console.log(
//     index,
//     currentTime,

//     getValues(`processRows.${index - 1}.processName`).toLowerCase()
//   );

//   for (let i = index - 1; i >= 0; i--) {
//     const processName = getValues(
//       `processRows.${i}.processName`
//     ).toLowerCase();
//     const durasiMinutes = parseTimetonumber(
//       getValues(`processRows.${i}.durasi`)
//     );
//     const durasiNext = parseTimetonumber(
//       getValues(`processRows.${i + 1}.durasi`) || "00:00"
//     );
//     if (processName.includes("truck out")) {
//       currentTime = currentTime - (durasiMinutes + durasiNext);
//     } else {
//       currentTime -= durasiMinutes;
//     }
//     currentTime -= durasiMinutes;
//     if (currentTime < 0) currentTime += 1440;
//     setValue(`processRows.${i}.waktu`, formatDuration(currentTime));
//   }
// };

// const watchedProcessRows = useWatch({
//   control,
//   name: "processRows",
// });

// const debouncedRows = useDebounce(watchedProcessRows, 300);

// console.log(debouncedRows.length);
// useEffect(() => {
//   if (!debouncedRows || debouncedRows.length === 0) return;

//   const lastIndex = debouncedRows.findIndex(
//     (row) => row.processName === "TRUCK OUT"
//   );

//   if (lastIndex === -1) return;
//   let currentTime = parseTimeToMinutes(
//     debouncedRows[lastIndex].waktu || "00:00"
//   );

//   // const waiting = debouncedRows.findIndex(
//   //   (row) => row.processName === "WAITING"
//   // );

//   // if (debouncedRows[waiting].waktu) {
//   //   setValue(`processRows.${waiting}.waktu`, "")
//   // }

//   for (let i = lastIndex; i >= 4; i--) {
//     const durasiMinutes = parseTimeToMinutes(
//       debouncedRows[i].durasi || "00:00"
//     );

//     const prevDurasi = parseTimeToMinutes(
//       debouncedRows[i - 1]?.durasi || "00:00"
//     );

//     const finishTime = formatDuration(currentTime);

//     if (debouncedRows[i].waktu !== finishTime) {
//       setValue(`processRows.${i}.waktu`, finishTime);
//     }

//     if (i === lastIndex) {
//       currentTime -= durasiMinutes + prevDurasi;
//     } else {
//       currentTime -= prevDurasi;
//     }
//     if (currentTime < 0) currentTime += 24 * 60;
//   }
// }, [debouncedRows, setValue]);

// const handleDurasiChange = (
//   rows: ProcessRow[],
//   index: number,
//   durasiNew: string
// ): ProcessRow[] => {
//   const updatedRows = [...rows];
//   updatedRows[index].durasi = durasiNew;

//   const nextTime = parseTimeToMinutes(updatedRows[index + 1]?.waktu);
//   const durasiMinutes = parseTimeToMinutes(durasiNew);
//   let currentTime = nextTime - durasiMinutes;
//   if (currentTime < 0) currentTime += 1440;
//   updatedRows[index].waktu = formatDuration(currentTime);

//   if (index > 2) {
//     const prevDurasi = parseTimeToMinutes(updatedRows[index - 1].durasi);
//     const prevTime = currentTime - prevDurasi;
//     updatedRows[index - 1].waktu = formatDuration(
//       prevTime < 0 ? prevTime + 1440 : prevTime
//     );
//   }
//   const nextTime = updatedRows[index + 1].waktu
//     ? parseTimeToMinutes(updatedRows[index + 1].waktu) -
//       parseTimeToMinutes(updatedRows[index + 1].durasi)
//     : parseTimeToMinutes(updatedRows[index + 2].waktu) -
//       parseTimeToMinutes(updatedRows[index + 1].durasi);
//   const duration = parseTimeToMinutes(durasiNew || "00:00");
//   updatedRows[index].waktu = formatDuration(nextTime - duration);

//   for (let i = index - 1; i > 2; i--) {
//     const nextTime = updatedRows[i + 1].waktu
//       ? parseTimeToMinutes(updatedRows[i + 1].waktu) -
//         parseTimeToMinutes(updatedRows[i + 1].durasi)
//       : 0;
//     const duration = parseTimeToMinutes(updatedRows[i].durasi || "00:00");
//     updatedRows[i].waktu = formatDuration(nextTime - duration);
//   }
// } else if (index === rows.length - 1) {
//   for (let i = index; i > 2; i--) {
//     updatedRows[index - 1].waktu = formatDuration(
//       parseTimeToMinutes(updatedRows[index].waktu) -
//         parseTimeToMinutes(updatedRows[index].durasi) -
//         parseTimeToMinutes(updatedRows[index - 1].durasi)
//     );
//   }
// }
//   return updatedRows;
// };

// const handleWaktuChange = (
//   rows: ProcessRow[],
//   index: number,
//   waktuNew: string
// ): ProcessRow[] => {
//   const updatedRows = [...rows];
//   updatedRows[index].waktu = waktuNew;

//   if (index === rows.length - 1) {
//     for (let i = index - 1; i > 2; i--) {
//       const current =
//         (parseTimeToMinutes(updatedRows[i + 1].waktu) -
//           parseTimeToMinutes(updatedRows[i + 1].durasi) +
//           1440) %
//         1440;
//       const duration = parseTimeToMinutes(updatedRows[i].durasi || "00:00");
//       updatedRows[i].waktu = formatDuration(current - duration);
//     }
//   } else {
//     for (let i = index - 1; i > 2; i--) {
//       const duration = parseTimeToMinutes(updatedRows[i].durasi);
//     }
//   }
//   return updatedRows;
// };

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
