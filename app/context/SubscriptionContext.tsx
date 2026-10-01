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

type Appointment = {
  date: string;
  time: string;
};

type SubscriptionData = {
  package: PackageData;
  appointments: Appointment[];
  customer: CustomerData;
};

type SubscriptionContextType = {
  subscription: SubscriptionData;
  setPackage: (pkg: PackageData) => void;
  setAppointments: (appointments: Appointment[]) => void;
  setCustomer: (customer: CustomerData) => void;
};

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [subscription, setSubscription] = useState<SubscriptionData>({
    package: null,
    appointments: [],
    customer: { name: "", phone: "" },
  });

  const setPackage = (pkg: PackageData) => {
    setSubscription((prev) => ({ ...prev, package: pkg, appointments: [] }));
  };

  const setAppointments = (appointments: Appointment[]) => {
    setSubscription((prev) => ({ ...prev, appointments }));
  };

  const setCustomer = (customer: CustomerData) => {
    setSubscription((prev) => ({ ...prev, customer }));
  };

  return (
    <SubscriptionContext.Provider value={{ subscription, setPackage, setAppointments, setCustomer }}>
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