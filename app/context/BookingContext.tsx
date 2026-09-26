"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type LocationData = {
  lat: number;
  lng: number;
  address: string;
} | null;

type CarTypeData = { id: string; name: string } | null;
type ServiceData = { id: string; name: string; price: number } | null;
type ExtraData = { id: string; name: string; price: number };

type CustomerData = {
  name: string;
  phone: string;
  plate: string;
};

type BookingData = {
  carType: CarTypeData;
  service: ServiceData;
  extras: ExtraData[];
  location: LocationData;
  date: string | null;
  time: string | null;
  customer: CustomerData;
};

type BookingContextType = {
  booking: BookingData;
  setCarType: (value: CarTypeData) => void;
  setService: (value: ServiceData) => void;
  toggleExtra: (value: ExtraData) => void;
  setLocation: (value: LocationData) => void;
  setDate: (value: string) => void;
  setTime: (value: string) => void;
  setCustomer: (value: CustomerData) => void;
};

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [booking, setBooking] = useState<BookingData>({
    carType: null,
    service: null,
    extras: [],
    location: null,
    date: null,
    time: null,
    customer: { name: "", phone: "", plate: "" },
  });

  const setCarType = (value: CarTypeData) => {
    setBooking((prev) => ({ ...prev, carType: value }));
  };

  const setService = (value: ServiceData) => {
    setBooking((prev) => ({ ...prev, service: value }));
  };

  const toggleExtra = (value: ExtraData) => {
    setBooking((prev) => ({
      ...prev,
      extras: prev.extras.some((e) => e.id === value.id)
        ? prev.extras.filter((e) => e.id !== value.id)
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

  const setCustomer = (value: CustomerData) => {
    setBooking((prev) => ({ ...prev, customer: value }));
  };

  return (
    <BookingContext.Provider
      value={{ booking, setCarType, setService, toggleExtra, setLocation, setDate, setTime, setCustomer }}
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