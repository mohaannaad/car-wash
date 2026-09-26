"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useBooking } from "../../context/BookingContext";

type Service = {
  id: string;
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
};

export default function ServiceStep() {
  const router = useRouter();
  const { setService } = useBooking();

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/services")
      .then((res) => res.json())
      .then((data) => setServices(data))
      .finally(() => setLoading(false));
  }, []);

  const selected = services.find((s) => s.id === selectedId);

  const handleNext = () => {
    if (!selected) return;
    setService({ id: selected.id, name: selected.name, price: selected.price });
    router.push("/booking/extras");
  };

  return (
    <main className="h-dvh flex flex-col bg-bg-page overflow-hidden">
      <div className="px-6 pt-8 pb-5 flex flex-col gap-1 shrink-0">
        <h1 className="text-text-main text-2xl font-extrabold">اختر خدمة الغسيل</h1>
        <p className="text-text-secondary text-sm">اختر الباقة اللي تناسب سيارتك، وإحنا هنتولى الباقي</p>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-3.5 px-5">
        {loading ? (
          <p className="text-center text-text-secondary text-sm py-8">جاري التحميل...</p>
        ) : services.length === 0 ? (
          <p className="text-center text-text-secondary text-sm py-8">لا توجد خدمات متاحة حاليًا</p>
        ) : (
          services.map((service) => {
            const isSelected = selectedId === service.id;
            return (
              <button
                key={service.id}
                onClick={() => setSelectedId(service.id)}
                className={`relative flex items-start gap-3.5 rounded-2xl bg-white p-4 text-right transition-all ${
                  isSelected
                    ? "border-[1.5px] border-primary shadow-[0_6px_18px_rgba(25,185,198,0.16)]"
                    : "border-[1.5px] border-transparent shadow-[0_2px_10px_rgba(16,24,40,0.05)]"
                }`}
              >
                {isSelected && (
                  <span className="absolute top-3.5 left-3.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </span>
                )}
                <div className={`shrink-0 w-13 h-13 rounded-2xl flex items-center justify-center ${isSelected ? "bg-primary" : "bg-primary-light"}`}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={isSelected ? "#FFFFFF" : "#19B9C6"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 13l2-5a3 3 0 0 1 2.8-2h8.4A3 3 0 0 1 19 8l2 5" />
                    <path d="M3 13h18v4a1 1 0 0 1-1 1h-1.2a1 1 0 0 1-1-.8L17.5 16h-11l-.3 1.2a1 1 0 0 1-1 .8H4a1 1 0 0 1-1-1z" />
                    <circle cx="7.5" cy="16.5" r="1.4" />
                    <circle cx="16.5" cy="16.5" r="1.4" />
                  </svg>
                </div>
                <div className={`flex-1 flex flex-col gap-1.5 ${isSelected ? "pl-6" : ""}`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-base font-bold ${isSelected ? "text-primary" : "text-text-main"}`}>{service.name}</span>
                    <span className="text-[15px] font-extrabold text-primary">{service.price} ر.س</span>
                  </div>
                  <p className="text-text-secondary text-[13px] leading-relaxed">{service.description}</p>
                  <span className={`text-xs font-medium mt-0.5 ${isSelected ? "text-primary" : "text-[#98A2B3]"}`}>
                    {service.durationMinutes} دقيقة
                  </span>
                </div>
              </button>
            );
          })
        )}
      </div>

      <div className="px-5 pt-4 pb-8 shrink-0">
        <button
          onClick={handleNext}
          disabled={!selectedId}
          className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-white transition-colors ${
            selectedId ? "bg-primary shadow-[0_8px_20px_rgba(25,185,198,0.35)]" : "bg-disabled cursor-not-allowed"
          }`}
        >
          <span>التالي</span>
          {selected && <span className="text-[13px] font-semibold opacity-85">· {selected.price} ر.س</span>}
        </button>
      </div>
    </main>
  );
}