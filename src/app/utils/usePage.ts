"use client"
import { useContext } from "react";
import PaginationContext from "../context/pagination";
export const usePagination = () => {
  const context = useContext(PaginationContext);
  if (!context) {
    throw new Error("useSearch must be used within a SearchProvider");
  }
  return context;
};
