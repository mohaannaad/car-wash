"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type BookingData = {
  carType: string | null;
  service: string | null;
  extras: string[];
};

type BookingContextType = {
  booking: BookingData;
  setCarType: (value: string) => void;
  setService: (value: string) => void;
  toggleExtra: (value: string) => void;
};

const BookingContext = createContext<BookingContextType | undefined>(
  undefined
);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [booking, setBooking] = useState<BookingData>({
    carType: null,
    service: null,
    extras: [],
  });

  const setCarType = (value: string) => {
    setBooking((prev) => ({ ...prev, carType: value }));
  };

  const setService = (value: string) => {
    setBooking((prev) => ({ ...prev, service: value }));
  };

  const toggleExtra = (value: string) => {
    setBooking((prev) => ({
      ...prev,
      extras: prev.extras.includes(value)
        ? prev.extras.filter((item) => item !== value)
        : [...prev.extras, value],
    }));
  };

  return (
    <BookingContext.Provider
      value={{ booking, setCarType, setService, toggleExtra }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error("useBooking لازم يتستخدم جوه BookingProvider");
  }
  return context;
}