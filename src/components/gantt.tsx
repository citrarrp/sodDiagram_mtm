import { timetoIndex } from "@/app/utils/timeDuration";

type Data = {
  id: number;
  customerName: string;
  processName: string;
  cycle: string;
  waktu: string;
  durasi: string;
  updateMonth: string;
};
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

export function SOD(data: Data[]) {
  const grouped = new Map<string, Data[]>();

  if (data && Array.isArray(data)) {
    data.forEach((item) => {
      const key = `${item.customerName}_${item.cycle}`;
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key)!.push(item);
    });

    const result: cycleProcess[] = [];

    grouped.forEach((items, key) => {
      const [customerName, cycle] = key
        .split("_")
        .map((v, i) => (i === 1 ? Number(v) : v));

      items.sort((a, b) => a.id - b.id);

      const Tasks: task[] = [];

      const Items = items
        .filter((item) => item.durasi !== null)
        .map((item) => ({
          ...item,
          processName: item.processName.replace(/\s\d+$/, ""),
        }));

      Items.forEach(
        (item) => {
          const lowerKode = item.processName.toLowerCase();

          if (
            lowerKode === "waiting shipping area" ||
            lowerKode.includes("istirahat")
          ) {
            return;
          } else {
            const waktu = new Intl.DateTimeFormat("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
              timeZone: "UTC",
            }).format(new Date(item.waktu));

            const durasi = new Intl.DateTimeFormat("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
              timeZone: "UTC",
            }).format(new Date(item.durasi));

            const waktuStart = timetoIndex(waktu);
            const duration = timetoIndex(durasi);

            Tasks.push({ processName: item.processName, waktuStart, duration });
          }
        },
        result.push({
          customerName: customerName as string,
          cycle: cycle as number,
          process: Tasks,
          updateMonth: Items[0].updateMonth
        })
      );
    });
    return result;
  }
}
