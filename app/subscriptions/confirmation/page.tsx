"use client";

import { Suspense, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toPng } from "html-to-image";
import { useSubscription } from "../../context/SubscriptionContext";

const dayNames = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
const monthNames = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

function formatFull(dateKey: string) {
  const d = new Date(dateKey);
  return { dayName: dayNames[d.getDay()], dateLabel: `${d.getDate()} ${monthNames[d.getMonth()]}` };
}

function ConfirmationContent() {
  const router = useRouter();
  const { subscription, resetSubscription } = useSubscription();
  const searchParams = useSearchParams();
  const subscriptionId = searchParams.get("subscriptionId");
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");

  const sortedAppointments = [...subscription.appointments].sort((a, b) => a.date.localeCompare(b.date));

   const handleDownload = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    setError("");
    try {
      const element = cardRef.current;
      // بنصور العنصر بطول محتواه الحقيقي كامل، مش بس المساحة الظاهرة على الشاشة
      const dataUrl = await toPng(element, {
        backgroundColor: "#FFFFFF",
        pixelRatio: 2,
        width: element.scrollWidth,
        height: element.scrollHeight,
        style: {
          height: `${element.scrollHeight}px`,
          overflow: "visible",
        },
      });
      const link = document.createElement("a");
      link.download = `مواعيد-الاشتراك-${subscriptionId?.slice(-6) || "غسلة-ولمعة"}.png`;
      link.href = dataUrl;
      link.click();
    } catch {
      setError("تعذّر إنشاء الصورة، حاول مرة أخرى");
    } finally {
      setDownloading(false);
    }
  };

  const handleBackHome = () => {
    resetSubscription();
    router.push("/");
  };

  return (
    <main className="h-dvh flex flex-col items-center bg-bg-page overflow-hidden px-6 pt-12 pb-10 gap-5 text-center">
      <div className="w-20 h-20 rounded-full bg-primary-light flex items-center justify-center shrink-0">
        <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
      </div>

      <div className="flex flex-col gap-1 shrink-0">
        <h1 className="text-text-main text-xl font-extrabold">تم تفعيل اشتراكك بنجاح</h1>
        <p className="text-text-secondary text-sm">
          اشتراكك في <span className="font-bold text-text-main">{subscription.package?.name || "-"}</span> نشط الآن
        </p>
      </div>

      <div ref={cardRef} className="w-full bg-white rounded-2xl overflow-hidden shadow-[0_2px_10px_rgba(16,24,40,0.05)] flex-1 min-h-0 flex flex-col overflow-y-auto">
        <div className="bg-primary px-5 py-4 flex items-center justify-center gap-2">
          <span className="text-white text-base font-extrabold">غسلة ولمعة</span>
        </div>

        <div className="p-5 flex flex-col gap-4 overflow-y-auto">
          <div className="flex flex-col gap-1">
            <span className="text-text-secondary text-xs">الباقة</span>
            <span className="text-text-main text-base font-extrabold">{subscription.package?.name}</span>
          </div>

          <div className="h-px bg-[#EEF2F3]" />

          <div className="flex flex-col gap-3">
            <span className="text-text-main text-sm font-bold text-right">مواعيد الغسيل ({sortedAppointments.length})</span>
            {sortedAppointments.map((a, index) => {
              const { dayName, dateLabel } = formatFull(a.date);
              return (
                <div key={a.date} className="flex items-center gap-3 bg-[#F4F7F8] rounded-2xl px-4 py-3">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-extrabold shrink-0">
                    {index + 1}
                  </div>
                  <div className="flex-1 flex flex-col text-right">
                    <span className="text-text-main text-sm font-bold">{dayName}</span>
                    <span className="text-text-secondary text-xs">{dateLabel}</span>
                  </div>
                  <span className="text-primary text-sm font-extrabold">{a.time}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {error && <p className="text-red-500 text-xs font-medium shrink-0">{error}</p>}

      <button
        onClick={handleDownload}
        disabled={downloading}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-primary bg-primary-light text-sm disabled:opacity-60 shrink-0"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
        </svg>
        {downloading ? "جارٍ التحميل..." : "تحميل المواعيد كصورة"}
      </button>

      <button
        onClick={handleBackHome}
        className="w-full flex items-center justify-center py-4 rounded-2xl font-bold text-white bg-primary shadow-[0_8px_20px_rgba(25,185,198,0.35)] shrink-0"
      >
        العودة للرئيسية
      </button>
    </main>
  );
}

export default function SubscriptionConfirmationPage() {
  return (
    <Suspense fallback={<div className="h-dvh flex items-center justify-center bg-bg-page"><p className="text-text-secondary">جارٍ التحميل...</p></div>}>
      <ConfirmationContent />
    </Suspense>
  );
}