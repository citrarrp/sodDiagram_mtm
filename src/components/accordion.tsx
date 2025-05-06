
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
        {customer.toUpperCase()}
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
