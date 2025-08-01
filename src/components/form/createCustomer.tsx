"use client";
import {
  calculateBreakDuration,
  formatDuration,
  formatTime,
  parseTimetonumber,
} from "@/app/utils/timeDuration";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { IoArrowBackCircle, IoTime } from "react-icons/io5";
import Link from "next/link";
import Button from "../Button";
import { useToast } from "../toast";
import { useEffect, useState } from "react";
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
  updateMonth: string;
  kodeCustomer: string;
};

interface FormValues {
  customerName: string;
  kodeCustomer: string;
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
}: // onSuccess,
{
  data: sod[];
  istirahat: Break[];
  // onSuccess?: () => void;
}) => {
  const router = useRouter();
  const { showToast } = useToast();
  const [hasReset, setHasReset] = useState(false);
  // const [dataLoaded, setDataLoaded] = useState(false);

  const filteredData = data.filter(
    (item) =>
      item.processName && !item.processName.toLowerCase().includes("lama")
  );

  const uniqueFields = Array.from(
    new Map(filteredData.map((field) => [field.processName, field])).values()
  );

  const uniqueNama = Array.from(
    new Set(filteredData.map((cust) => cust.customerName))
  );

  const cyclePerCustomer = new Map();

  uniqueNama.forEach((nama) => {
    const cycles = [
      ...new Set(
        filteredData
          .filter((cust) => cust.customerName === nama)
          .map((cust) => cust.cycle)
      ),
    ];
    cyclePerCustomer.set(nama, cycles);
  });

  const {
    control,
    setValue,
    handleSubmit,
    register,
    clearErrors,
    setError,
    getValues,
    reset,
  } = useForm<FormValues>({
    defaultValues: {
      customerName: "",
      cycle: 1,
      kodeCustomer: "",
      processRows: uniqueFields.map((field) => ({
        processName: field.processName,
        waktu: "",
        durasi: "",
      })),
    },
  });

  // const { fields } = useFieldArray({
  //   control,
  //   name: "processRows",
  // });
  useEffect(() => {
    if (!hasReset && uniqueFields.length > 0) {
      reset({
        customerName: "",
        cycle: 1,
        kodeCustomer: "",
        processRows: uniqueFields.map((field) => ({
          id: Math.random(), // WAJIB tambahkan ID
          processName: field.processName,
          waktu: "",
          durasi: "",
        })),
      });
      setHasReset(true);
    }
  }, [uniqueFields, reset, hasReset]);

  const { fields } = useFieldArray({
    control,
    name: "processRows",
  });

  const onSubmit = async (formData: FormValues) => {
    // Cek jika customer sudah ada dengan cycle yang sama
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

    // Validasi formData
    if (!formData.customerName || !formData.cycle) {
      showToast("failed", "Customer name dan cycle tidak boleh kosong.");
      return;
    }

    const payload = {
      customerName: formData.customerName,
      cycle: formData.cycle,
      kodeCustomer: formData.kodeCustomer,
      updates: formData.processRows,
    };

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/sod/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (response.ok) {
        // Cek apakah router sudah ada dan valid
        if (router) {
          // router.refresh();
          showToast("success", "Data berhasil ditambahkan!");
          router.push("/dashboard");
          // if (onSuccess) onSuccess();
        } else {
          showToast("failed", "Router tidak ditemukan.");
        }
      } else {
        showToast("failed", "Terjadi kesalahan saat menyimpan data.");
      }
    } catch (error) {
      if (error instanceof Error) {
        showToast(
          "failed",
          `Terjadi kesalahan saat menyimpan data: ${error.message}`
        );
      } else {
        showToast("failed", "Terjadi kesalahan saat menyimpan data.");
      }
    }
  };

  // const onSubmit = async (formData: FormValues) => {
  //   const customerCycles = data
  //     .filter(
  //       (item) =>
  //         item.customerName.toLowerCase() ===
  //         formData.customerName.toLowerCase()
  //     )
  //     .map((item) => item.cycle);

  //   if (customerCycles.includes(formData.cycle)) {
  //     showToast(
  //       "failed",
  //       `Cycle ${formData.cycle} sudah ada untuk customer ${formData.customerName}`
  //     );
  //     return;
  //   }
  //   const payload = {
  //     customerName: formData.customerName,
  //     cycle: formData.cycle,
  //     updates: formData.processRows,
  //   };
  //   try {
  //     const response = await fetch(
  //       `${process.env.NEXT_PUBLIC_BASE_URL}/api/sod/`,
  //       {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify(payload),
  //       }
  //     );
  //     if (response.ok) {
  //       router.refresh();
  //       showToast("success", "Data berhasil disimpan!");
  //       router.replace("/dashboard");
  //     } else {
  //       showToast("failed", "Terjadi kesalahan saat menyimpan data.");
  //     }
  //   } catch (error) {
  //     showToast("failed", `Terjadi kesalahan saat menyimpan data: ${error}`);
  //   }
  // };

  const updateProcessTimes = (
    processRows: ProcessRow[],
    index: number,
    tipe: "durasi" | "waktu"
  ) => {
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

    if (
      waitingIndex !== -1 &&
      wrappingIndex !== -1 &&
      loadingIndex !== -1 &&
      index >= pullingIndex
    ) {
      setValue(
        `processRows.${waitingIndex}.durasi`,
        processRows[waitingIndex]?.durasi
      );

      const wrappingDuration = parseTimetonumber(
        processRows[wrappingIndex]?.durasi
      );
      const loadingTime = parseTimetonumber(processRows[loadingIndex]?.waktu);

      if (
        isValid(wrappingDuration) &&
        isValid(loadingTime) &&
        isValid(parseTimetonumber(processRows[waitingIndex]?.durasi))
      ) {
        let wrappingTime =
          loadingTime -
          parseTimetonumber(processRows[waitingIndex]?.durasi) -
          wrappingDuration;

        if (wrappingTime < 0) {
          wrappingTime += 1440;

          wrappingTime %= 1440;
        }
        setValue(
          `processRows.${wrappingIndex}.waktu`,
          formatDuration(wrappingTime)
        );
      }
    }

    if (breakIndex !== -1 && pullingIndex !== -1 && index >= pullingIndex) {
      setValue(`processRows.${breakIndex}.waktu`, "");
      let pullingTime = parseTimetonumber(processRows[pullingIndex].waktu);
      const pullingDuration = parseTimetonumber(
        processRows[pullingIndex].durasi
      );

      if (isValid(pullingDuration)) {
        if (tipe === "durasi") {
          if (isValid(parseTimetonumber(processRows[wrappingIndex].waktu)))
            setValue(
              `processRows.${pullingIndex}.durasi`,
              processRows[pullingIndex].durasi
            );
          setValue(
            `processRows.${pullingIndex}.waktu`,
            formatDuration(
              parseTimetonumber(processRows[wrappingIndex].waktu) -
                pullingDuration <
                0
                ? (parseTimetonumber(processRows[wrappingIndex].waktu) -
                    pullingDuration +
                    1440) %
                    1440
                : parseTimetonumber(processRows[wrappingIndex].waktu) -
                    pullingDuration
            )
          );
        } else if (tipe === "waktu") {
          setValue(
            `processRows.${pullingIndex}.waktu`,
            processRows[pullingIndex].waktu
          );
          const WrappingTime =
            parseTimetonumber(processRows[pullingIndex].waktu) +
            parseTimetonumber(processRows[pullingIndex].durasi) +
            1440;

          setValue(
            `processRows.${wrappingIndex}.waktu`,
            formatDuration(WrappingTime % 1440)
          );
        }

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
          const newWrappingTime =
            parseTimetonumber(processRows[wrappingIndex].waktu) +
            parseTimetonumber(breakDuration) +
            1440;

          setValue(
            `processRows.${wrappingIndex}.waktu`,
            formatDuration(newWrappingTime % 1440)
          );

          let newWaitingTime =
            loadingTime -
            (newWrappingTime + wrappingDuration > 1440
              ? (newWrappingTime + wrappingDuration) % 1440
              : newWrappingTime + wrappingDuration);

          if (newWaitingTime < 0) {
            newWaitingTime += 1440;
            newWaitingTime %= 1440;
          }
          setValue(
            `processRows.${waitingIndex}.durasi`,
            formatDuration(newWaitingTime)
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
          else if (lastTime > 1440) lastTime %= 1440;

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
          else if (prevTime > 1440) prevTime %= 1440;

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
    }

    if (index < 2 && index <= processRows.length - 3 && index != -1) {
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
  // if (!dataLoaded) {
  //   return (
  //     <div className="flex items-center justify-center h-screen bg-white-100">
  //       <div className="flex flex-col items-center space-y-4">
  //         <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>

  //         <p className="text-lg font-semibold text-emerald-900 animate-pulse">
  //           Loading...
  //         </p>
  //       </div>
  //     </div>
  //   );
  // }
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
          list="customers"
          {...register("customerName", { required: true })}
          className="border rounded w-auto p-3"
          autoFocus
          placeholder="Pilih atau tambah customer baru"
        />
        <datalist id="customers">
          {uniqueNama.map((cust) => (
            <option key={cust} value={cust} />
          ))}
        </datalist>
      </div>

      <div className="mb-4">
        <label className="block mb-1">Cycle</label>
        {/* <input
          type="number"
          min={1}
          {...register("cycle", {
            required: true,
            valueAsNumber: true,
          })}
          className="w-auto border rounded p-3"
          required
        /> */}
        <input
          type="number"
          min={1}
          {...register("cycle", { required: true, valueAsNumber: true })}
          className="border rounded w-[400px] p-3"
          placeholder="Masukkan kode customer untuk identifikasi master data!"
          autoFocus
        />
      </div>

      <div className="mb-4">
        <label className="block mb-1">Kode Customer</label>
        <input
          type="text"
          {...register("kodeCustomer")}
          className="border rounded w-[400px] p-3"
          autoFocus
        />
      </div>

      <div className="grid grid-cols-2 gap-x-10">
        {fields.map((field, index) => {
          const processName = getValues(`processRows.${index}.processName`);
          return (
            <div key={field.id} className="mb-4 p-2 border rounded w-full">
              <input
                {...register(`processRows.${index}.processName` as const, {
                  required: true,
                })}
                className="font-semibold w-full"
                disabled
                autoFocus={true}
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
                              disabled={
                                processName.toLowerCase() === "istirahat" ||
                                processName.toLowerCase() ===
                                  "waiting shipping area"
                              }
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
                                    index,
                                    "waktu"
                                  );
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
                          updateProcessTimes(
                            getValues("processRows"),
                            index,
                            "durasi"
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
                      disabled={processName.toLowerCase() === "istirahat"}
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

export default CreateForm;
