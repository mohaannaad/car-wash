"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";

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

const emptySubscription: SubscriptionData = {
  package: null,
  appointments: [],
  area: null,
  location: null,
  customer: { name: "", phone: "", plate: "" },
};

const STORAGE_KEY = "carwash_subscription_state";

type SubscriptionContextType = {
  subscription: SubscriptionData;
  setPackage: (pkg: PackageData) => void;
  setAppointments: (appointments: Appointment[]) => void;
  setArea: (area: AreaData) => void;
  setLocation: (location: LocationData) => void;
  setCustomer: (customer: CustomerData) => void;
  resetSubscription: () => void;
};

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [subscription, setSubscription] = useState<SubscriptionData>(emptySubscription);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        setSubscription(JSON.parse(saved));
      }
    } catch {
      // تجاهل
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(subscription));
    } catch {
      // تجاهل
    }
  }, [subscription, hydrated]);

  const setPackage = (pkg: PackageData) => setSubscription((prev) => ({ ...prev, package: pkg, appointments: [] }));
  const setAppointments = (appointments: Appointment[]) => setSubscription((prev) => ({ ...prev, appointments }));
  const setArea = (area: AreaData) => setSubscription((prev) => ({ ...prev, area }));
  const setLocation = (location: LocationData) => setSubscription((prev) => ({ ...prev, location }));
  const setCustomer = (customer: CustomerData) => setSubscription((prev) => ({ ...prev, customer }));

  const resetSubscription = () => {
    setSubscription(emptySubscription);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // تجاهل
    }
  };

  return (
    <SubscriptionContext.Provider
      value={{ subscription, setPackage, setAppointments, setArea, setLocation, setCustomer, resetSubscription }}
    >
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