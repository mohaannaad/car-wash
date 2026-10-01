"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type PackageData = {
  id: string;
  name: string;
  washCount: number;
  serviceLabel: string;
  price: number;
} | null;

type Appointment = { date: string; time: string };
type AreaData = { cityId: string; cityName: string; districtId: string; districtName: string } | null;

type LocationData = {
  lat: number;
  lng: number;
  address: string;
} | null;

type CustomerData = {
  name: string;
  phone: string;
  plate: string;
};

type SubscriptionData = {
  package: PackageData;
  appointments: Appointment[];
  area: AreaData;
  location: LocationData;
  customer: CustomerData;
};

type SubscriptionContextType = {
  subscription: SubscriptionData;
  setPackage: (pkg: PackageData) => void;
  setAppointments: (appointments: Appointment[]) => void;
  setArea: (area: AreaData) => void;
  setLocation: (location: LocationData) => void;
  setCustomer: (customer: CustomerData) => void;
};

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [subscription, setSubscription] = useState<SubscriptionData>({
    package: null,
    appointments: [],
    area: null,
    location: null,
    customer: { name: "", phone: "", plate: "" },
  });

  const setPackage = (pkg: PackageData) => setSubscription((prev) => ({ ...prev, package: pkg, appointments: [] }));
  const setAppointments = (appointments: Appointment[]) => setSubscription((prev) => ({ ...prev, appointments }));
  const setArea = (area: AreaData) => setSubscription((prev) => ({ ...prev, area }));
  const setLocation = (location: LocationData) => setSubscription((prev) => ({ ...prev, location }));
  const setCustomer = (customer: CustomerData) => setSubscription((prev) => ({ ...prev, customer }));

  return (
    <SubscriptionContext.Provider value={{ subscription, setPackage, setAppointments, setArea, setLocation, setCustomer }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error("useSubscription لازم يتستخدم جوه SubscriptionProvider");
  }
  return context;
}