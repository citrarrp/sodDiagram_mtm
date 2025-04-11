"use client";
import { jsPDF } from "jspdf";
import React from "react";
import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { IoMdPrint } from "react-icons/io";
import ptMTM from "@/app/assets/PT_Menara_Terus_Makmur.jpg";
import Image from "next/image";

const GeneratePDF = ({
  children,
  customer,
}: {
  children: React.ReactNode;
  customer: string;
}) => {
  const pdfRef = useRef<HTMLDivElement>(null);
  const date = new Date();
  const year = date.getFullYear();
  const [isPrint, setIsPrint] = useState(false);
  const PrintPDF = async () => {
    setIsPrint(true);
    await new Promise((resolve) => setTimeout(resolve, 20));
    const input = pdfRef.current;
    if (!input) {
      throw new Error(`Element with id ${input} not found`);
    }
    if (input) {
      input.style.transform = "scale(0.95)";
      input.style.transformOrigin = "top-left";
      const imgData = await toPng(input, { quality: 1, pixelRatio: 3 });
      input.style.transform = "";
      const pdf = new jsPDF("l", "mm", "a4");
      // const imgProperties = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      // const pdfHeight = (imgProperties.height * pdfWidth) / imgProperties.width;

      const pdfHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, "PNG", 5, 0, pdfWidth, pdfHeight, "", "FAST");

      pdf.output("dataurlnewwindow");
      pdf.save(`SOD_${customer}.pdf`);
    }
    setIsPrint(false);
  };

  return (
    <div>
      <div
        ref={pdfRef}
        className={`pointer-events-none bg-white h-full w-full mb-10 shadow-none drop-shadow-none`}
      >
        <div
          className={`${
            isPrint ? "block" : "hidden"
          } relative w-full h-[70px] shadow-none drop-shadow-none`}
        >
          <Image
            src={ptMTM}
            alt="PT Menara Terus Makmur"
            width={300}
            height={70}
            placeholder="blur"
            className="absolute left-0 top-0 shadow-none drop-shadow-none"
          />
          <h1 className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 text-lg font-bold">
            SHIPPING OPERATIONAL DIAGRAM
          </h1>
        </div>
        <h1
          className={`${isPrint ? "block" : "hidden"} font-semibold text-md `}
        >
          {customer}
        </h1>
        <div
          className={`${isPrint ? "block" : "hidden"} inline-flex mb-0 mt-2`}
        >
          <hr
            className={`${
              isPrint ? "block" : "hidden"
            } w-30 h-5px my-4 border-black border-1`}
          ></hr>
          <p
            className={`${
              isPrint ? "block" : "hidden"
            } text-md font-normal mx-2`}
          >
            {year}
          </p>
        </div>
        {children}
        <div className={`${isPrint ? "block" : "hidden"} w-full`}>
          <table className={`table-fixed ml-auto mr-10 w-105 font-normal mt-1`}>
            <thead>
              <tr className="text-black text-xs/2 font-normal">
                <th className="border px-2 py-1 w-1/3 font-normal">
                  Disetujui
                </th>
                <th className="border px-2 py-1 w-1/3 font-normal">
                  Diperiksa
                </th>

                <th className="border px-2 py-1 w-1/3 font-normal">Dibuat</th>
              </tr>
            </thead>
            <tbody className="h-[87px]">
              <tr className=" text-black h-12">
                <th className="border px-2 py-1"></th>
                <th className="border px-2 py-1"></th>
                <th className="border px-2 py-1"></th>
              </tr>
              <tr className=" text-black h-1">
                <th className="border px-1 py-2"></th>
                <th className="border px-1 py-2"></th>
                <th className="border px-1 py-2"></th>
              </tr>
            </tbody>
          </table>
        </div>
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
