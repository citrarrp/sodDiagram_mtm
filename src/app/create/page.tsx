"use client";
import CreateForm from "@/components/form/createCustomer";
// import { getBreaks, getSOD } from "@/lib/function";
import { useEffect, useState } from "react";

// type sod = {
//   id: number;
//   customerName: string;
//   cycle: number;
//   waktu: string;
//   durasi: string;
//   processName: string;
//   updateMonth: string;
// };

// interface Break {
//   id: number;
//   shift_id: number;
//   nama_istirahat: string;
//   jam_mulai: string;
//   jam_selesai: string;
// }
// export default async function Page() {
// const [breaks, setBreaks] = useState<Break[]>([]);
// const [dataSOD, setdataSOD] = useState<sod[]>([]);
// const getBreaksData = async () => {
//   const result = await getBreaks();
//   setBreaks(result.data);
// };

// const refreshSOD = async () => {
//   const result = await getSOD();
//   setdataSOD(result.data);
// };

// useEffect(() => {
//   const getInitialData = async () => {
//     try {
//       await getBreaksData();
//       await refreshSOD();
//     } catch (error) {
//       console.error("Gagal memuat data!", error);
//     }
//   };
//   getInitialData();
// }, []);

// if (!breaks || !dataSOD) {
//   return (
//     <div className="p-4 text-gray-500">Memuat data, mohon tunggu...</div>
//   );
// }
//   const dataSOD = await getSOD();
//   const breaks = await getBreaks();

//   return (
//     <CreateForm
//       data={dataSOD.data || []}
//       istirahat={breaks.data || []}
//       // onSuccess={refreshSOD}
//     />
//   );
// }

export default function Page() {
  const [dataSOD, setDataSOD] = useState([]);
  const [breaks, setBreaks] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const sodRes = await fetch("/sodDiagram/api/sod/");
      const sod = await sodRes.json();
      setDataSOD(sod.data || []);

      const breakRes = await fetch("/sodDiagram/api/break/");
      const br = await breakRes.json();
      setBreaks(br.data || []);
    };

    fetchData();
  }, []);

  return <CreateForm data={dataSOD} istirahat={breaks} />;
}
