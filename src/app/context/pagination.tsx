"use client"
import { createContext } from "react";

interface PageContext {
    totalPage: number;
    setTotalPage: (value: number) => void;
    currentPage: number;
    setCurrentPage: (value: number) => void
}

const PaginationContext = createContext<PageContext | undefined>(undefined);

export default PaginationContext;