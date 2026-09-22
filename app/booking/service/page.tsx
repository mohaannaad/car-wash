"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useBooking } from "../../context/BookingContext";

const services = [
  {
    id: "external",
    name: "غسيل خارجي",
    description: "تنظيف شامل لهيكل السيارة وإزالة الأوساخ للحصول على مظهر نظيف ولامع",
    duration: "30 دقيقة",
    price: 50,
    badge: null,
    icon: (color: string) => (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 13l2-5a3 3 0 0 1 2.8-2h8.4A3 3 0 0 1 19 8l2 5" />
        <path d="M3 13h18v4a1 1 0 0 1-1 1h-1.2a1 1 0 0 1-1-.8L17.5 16h-11l-.3 1.2a1 1 0 0 1-1 .8H4a1 1 0 0 1-1-1z" />
        <circle cx="7.5" cy="16.5" r="1.4" />
        <circle cx="16.5" cy="16.5" r="1.4" />
        <path d="M2 10l1.5 1M22 10l-1.5 1" />
      </svg>
    ),
  },
  {
    id: "internal",
    name: "غسيل داخلي",
    description: "تنظيف وعناية متكاملة للمقصورة والمقاعد لإطلالة داخلية منعشة ونظيفة",
    duration: "30 دقيقة",
    price: 80,
    badge: null,
    icon: (color: string) => (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 19v-6a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v6" />
        <path d="M4 19h16" />
        <path d="M6 13V8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v5" />
        <path d="M4 19v1.5M20 19v1.5" />
      </svg>
    ),
  },
  {
    id: "full",
    name: "غسيل كامل",
    description: "تجربة تنظيف متكاملة تجمع بين نظافة السيارة من الداخل ولمعانها من الخارج",
    duration: "45 دقيقة",
    price: 120,
    badge: "الأكثر طلبًا",
    icon: (color: string) => (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 17a7 7 0 0 1 14 0" />
        <path d="M3 17h18" />
        <path d="M7 17l1-6h8l1 6" />
        <path d="M12 4v3M8.5 5l1 2.5M15.5 5l-1 2.5" />
      </svg>
    ),
  },
];

export default function ServiceStep() {
  const router = useRouter();
  const { setService } = useBooking();
  const [selectedService, setSelectedService] = useState<string | null>(null);

  const selected = services.find((s) => s.id === selectedService);

  const handleNext = () => {
    if (!selectedService) return;
    setService(selectedService);
    router.push("/booking/extras");
  };

  return (
    <main className="min-h-dvh flex flex-col bg-bg-page">
      {/* العنوان */}
      <div className="px-6 pt-8 pb-5 flex flex-col gap-1">
        <h1 className="text-text-main text-2xl font-extrabold">اختر خدمة الغسيل</h1>
        <p className="text-text-secondary text-sm">اختر الباقة اللي تناسب سيارتك، وإحنا هنتولى الباقي</p>
      </div>

      {/* قائمة الخدمات */}
      <div className="flex-1 flex flex-col gap-3.5 px-5">
        {services.map((service) => {
          const isSelected = selectedService === service.id;
          return (
            <button
              key={service.id}
              onClick={() => setSelectedService(service.id)}
              className={`relative flex items-start gap-3.5 rounded-2xl bg-white p-4 text-right transition-all ${
                isSelected
                  ? "border-[1.5px] border-primary shadow-[0_6px_18px_rgba(25,185,198,0.16)]"
                  : "border-[1.5px] border-transparent shadow-[0_2px_10px_rgba(16,24,40,0.05)]"
              }`}
            >
              {/* علامة الصح لما يكون محدد */}
              {isSelected && (
                <span className="absolute top-3.5 left-3.5 w-5.5 h-5.5 rounded-full bg-primary flex items-center justify-center">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </span>
              )}

              {/* دايرة الأيقونة */}
              <div
                className={`shrink-0 w-13 h-13 rounded-2xl flex items-center justify-center ${
                  isSelected ? "bg-primary" : "bg-primary-light"
                }`}
              >
                {service.icon(isSelected ? "#FFFFFF" : "#19B9C6")}
              </div>

              {/* النصوص */}
              <div className={`flex-1 flex flex-col gap-1.5 ${isSelected ? "pl-6" : ""}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-base font-bold ${isSelected ? "text-primary" : "text-text-main"}`}>
                      {service.name}
                    </span>
                    {service.badge && (
                      <span className="text-[10px] font-bold text-primary bg-primary-light px-2 py-0.5 rounded-full">
                        {service.badge}
                      </span>
                    )}
                  </div>
                  <span className="text-[15px] font-extrabold text-primary">{service.price} ر.س</span>
                </div>

                <p className="text-text-secondary text-[13px] leading-relaxed">
                  {service.description}
                </p>

                <div className="flex items-center gap-1.5 mt-0.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={isSelected ? "#19B9C6" : "#98A2B3"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v5l3 3" />
                  </svg>
                  <span className={`text-xs font-medium ${isSelected ? "text-primary" : "text-[#98A2B3]"}`}>
                    {service.duration}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* زرار التالي */}
      <div className="px-5 pt-4 pb-8">
        <button
          onClick={handleNext}
          disabled={!selectedService}
          className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-white transition-colors ${
            selectedService
              ? "bg-primary shadow-[0_8px_20px_rgba(25,185,198,0.35)]"
              : "bg-disabled cursor-not-allowed"
          }`}
        >
          <span>التالي</span>
          {selected && (
            <span className="text-[13px] font-semibold opacity-85">· {selected.price} ر.س</span>
          )}
        </button>
      </div>
    </main>
  );
}