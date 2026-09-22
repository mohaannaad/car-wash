"use client";

import { useRouter } from "next/navigation";
import { useBooking } from "../../context/BookingContext";

const extrasList = [
  {
    id: "perfume",
    name: "تعطير السيارة",
    description: "رائحة منعشة تدوم لفترة أطول داخل السيارة",
    price: 15,
    icon: (color: string) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 3h6v3.5a1 1 0 0 0 .3.7l1.4 1.4a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H8.7a2 2 0 0 1-2-2V9.8a2 2 0 0 1 .6-1.4l1.4-1.4a1 1 0 0 0 .3-.7z" />
        <path d="M9 3V2M13 3V2" />
        <path d="M6.7 13h10.6" />
      </svg>
    ),
  },
  {
    id: "tires",
    name: "تلميع الإطارات",
    description: "لمعة داكنة تحمي الإطارات وتديها مظهر جديد",
    price: 20,
    icon: (color: string) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="3.5" />
        <path d="M12 3v2M12 19v2M21 12h-2M5 12H3M18.4 5.6l-1.4 1.4M7 15.6l-1.4 1.4M18.4 18.4l-1.4-1.4M7 8.4L5.6 7" />
      </svg>
    ),
  },
  {
    id: "interior-polish",
    name: "تلميع الدواخل",
    description: "عناية بالجلد أو القماش وحماية من التشقق والبهتان",
    price: 25,
    icon: (color: string) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 20v-5a5 5 0 0 1 5-5h6a5 5 0 0 1 5 5v5" />
        <path d="M8 10V7a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v3" />
        <path d="M4 20h16" />
      </svg>
    ),
  },
  {
    id: "engine",
    name: "غسيل المحرك",
    description: "تنظيف غرفة المحرك من الأتربة والشحوم المتراكمة",
    price: 40,
    icon: (color: string) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="8" width="16" height="9" rx="1.5" />
        <path d="M8 8V5.5a1.5 1.5 0 0 1 1.5-1.5h5A1.5 1.5 0 0 1 15 5.5V8" />
        <path d="M7 12h3M13 12h4M7 15h10" />
      </svg>
    ),
  },
  {
    id: "ozone",
    name: "إزالة الروائح (أوزون)",
    description: "تعقيم شامل وإزالة الروائح الكريهة من المقصورة بالكامل",
    price: 30,
    icon: (color: string) => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3a6 6 0 0 0 0 12 6 6 0 0 1 0 6" />
        <circle cx="12" cy="9" r="1.2" fill={color} stroke="none" />
        <circle cx="12" cy="21" r="1.2" fill={color} stroke="none" />
      </svg>
    ),
  },
];

export default function ExtrasStep() {
  const router = useRouter();
  const { booking, toggleExtra } = useBooking();

  const total = extrasList
    .filter((item) => booking.extras.includes(item.id))
    .reduce((sum, item) => sum + item.price, 0);

  const handleNext = () => {
    router.push("/booking/location");
  };

  return (
    <main className="min-h-dvh flex flex-col bg-bg-page">
      {/* العنوان */}
      <div className="px-6 pt-8 pb-5 flex flex-col gap-1">
        <h1 className="text-text-main text-2xl font-extrabold">خدمات إضافية</h1>
        <p className="text-text-secondary text-sm">اختر أي خدمات إضافية حابب تضيفها لطلبك (اختياري)</p>
      </div>

      {/* قائمة الخدمات الإضافية */}
      <div className="flex-1 flex flex-col gap-3.5 px-5">
        {extrasList.map((item) => {
          const isSelected = booking.extras.includes(item.id);
          return (
            <button
              key={item.id}
              onClick={() => toggleExtra(item.id)}
              className={`relative flex items-center gap-3.5 rounded-2xl bg-white p-4 text-right transition-all ${
                isSelected
                  ? "border-[1.5px] border-primary shadow-[0_6px_18px_rgba(25,185,198,0.16)]"
                  : "border-[1.5px] border-transparent shadow-[0_2px_10px_rgba(16,24,40,0.05)]"
              }`}
            >
              {/* دايرة الأيقونة */}
              <div
                className={`shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center ${
                  isSelected ? "bg-primary" : "bg-primary-light"
                }`}
              >
                {item.icon(isSelected ? "#FFFFFF" : "#19B9C6")}
              </div>

              {/* النصوص */}
              <div className="flex-1 flex flex-col gap-1">
                <span className={`text-[15px] font-bold ${isSelected ? "text-primary" : "text-text-main"}`}>
                  {item.name}
                </span>
                <p className="text-text-secondary text-xs leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* السعر + مربع الاختيار */}
              <div className="flex flex-col items-center gap-2 shrink-0">
                <span className={`text-sm font-extrabold ${isSelected ? "text-primary" : "text-text-main"}`}>
                  {item.price} ر.س
                </span>
                <span
                  className={`w-5 h-5 rounded-md flex items-center justify-center border-[1.5px] ${
                    isSelected ? "bg-primary border-primary" : "border-disabled"
                  }`}
                >
                  {isSelected && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  )}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* زرار التالي */}
      <div className="px-5 pt-4 pb-8">
        <button
          onClick={handleNext}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-white bg-primary shadow-[0_8px_20px_rgba(25,185,198,0.35)] transition-colors"
        >
          <span>التالي</span>
          {total > 0 && (
            <span className="text-[13px] font-semibold opacity-85">· {total} ر.س</span>
          )}
        </button>
      </div>
    </main>
  );
}