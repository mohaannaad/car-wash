"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useBooking } from "../context/BookingContext";

type CarType = { id: string; name: string };

export default function CarTypeStep() {
  const router = useRouter();
  const { setCarType } = useBooking();

  const [carTypes, setCarTypes] = useState<CarType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/car-types")
      .then((res) => res.json())
      .then((data) => setCarTypes(data))
      .finally(() => setLoading(false));
  }, []);

  const handleNext = () => {
    const selected = carTypes.find((c) => c.id === selectedId);
    if (!selected) return;
    setCarType(selected);
    router.push("/booking/service");
  };

  return (
    <main className="h-dvh flex flex-col bg-bg-page overflow-hidden">
      <div className="px-6 pt-8 pb-5 flex flex-col gap-1 shrink-0">
        <h1 className="text-text-main text-2xl font-extrabold">نوع السيارة</h1>
        <p className="text-text-secondary text-sm">قم باختيار نوع سيارتك</p>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto grid grid-cols-2 gap-3.5 px-5">
        {loading ? (
          <p className="col-span-2 text-center text-text-secondary text-sm py-8">جاري التحميل...</p>
        ) : carTypes.length === 0 ? (
          <p className="col-span-2 text-center text-text-secondary text-sm py-8">لا توجد أنواع سيارات متاحة حاليًا</p>
        ) : (
          carTypes.map((car) => {
            const isSelected = selectedId === car.id;
            return (
              <button
                key={car.id}
                onClick={() => setSelectedId(car.id)}
                className={`relative flex flex-col items-center justify-center gap-3 rounded-2xl bg-white p-6 transition-all ${
                  isSelected
                    ? "border-[1.5px] border-primary shadow-[0_6px_18px_rgba(25,185,198,0.16)]"
                    : "border-[1.5px] border-transparent shadow-[0_2px_10px_rgba(16,24,40,0.05)]"
                }`}
              >
                {isSelected && (
                  <span className="absolute top-3 left-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </span>
                )}
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isSelected ? "bg-primary" : "bg-primary-light"}`}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={isSelected ? "#FFFFFF" : "#19B9C6"} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 15.5V12l1.6-4a2 2 0 0 1 1.9-1.3h9a2 2 0 0 1 1.9 1.3l1.6 4v3.5" />
                    <path d="M1.5 15.5h21" />
                    <circle cx="7" cy="16" r="1.5" />
                    <circle cx="17" cy="16" r="1.5" />
                  </svg>
                </div>
                <span className={`font-bold text-base ${isSelected ? "text-primary" : "text-text-main"}`}>{car.name}</span>
              </button>
            );
          })
        )}
      </div>

      <div className="px-5 pt-4 pb-8 shrink-0">
        <button
          onClick={handleNext}
          disabled={!selectedId}
          className={`w-full py-4 rounded-2xl font-bold text-white transition-colors ${
            selectedId ? "bg-primary shadow-[0_8px_20px_rgba(25,185,198,0.35)]" : "bg-disabled cursor-not-allowed"
          }`}
        >
          التالي
        </button>
      </div>
    </main>
  );
}