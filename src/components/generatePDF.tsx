"use client";
import { jsPDF } from "jspdf";
import React from "react";
import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { IoMdPrint } from "react-icons/io";
import Image from "next/image";

const GeneratePDF = ({
  children,
  customer,
  updateMonth,
  countCycle,
}: {
  children: React.ReactNode;
  customer: string;
  updateMonth: string;
  countCycle: number;
}) => {
  const pdfRef = useRef<HTMLDivElement>(null);
  const date = new Date();
  const year = date.getFullYear();
  const [isPrint, setIsPrint] = useState(false);
  const PrintPDF = async () => {
    setIsPrint(true);
    await new Promise((resolve) => setTimeout(resolve, 30));
    const input = pdfRef.current;
    if (!input) {
      throw new Error(`${input} tidak ditemukan!`);
    }
    if (input) {
      input.style.transform = "scale(0.95)";
      input.style.transformOrigin = "top-left";
      const imgData = await toPng(input, { quality: 1, pixelRatio: 3 });
      input.style.transform = "";
      const pdf = new jsPDF("l", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, "PNG", 5, 0, pdfWidth, pdfHeight, "", "FAST");

      pdf.output("dataurlnewwindow");
      pdf.save(`SOD_${customer}.pdf`);
    }
    setIsPrint(false);
  };

 const monthMap = {
  'January': 'Januari',
  'February': 'Februari',
  'March': 'Maret',
  'April': 'April',
  'May': 'Mei',
  'June': 'Juni',
  'July': 'Juli',
  'August': 'Agustus',
  'September': 'September',
  'October': 'Oktober',
  'November': 'November',
  'December': 'Desember'
} as const;

type MonthKey = keyof typeof monthMap;

  return (
    <div>
      <div
        ref={pdfRef}
        className={`pointer-events-none bg-white h-full w-full mb-10 shadow-none drop-shadow-none`}
      >
        {isPrint && (
          <table className="table-fixed w-full font-normal border-collapse border-black mb-5 h-[70px]">
            <tbody>
              <tr>
                <td
                  rowSpan={6}
                  className="w-1/6 border-1 border-black align-middle bg-white px-1"
                >
                  <Image
                    src="/sodDiagram/pt_mtm.jpg"
                    alt="PT Menara Terus Makmur"
                    width={400}
                    height={85}
                    // placeholder="blur"
                    // blurDataURL="/public/pt_mtm.jpg"
                    style={{
                      width: "400px",
                      height: "85px",
                      objectFit: "fill",
                    }}
                    className="shadow-none drop-shadow-none py-auto"
                  />
                </td>
                <td
                  colSpan={3}
                  rowSpan={4}
                  className="w-4/6 text-center align-middle border-1 border-black"
                >
                  <h1 className="text-3xl font-bold">
                    SHIPPING OPERATION DIAGRAM
                  </h1>
                </td>
                <td className="border px-2 py-1 w-1/9 text-center border-black">
                  Disetujui
                </td>
                <td className="border px-auto py-1 w-1/9 text-center border-black">
                  Diperiksa
                </td>
                <td className="border px-2 py-1 w-1/9 text-center border-black">
                  Dibuat
                </td>
                <td className="w-1/24 invisible">
                  <span>1</span>
                </td>
              </tr>
              <tr>
                <td rowSpan={4} className="border px-2 py-2 border-black"></td>
                <td rowSpan={4} className="border px-2 py-2 border-black"></td>
                <td rowSpan={4} className="border px-2 py-2 border-black"></td>
                <td className="w-1/24 invisible">
                  <span>2</span>
                </td>
              </tr>
              <tr>
                <td className="w-1/24 invisible">
                  <span>3</span>
                </td>
              </tr>
              <tr>
                <td className="w-1/24 invisible">
                  <span>4</span>
                </td>
              </tr>

              <tr>
                <td
                  rowSpan={2}
                  className="text-md font-semibold text-center border-1 border-black px-2 py-1"
                >
                  {monthMap[updateMonth as MonthKey] || updateMonth}/{year}
                </td>
                <td className="text-md text-left border-1 border-black px-2 py-1">
                  customer
                </td>
                <td className="text-md font-semibold text-left border-1 border-black px-2 py-1">
                  {customer}
                </td>
                <td className="w-1/24 invisible">
                  <span>5</span>
                </td>
              </tr>
              <tr>
                <td className="text-md text-left border-1 border-black px-2 py-1">
                  cycle issue
                </td>
                <td className="text-md font-normal text-left border-1 border-black px-2 py-1">
                  <span className="w-[1px] invisible">00</span> :{" "}
                  <span className="w-[1px]">{countCycle}</span> :{" "}
                  <span className="w-[1px]">[X]</span>
                </td>
                <td className="border px-2 py-2 border-black"></td>
                <td className="border px-2 py-2 border-black"></td>
                <td className="border px-2 py-2 border-black"></td>
                <td className="w-1/24 invisible">
                  <span>6</span>
                </td>
              </tr>
            </tbody>
          </table>
        )}
        {children}
      </div>

      <button
        onClick={PrintPDF}
        className="px-4 py-2 bg-emerald-500 text-white rounded cursor-pointer hover:bg-emerald-600 flex items-center gap-2 mx-auto"
      >
        <IoMdPrint />
        Cetak PDF
      </button>
    </div>
  );
};
export default GeneratePDF;
