"use client";
import { jsPDF } from "jspdf";
import React from "react";
import { useRef } from "react";
import { toPng } from "html-to-image";
import { IoMdPrint } from "react-icons/io";

const GeneratePDF = ({
  children,
  customer,
}: {
  children: React.ReactNode;
  customer: string;
}) => {
  const pdfRef = useRef<HTMLDivElement>(null);

  const PrintPDF = async () => {
    const input = pdfRef.current;
    if (!input) {
      throw new Error(`Element with id ${input} not found`);
    }
    if (input) {
      input.style.transform = "scale(1.01)";
      input.style.transformOrigin = "top-left";
      const imgData = await toPng(input, { quality: 0.99 });
      input.style.transform = "";
      const pdf = new jsPDF("l", "mm", "a4");
      const imgProperties = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProperties.height * pdfWidth) / imgProperties.width;

      pdf.addImage(imgData, "PNG", 5, 10, pdfWidth, pdfHeight, "", "FAST");

      pdf.output("dataurlnewwindow");
      pdf.save(`SOD_${customer}.pdf`);
    }
  };

  return (
    <div className="">
      <div ref={pdfRef} className="bg-white h-full w-full">
        <h1 className="font-bold text-xl mx-10">{customer}</h1>
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
