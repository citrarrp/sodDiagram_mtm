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
import { useRef } from "react";
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
  updateMonth: string;
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
        )}`,
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
        router.refresh()
        showToast("success", "Data berhasil diperbarui!");
        router.replace("/dashboard");
      } else {
        showToast(
          "failed",
          `Terjadi kesalahan saat memperbarui data:: ${result.message}`
        );
      }
    } catch (err) {
      showToast("failed", `Terjadi kesalahan saat memperbarui data: ${err}`);
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
        if (currentTime < 0) currentTime += 1440;
        else if (currentTime > 1440) currentTime %= 1440;
        setValue(`processRows.${i}.waktu`, formatDuration(currentTime));
      } else {
        if (processRows[i + 1]?.processName.toLowerCase().includes("waiting")) {
          currentTime = parseTimetonumber(processRows[i + 2].waktu ?? "");
          currentTime =
            currentTime -
            parseTimetonumber(processRows[i + 1].durasi ?? "") -
            currentDuration;

          if (currentTime < 0) currentTime += 1440;
          else if (currentTime > 1440) currentTime %= 1440;
          setValue(`processRows.${i - 1}.waktu`, formatDuration(currentTime));
        } else if (
          processRows[i]?.processName.toLowerCase().includes("waiting") ||
          processRows[i]?.processName.toLowerCase().includes("istirahat")
        ) {
          currentTime = parseTimetonumber(processRows[i + 1].waktu ?? "");
        } else {
          currentTime -= currentDuration;
        }
      }
      if (currentTime < 0) currentTime += 1440;
      else if (currentTime > 1440) currentTime %= 1440;
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

  const updatePullingEffects = (
    index: number,

    tipe: "durasi" | "waktu",
    pulling?: number
  ) => {
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

    if (index == loadingIndex) {
      const loadingduration = parseTimetonumber(
        processRows[loadingIndex].durasi ?? ""
      );
      setValue(
        `processRows.${loadingIndex}.durasi`,
        formatDuration(loadingduration)
      );

      let loadingTime =
        parseTimetonumber(processRows[loadingIndex].waktu ?? "") -
        loadingduration;

      if (loadingTime < 0) loadingTime += 1440;
      else if (loadingTime > 1440) loadingTime %= 1440;

      setValue(
        `processRows.${loadingIndex}.waktu`,
        formatDuration(loadingTime)
      );
    }

    if (
      loadingIndex !== -1 &&
      waitingIndex >= 0 &&
      wrappingIndex !== -1 &&
      pullingIndex !== -1 &&
      index === wrappingIndex
    ) {
      const loadingTime = parseTimetonumber(
        processRows[loadingIndex].waktu ?? ""
      );
      const waitingTime = parseTimetonumber(
        processRows[waitingIndex].durasi ?? ""
      );

      let newWrappingTime =
        loadingTime -
        waitingTime -
        parseTimetonumber(processRows[index]?.durasi || "00:00");
      if (newWrappingTime < 0) newWrappingTime += 1440;
      else if (newWrappingTime > 1440) newWrappingTime %= 1440;

      const pullingDurasi = parseTimetonumber(
        processRows[pullingIndex].durasi ?? ""
      );

      let pullingTime = 0;
      if (tipe === "waktu") {
        pullingTime =
          parseTimetonumber(processRows[index]?.waktu || "") - pullingDurasi;
      } else if (tipe === "durasi") {
        pullingTime = newWrappingTime - pullingDurasi;
      }
      if (pullingTime < 0) pullingTime += 1440;
      else if (pullingTime > 1440) pullingTime %= 1440;

      const istirahatDurasi = calculateBreakDuration(
        pullingTime,
        pullingDurasi,
        breaks || []
      );
      const durasiIstirahat = parseTimetonumber(istirahatDurasi);

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

      const wrappingDurasi = parseTimetonumber(
        processRows[wrappingIndex].durasi ?? ""
      );
      const wrappingEnd = (WrappingTime + wrappingDurasi) % 1440;

      let waitingDurasi = loadingTime - wrappingEnd;
      if (waitingDurasi < 0) waitingDurasi += 1440;
      else if (waitingDurasi > 1440) waitingDurasi %= 1440;

      if (waitingIndex >= 0) {
        setValue(
          `processRows.${waitingIndex}.durasi`,
          formatDuration(waitingDurasi)
        );
      }
    }

    if (
      loadingIndex !== -1 &&
      waitingIndex >= 0 &&
      wrappingIndex !== -1 &&
      index === pullingIndex &&
      pulling
    ) {
      const loadingTime = parseTimetonumber(
        processRows[loadingIndex].waktu ?? ""
      );
      const waitingTime = parseTimetonumber(
        processRows[waitingIndex].durasi ?? ""
      );
      const wrappingDurasi = parseTimetonumber(
        processRows[wrappingIndex].durasi ?? ""
      );

      let newPullingTime =
        parseTimetonumber(processRows[index].waktu ?? "") +
        pulling -
        parseTimetonumber(processRows[index].durasi ?? "");
      if (newPullingTime < 0) newPullingTime += 1440;
      else if (newPullingTime > 0) newPullingTime %= 1440;
      setValue(`processRows.${index}.waktu`, formatDuration(newPullingTime));

      let newWrappingTime =
        loadingTime -
        waitingTime -
        parseTimetonumber(processRows[pullingIndex].durasi || "00:00");
      if (newWrappingTime < 0) newWrappingTime += 1440;
      if (newWrappingTime > 1440) newWrappingTime %= 1440;

      const istirahatDurasi = calculateBreakDuration(
        newPullingTime,
        parseTimetonumber(processRows[pullingIndex].durasi || "00:00"),
        breaks || []
      );
      const durasiIstirahat = parseTimetonumber(istirahatDurasi);

      setValue(`processRows.${istirahatIndex}.durasi`, istirahatDurasi);
      let WrappingTime =
        newPullingTime +
        parseTimetonumber(processRows[pullingIndex].durasi || "00:00") +
        durasiIstirahat;
      if (WrappingTime >= 1440) WrappingTime -= 1440;

      setValue(
        `processRows.${wrappingIndex}.waktu`,
        formatDuration(WrappingTime)
      );
      const wrappingEnd = (WrappingTime + wrappingDurasi) % 1440;

      let waitingDurasi = loadingTime - wrappingEnd;
      if (waitingDurasi < 0) waitingDurasi += 1440;
      else if (waitingDurasi > 1440) waitingDurasi %= 1440;

      if (waitingIndex >= 0) {
        setValue(
          `processRows.${waitingIndex}.durasi`,
          formatDuration(waitingDurasi)
        );
      }
    }

    const pullingDuration = parseTimetonumber(
      processRows[pullingIndex].durasi ?? ""
    );

    if (
      istirahatIndex !== -1 &&
      index != wrappingIndex &&
      index != pullingIndex
    ) {
      const istirahatTime = calculateBreakDuration(
        parseTimetonumber(processRows[pullingIndex].waktu ?? ""),
        parseTimetonumber(processRows[pullingIndex].durasi ?? ""),
        breaks || []
      );
      setValue(`processRows.${istirahatIndex}.durasi`, istirahatTime);

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
      else if (waitingDurasi > 1440) waitingDurasi %= 1440;

      if (waitingIndex >= 0) {
        setValue(
          `processRows.${waitingIndex}.durasi`,
          formatDuration(waitingDurasi)
        );
      }
    }
  };

  const handleDurasiChange = (
    index: number,
    newDuration: string,
    field?: string
  ) => {
    const processRows = getValues("processRows");
    const currentProcess = processRows[index];
    setValue(`processRows.${index}.durasi`, newDuration);

    if (currentProcess.processName.toLowerCase().includes("pulling")) {
      updatePullingEffects(
        index,
        "durasi",
        parseTimetonumber(field ? field : "")
      );
    } else if (currentProcess.processName.toLowerCase().includes("wrapping")) {
      updatePullingEffects(index, "durasi");
    } else if (currentProcess.processName.toLowerCase().includes("truck out")) {
      recalculatePreviousRows(index);
      updatePullingEffects(index, "durasi");
    } else if (currentProcess.processName.toLowerCase().includes("istirahat")) {
      updatePullingEffects(index, "durasi");
    } else {
      recalculatePreviousRows(index);
      recalculateNextRows(index);
      updatePullingEffects(index, "durasi");
    }
  };

  const handleWaktuChange = (index: number, newTime: string) => {
    const processRows = getValues("processRows");
    const currentProcessName =
      processRows[index]?.processName?.toLowerCase() || "";

    setValue(`processRows.${index}.waktu`, newTime);
    if (currentProcessName.includes("pulling")) {
      updatePullingEffects(index, "waktu");
    } else if (currentProcessName.includes("wrapping")) {
      updatePullingEffects(index, "waktu");
    } else if (currentProcessName.includes("truck out")) {
      recalculatePreviousRows(index);
      updatePullingEffects(index, "waktu");
    } else {
      recalculatePreviousRows(index);
      recalculateNextRows(index);
      updatePullingEffects(index, "waktu");
    }
  };
  const previousTime = useRef<string | null>(null);

  const handleCustomTab = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Tab" && !e.shiftKey) {
      e.preventDefault();
      const allFields = Array.from(
        document.querySelectorAll<HTMLInputElement>("input[data-id]")
      );

      const currentId = e.currentTarget.getAttribute("data-id");
      const currentIndex = allFields.findIndex(
        (el) => el.getAttribute("data-id") === currentId
      );

      let nextIndex: number;
      if (currentIndex < 7) {
        nextIndex = currentIndex + 1;
      } else if (currentIndex === 7) {
        nextIndex = allFields.length - 1;
      } else if (currentIndex === 11) {
        nextIndex = currentIndex - 2;
      } else {
        nextIndex = currentIndex - 1;
      }

      const nextField = allFields[nextIndex];
      nextField?.focus();
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
        {fields.map((field, index) => {
          const processName = getValues(`processRows.${index}.processName`);

          return (
            <div key={field.id} className="mb-4 p-2 border rounded w-full">
              <input
                {...register(`processRows.${index}.processName` as const)}
                defaultValue={field.processName}
                className="font-semibold w-full"
                disabled
              />

              {processName.toLowerCase() !== "istirahat" &&
                processName.toLowerCase() !== "waiting shipping area" && (
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
                            autoFocus={true}
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
                                handleWaktuChange(index, formatted);
                              } else {
                                setError(`processRows.${index}.waktu`, {
                                  type: "manual",
                                  message: "Format salah! Gunakan HH:mm",
                                });
                              }
                            }}
                            data-id={field.name}
                            onKeyDown={handleCustomTab}
                          />
                        </div>
                      )}
                    />
                  </div>
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
                      value={field.value || ""}
                      className="bg-gray-50 border leading-none border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-emerald-500 focus:border-emerald-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-emerald-500 dark:focus:border-emerald-500"
                      required
                      onFocus={() => {
                        previousTime.current = field.value || "";
                      }}
                      onChange={(e) => {
                        const formatted = formatTime(e.target.value);
                        field.onChange(formatted);
                        const regex = /^([01]\d|2[0-3]):([0-5]\d)$/;
                        if (regex.test(formatted)) {
                          clearErrors(`processRows.${index}.durasi`);
                          setValue(`processRows.${index}.durasi`, formatted);

                          handleDurasiChange(
                            index,
                            formatted,
                            previousTime.current || "00:00"
                          );
                        } else {
                          setError(`processRows.${index}.durasi`, {
                            type: "manual",
                            message: "Format salah! Gunakan HH:mm",
                          });
                        }
                      }}
                      data-id={field.name}
                      onKeyDown={handleCustomTab}
                    />
                  </div>
                )}
              />
            </div>
          );
        })}
      </div>

      <div className="w-full flex justify-items-center ">
        <Button type="submit">Update Data</Button>
      </div>
    </form>
  );
};

export default UpdateForm;
