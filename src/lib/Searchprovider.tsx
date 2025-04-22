"use client"
import React, { useState } from "react";
import SearchContext from "@/app/context/searchValue";
export const SearchProvider = ({ children } :{ children : React.ReactNode }) => {
  const [searchValue, setSearchValue] = useState("");

  return (
    <SearchContext.Provider value={{searchValue, setSearchValue}}>
      {children}
    </SearchContext.Provider>
  );
};

export default SearchProvider;
