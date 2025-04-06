"use client";
import { createContext, useContext, useState, ReactNode } from "react";

type AccordionContextType = {
  isOpen: boolean;
  toggleOpen: () => void;
};

const AccordionContext = createContext<AccordionContextType | undefined>(
  undefined
);

export const AccordionProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <AccordionContext.Provider value={{ isOpen, toggleOpen }}>
      {children}
    </AccordionContext.Provider>
  );
};

export const useAccordion = () => {
  const context = useContext(AccordionContext);
  if (!context) {
    throw new Error("useAccordion must be used within an AccordionProvider");
  }
  return context;
};
