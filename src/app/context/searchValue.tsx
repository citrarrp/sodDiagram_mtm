"use client"
import { createContext } from "react";

interface SearchContextType {
    searchValue: string;
    setSearchValue: (value: string) => void
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export default SearchContext;