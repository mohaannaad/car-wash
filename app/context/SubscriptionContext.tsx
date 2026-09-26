"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type PackageData = {
  id: string;
  name: string;
  washCount: number;
  serviceLabel: string;
  price: number;
} | null;

type CustomerData = {
  name: string;
  phone: string;
};

type SubscriptionData = {
  package: PackageData;
  dayOfWeek: number | null;
  time: string | null;
  scheduleDates: string[];
  customer: CustomerData;
};

type SubscriptionContextType = {
  subscription: SubscriptionData;
  setPackage: (pkg: PackageData) => void;
  setSchedule: (dayOfWeek: number, time: string, dates: string[]) => void;
  setCustomer: (customer: CustomerData) => void;
};

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [subscription, setSubscription] = useState<SubscriptionData>({
    package: null,
    dayOfWeek: null,
    time: null,
    scheduleDates: [],
    customer: { name: "", phone: "" },
  });

  const setPackage = (pkg: PackageData) => {
    setSubscription((prev) => ({ ...prev, package: pkg }));
  };

  const setSchedule = (dayOfWeek: number, time: string, dates: string[]) => {
    setSubscription((prev) => ({ ...prev, dayOfWeek, time, scheduleDates: dates }));
  };

  const setCustomer = (customer: CustomerData) => {
    setSubscription((prev) => ({ ...prev, customer }));
  };

  return (
    <SubscriptionContext.Provider value={{ subscription, setPackage, setSchedule, setCustomer }}>
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