// import html2canvas from "html2canvas";
// import { jsPDF } from "jspdf";
// import React from "react";
// import { useRef, useState } from "react";

// const PrintPDF = ({
//   children,
//   customer,
// }: {
//   children: React.ReactNode;
//   customer: string;
// }) => {
//   const pdfRef = useRef(null);
//   const [isPrint, setIsPrint] = useState(false);
//   const PrintPDF = async () => {

//     await new Promise((resolve) => setTimeout(resolve, 100));
//     const input = pdfRef.current;
//     if (!input) {
//       throw new Error(`Element with id ${input} not found`);
//     }
//     if (input) {
//       const canvas = await html2canvas(input, { scale: 2 });
//       const imgData = canvas.toDataURL("image/png");

//       const pdf = new jsPDF("p", "mm", "a4");
//       const imgProperties = pdf.getImageProperties(imgData);
//       const pdfWidth = pdf.internal.pageSize.getWidth();
//       const pdfHeight = (imgProperties.height * pdfWidth) / imgProperties.width;

//       pdf.addImage(imgData, "PNG", 10, 10, pdfWidth, pdfHeight);

//       pdf.save("customer_report.pdf");
//     }

//     setIsPrint(false);
//   };
//   return (
//     <div>
//       <div ref={pdfRef} className="p-4 border border-gray-300 bg-white">
//         {/* {isPrint && <h1 className="text-xl font-bold">{customer}</h1>} */}
//         {children}
//       </div>

//       <button
//         onClick={PrintPDF}
//         className="mt-4 px-4 py-2 bg-blue-500 text-white cursor-pointer rounded"
//       >
//         Cetak PDF
//       </button>
//     </div>
//   );
// };
// export default PrintPDF;
