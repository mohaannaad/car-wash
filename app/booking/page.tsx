"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

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
  const [selectedCar, setSelectedCar] = useState<string | null>(null);

  const handleNext = () => {
    if (!selectedCar) return;
    // هنبعت نوع السيارة للخطوة الجاية لاحقًا عبر Context
    router.push("/booking/service");
  };

  return (
    <main className="min-h-screen flex flex-col bg-bg-page px-6 pt-10 pb-6">
      {/* العنوان */}
      <div className="flex flex-col items-center text-center gap-1 mb-8">
        <h1 className="text-text-main text-2xl font-bold">نوع السيارة</h1>
        <p className="text-primary text-base">قم باختيار نوع سيارتك</p>
      </div>

      {/* شبكة الكروت */}
      <div className="grid grid-cols-2 gap-4 flex-1">
        {carTypes.map((car) => {
          const isSelected = selectedCar === car.id;
          return (
            <button
              key={car.id}
              onClick={() => setSelectedCar(car.id)}
             className={`flex flex-col items-center justify-center gap-3 rounded-2xl p-4 border-2 transition-colors ${
  isSelected
    ? "bg-[#DBEEF0] border-primary"
    : "bg-white border-transparent"
}`}
            >
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
      <button
        onClick={handleNext}
        disabled={!selectedCar}
        className={`w-full py-4 rounded-full font-bold text-white mt-8 transition-colors ${
          selectedCar ? "bg-primary" : "bg-disabled cursor-not-allowed"
        }`}
      >
        التالي
      </button>
    </main>
  );
}