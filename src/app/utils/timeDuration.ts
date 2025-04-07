export const timetoIndex = (time: string) => {
  const [hour, minute] = time.split(".").map(Number);
  return hour * 60 + minute;
};

export const parseTimetonumber = (time: string) => {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
};

export const formatTime = (value: string) => {
  const numberOnly = value.replace(/\D/g, "");
  let formatted = "";
  if (numberOnly.length >= 1) {
    formatted += numberOnly.slice(0, 2);
  }
  if (numberOnly.length >= 3) {
    formatted += ":" + numberOnly.slice(2, 4);
  }
  return formatted;
};

export const formatDuration = (value: number) => {
  const hours = Math.floor(value / 60);
  const minutes = value % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`;
};

export const formatMinutesToTime = (totalMinutes: number): string => {
  let minutes = totalMinutes % 60;
  let hours = Math.floor(totalMinutes / 60) % 24;
  if (hours < 0) hours += 24;
  if (minutes < 0) minutes += 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}`;
};

export const datetoTime = (time: Date): number => {
  const waktu =
    new Date(time).getUTCHours() * 60 + new Date(time).getUTCMinutes();

  return waktu;
};

export const formatUTCTime = (dateString: string) => {
  const date = new Date(dateString);
  return `${String(date.getUTCHours()).padStart(2, "0")}:${String(
    date.getUTCMinutes()
  ).padStart(2, "0")}`;
};

export const calculateDuration = ({
  start,
  end,
}: {
  start: string;
  end: string;
}) => {
  return timetoIndex(end) - timetoIndex(start);
};

type istirahat = {
  id: number;
  shift_id: number;
  nama_istirahat: string;
  jam_mulai: string;
  jam_selesai: string;
};

export function calculateBreakDuration(
  pullingTime: number,
  pullingDuration: number,
  Break: istirahat[] = []
): string {

  let totalBreakMinutes = 0;

  Break.forEach((brk: istirahat) => {
    const breakStartMin =
      new Date(brk.jam_mulai).getUTCHours() * 60 +
      new Date(brk.jam_mulai).getUTCMinutes();

    const breakEndMin =
      new Date(brk.jam_selesai).getUTCHours() * 60 +
      new Date(brk.jam_selesai).getUTCMinutes();

    const overlapStart = Math.max(pullingTime, breakStartMin);
    const overlapEnd = Math.min(pullingTime + pullingDuration, breakEndMin);

    if (overlapEnd > overlapStart) {
      totalBreakMinutes += overlapEnd - overlapStart;
    }
  });

  const hours = Math.floor(totalBreakMinutes / 60);
  const minutes = totalBreakMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
    2,
    "0"
  )}`;
}
