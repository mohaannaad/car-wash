"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";

type LocationData = {
  lat: number;
  lng: number;
  address: string;
} | null;

type CarTypeData = { id: string; name: string } | null;
type ServiceData = { id: string; name: string; price: number } | null;
type ExtraData = { id: string; name: string; price: number };
type AreaData = { cityId: string; cityName: string; districtId: string; districtName: string } | null;

type CustomerData = {
  name: string;
  phone: string;
  plate: string;
};

type BookingData = {
  carType: CarTypeData;
  service: ServiceData;
  extras: ExtraData[];
  area: AreaData;
  location: LocationData;
  date: string | null;
  time: string | null;
  customer: CustomerData;
};

const emptyBooking: BookingData = {
  carType: null,
  service: null,
  extras: [],
  area: null,
  location: null,
  date: null,
  time: null,
  customer: { name: "", phone: "", plate: "" },
};

const STORAGE_KEY = "carwash_booking_state";

type BookingContextType = {
  booking: BookingData;
  setCarType: (value: CarTypeData) => void;
  setService: (value: ServiceData) => void;
  toggleExtra: (value: ExtraData) => void;
  setArea: (value: AreaData) => void;
  setLocation: (value: LocationData) => void;
  setDate: (value: string) => void;
  setTime: (value: string) => void;
  setCustomer: (value: CustomerData) => void;
  resetBooking: () => void;
};

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [booking, setBooking] = useState<BookingData>(emptyBooking);
  const [hydrated, setHydrated] = useState(false);

  // أول ما الصفحة تفتح، نجيب أي بيانات محفوظة من قبل (لو المستخدم كان في نص رحلة الحجز)
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        setBooking(JSON.parse(saved));
      }
    } catch {
      // لو حصلت أي مشكلة في القراءة، نكمل بالقيم الفاضية العادية
    } finally {
      setHydrated(true);
    }
  }, []);

  // كل مرة البيانات تتغير، نحفظها فورًا
  useEffect(() => {
    if (!hydrated) return;
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(booking));
    } catch {
      // تجاهل لو التخزين مش متاح
    }
  }, [booking, hydrated]);

  const setCarType = (value: CarTypeData) => setBooking((prev) => ({ ...prev, carType: value }));
  const setService = (value: ServiceData) => setBooking((prev) => ({ ...prev, service: value }));
  const toggleExtra = (value: ExtraData) =>
    setBooking((prev) => ({
      ...prev,
      extras: prev.extras.some((e) => e.id === value.id)
        ? prev.extras.filter((e) => e.id !== value.id)
        : [...prev.extras, value],
    }));
  const setArea = (value: AreaData) => setBooking((prev) => ({ ...prev, area: value }));
  const setLocation = (value: LocationData) => setBooking((prev) => ({ ...prev, location: value }));
  const setDate = (value: string) => setBooking((prev) => ({ ...prev, date: value }));
  const setTime = (value: string) => setBooking((prev) => ({ ...prev, time: value }));
  const setCustomer = (value: CustomerData) => setBooking((prev) => ({ ...prev, customer: value }));

  const resetBooking = () => {
    setBooking(emptyBooking);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // تجاهل
    }
  };

  return (
    <BookingContext.Provider
      value={{ booking, setCarType, setService, toggleExtra, setArea, setLocation, setDate, setTime, setCustomer, resetBooking }}
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