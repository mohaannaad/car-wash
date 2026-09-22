"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type SubscriptionData = {
  packageId: string | null;
  dayOfWeek: number | null;
  time: string | null;
  scheduleDates: string[];
};

type SubscriptionContextType = {
  subscription: SubscriptionData;
  setPackage: (id: string) => void;
  setSchedule: (dayOfWeek: number, time: string, dates: string[]) => void;
};

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(
  undefined
);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [subscription, setSubscription] = useState<SubscriptionData>({
    packageId: null,
    dayOfWeek: null,
    time: null,
    scheduleDates: [],
  });

  const setPackage = (id: string) => {
    setSubscription((prev) => ({ ...prev, packageId: id }));
  };

  const setSchedule = (dayOfWeek: number, time: string, dates: string[]) => {
    setSubscription((prev) => ({ ...prev, dayOfWeek, time, scheduleDates: dates }));
  };

  return (
    <SubscriptionContext.Provider value={{ subscription, setPackage, setSchedule }}>
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