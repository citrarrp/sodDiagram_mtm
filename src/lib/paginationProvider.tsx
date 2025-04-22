"use client"
import React, { useState } from "react";
import PaginationContext from "@/app/context/pagination";
export const PaginationProvider = ({ children } :{ children : React.ReactNode }) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPage, setTotalPage] = useState<number>(1);
 
  return (
    <PaginationContext.Provider value={{totalPage, setTotalPage, currentPage, setCurrentPage}}>
      {children}
    </PaginationContext.Provider>
  );
};

export default PaginationProvider;
