"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useBooking } from "../context/BookingContext";

const carTypes = [
  { id: "suv", name: "دفع رباعي", image: "/images/cars/suv.png" },
  { id: "sedan", name: "سيدان", image: "/images/cars/sedan.png" },
  { id: "pickup", name: "بيك أب", image: "/images/cars/pickup.png" },
  { id: "van", name: "فان", image: "/images/cars/van.png" },
  { id: "sports", name: "رياضية", image: "/images/cars/sports.png" },
  { id: "hatchback", name: "هاتشباك", image: "/images/cars/hatchback.png" },
];

export default function CarTypeStep() {
  const router = useRouter();
  const { setCarType } = useBooking();
  const [selectedCar, setSelectedCar] = useState<string | null>(null);

  const handleNext = () => {
    if (!selectedCar) return;
    setCarType(selectedCar);
    router.push("/booking/service");
  };

  return (
    <main className="h-dvh flex flex-col bg-bg-page overflow-hidden">
      {/* العنوان */}
    <div className="px-6 pt-8 pb-5 flex flex-col gap-1 shrink-0">
        <h1 className="text-text-main text-2xl font-extrabold">نوع السيارة</h1>
        <p className="text-text-secondary text-sm">قم باختيار نوع سيارتك</p>
      </div>

      {/* شبكة الكروت */}
      <div className="flex-1 min-h-0 overflow-y-auto grid grid-cols-2 gap-3.5 px-5">
        {carTypes.map((car) => {
          const isSelected = selectedCar === car.id;
          return (
            <button
              key={car.id}
              onClick={() => setSelectedCar(car.id)}
              className={`relative flex flex-col items-center justify-center gap-3 rounded-2xl bg-white p-4 transition-all ${
                isSelected
                  ? "border-[1.5px] border-primary shadow-[0_6px_18px_rgba(25,185,198,0.16)]"
                  : "border-[1.5px] border-transparent shadow-[0_2px_10px_rgba(16,24,40,0.05)]"
              }`}
            >
              {/* علامة الصح لما يكون محدد */}
              {isSelected && (
                <span className="absolute top-3 left-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </span>
              )}

              <Image
                src={car.image}
                alt={car.name}
                width={120}
                height={80}
                className="h-auto w-auto max-w-[120px]"
              />
              <span
                className={`font-bold text-base ${
                  isSelected ? "text-primary" : "text-text-main"
                }`}
              >
                {car.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* زرار التالي */}
      <div className="px-5 pt-4 pb-8 shrink-0">
        <button
          onClick={handleNext}
          disabled={!selectedCar}
          className={`w-full flex items-center justify-center py-4 rounded-2xl font-bold text-white transition-colors ${
            selectedCar
              ? "bg-primary shadow-[0_8px_20px_rgba(25,185,198,0.35)]"
              : "bg-disabled cursor-not-allowed"
          }`}
        >
          التالي
        </button>
      </div>
    </main>
  );
}