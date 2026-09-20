"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type LocationData = {
  lat: number;
  lng: number;
  address: string;
} | null;

type BookingData = {
  carType: string | null;
  service: string | null;
  extras: string[];
  location: LocationData;
  date: string | null;
  time: string | null;
};

type BookingContextType = {
  booking: BookingData;
  setCarType: (value: string) => void;
  setService: (value: string) => void;
  toggleExtra: (value: string) => void;
  setLocation: (value: LocationData) => void;
  setDate: (value: string) => void;
  setTime: (value: string) => void;
};

const BookingContext = createContext<BookingContextType | undefined>(
  undefined
);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [booking, setBooking] = useState<BookingData>({
    carType: null,
    service: null,
    extras: [],
    location: null,
    date: null,
    time: null,
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

  const setLocation = (value: LocationData) => {
    setBooking((prev) => ({ ...prev, location: value }));
  };

  const setDate = (value: string) => {
    setBooking((prev) => ({ ...prev, date: value }));
  };

  const setTime = (value: string) => {
    setBooking((prev) => ({ ...prev, time: value }));
  };

  return (
    <BookingContext.Provider
      value={{
        booking,
        setCarType,
        setService,
        toggleExtra,
        setLocation,
        setDate,
        setTime,
      }}
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