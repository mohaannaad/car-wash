"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useBooking } from "../../context/BookingContext";

type Extra = {
  id: string;
  name: string;
  description: string;
  price: number;
};

export default function ExtrasStep() {
  const router = useRouter();
  const { booking, toggleExtra } = useBooking();

  const [extras, setExtras] = useState<Extra[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/extras")
      .then((res) => res.json())
      .then((data) => setExtras(data))
      .finally(() => setLoading(false));
  }, []);

  const total = booking.extras.reduce((sum, e) => sum + e.price, 0);
  const isSelected = (id: string) => booking.extras.some((e) => e.id === id);

  const handleNext = () => {
    router.push("/booking/location");
  };

  return (
    <main className="h-dvh flex flex-col bg-bg-page overflow-hidden">
      <div className="px-6 pt-8 pb-5 flex flex-col gap-1 shrink-0">
        <h1 className="text-text-main text-2xl font-extrabold">خدمات إضافية</h1>
        <p className="text-text-secondary text-sm">اختر أي خدمات إضافية حابب تضيفها لطلبك (اختياري)</p>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-3.5 px-5">
        {loading ? (
          <p className="text-center text-text-secondary text-sm py-8">جاري التحميل...</p>
        ) : extras.length === 0 ? (
          <p className="text-center text-text-secondary text-sm py-8">لا توجد خدمات إضافية متاحة حاليًا</p>
        ) : (
          extras.map((item) => {
            const selected = isSelected(item.id);
            return (
              <button
                key={item.id}
                onClick={() => toggleExtra({ id: item.id, name: item.name, price: item.price })}
                className={`relative flex items-center gap-3.5 rounded-2xl bg-white p-4 text-right transition-all ${
                  selected
                    ? "border-[1.5px] border-primary shadow-[0_6px_18px_rgba(25,185,198,0.16)]"
                    : "border-[1.5px] border-transparent shadow-[0_2px_10px_rgba(16,24,40,0.05)]"
                }`}
              >
                <div className={`shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center ${selected ? "bg-primary" : "bg-primary-light"}`}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={selected ? "#FFFFFF" : "#19B9C6"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </div>

                <div className="flex-1 flex flex-col gap-1">
                  <span className={`text-[15px] font-bold ${selected ? "text-primary" : "text-text-main"}`}>{item.name}</span>
                  {item.description && <p className="text-text-secondary text-xs leading-relaxed">{item.description}</p>}
                </div>

                <div className="flex flex-col items-center gap-2 shrink-0">
                  <span className={`text-sm font-extrabold ${selected ? "text-primary" : "text-text-main"}`}>{item.price} ر.س</span>
                  <span className={`w-5 h-5 rounded-md flex items-center justify-center border-[1.5px] ${selected ? "bg-primary border-primary" : "border-disabled"}`}>
                    {selected && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    )}
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
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-white bg-primary shadow-[0_8px_20px_rgba(25,185,198,0.35)] transition-colors"
        >
          <span>التالي</span>
          {total > 0 && <span className="text-[13px] font-semibold opacity-85">· {total} ر.س</span>}
        </button>
      </div>
    </main>
  );
}