"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type BookingData = {
  carType: string | null;
  service: string | null;
};

type BookingContextType = {
  booking: BookingData;
  setCarType: (value: string) => void;
  setService: (value: string) => void;
};

const BookingContext = createContext<BookingContextType | undefined>(
  undefined
);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [booking, setBooking] = useState<BookingData>({
    carType: null,
    service: null,
  });

  const setCarType = (value: string) => {
    setBooking((prev) => ({ ...prev, carType: value }));
  };

  const setService = (value: string) => {
    setBooking((prev) => ({ ...prev, service: value }));
  };

  return (
    <BookingContext.Provider value={{ booking, setCarType, setService }}>
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