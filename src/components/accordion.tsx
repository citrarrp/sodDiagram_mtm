// type task = {
//   processName: string;
//   waktuStart: number;
//   duration: number;
// };
// type cycleProcess = {
//   customerName: string;
//   cycle: number;
//   process: task[];
// };

// type Shift = {
//   id: number;
//   kode_shift: string;
//   jam_mulai: string;
//   jam_selesai: string;
// };

// type ShiftResponse = {
//   status: number;
//   success: boolean;
//   data: Shift[];
// };

// type Task = {
//   processName: string;
//   waktuStart: number | null;
//   duration: number;
//   groupColor?: string;
// };

// type CycleProcess = {
//   customerName: string;
//   cycle: number;
//   process: Task[];
// };

// type groupedCust = {
//   customerName: string;
//   cycles: cycleProcess[];
// };

// type SOD = {
//   id: number;
//   customerName: string;
//   processName: string;
//   cycle: string;
//   waktu: string;
//   durasi: string;
// };

// type SODProp = {
//   status: number;
//   success: boolean;
//   data: SOD[];
// };

// type Break = {
//   id: number;
//   shift_id: number;
//   nama_istirahat: string;
//   jam_mulai: string;
//   jam_selesai: string;
// };

// type flatGrouped = {
//   customer: string;
//   cycle: number;
//   color: string;
// };

// interface AccordionProps {
//   grouped: groupedCust[];
//   sod: SODProp;
//   data: ShiftResponse;
//   breaks: Break[];
//   allCycles: flatGrouped[];
//   uniqueProcessPerCustomer: CycleProcess[];
// }
"use client";
import React, { useState } from "react";
import { FaCaretDown, FaCaretUp } from "react-icons/fa";
const CustomerAccordion = ({
  children,
  customer,
  indeks,
}: {
  children: React.ReactNode;
  customer: string;
  indeks: number;
}) => {
  // const { isOpen, toggleOpen } = useAccordion();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      key={indeks}
      className={`max-w-screen w-full items-center h-full grid-cols `}
    >
      <button
        className="border shadow-xl rounded-lg p-7 text-left cursor-pointer font-bold text-xl flex justify-between items-center w-full"
        onClick={() => setIsOpen(!isOpen)}
      >
        {customer}
        <span>{isOpen ? <FaCaretUp /> : <FaCaretDown />}</span>
      </button>

      {isOpen && (
        <div
          className={`mt-4 space-y-6 w-full transition-all duration-200 h-fit max-h-[5000px]`}
        >
          {children}
        </div>
      )}
    </div>
  );
};

export default CustomerAccordion;
