"use client";

import { Suspense, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toPng } from "html-to-image";
import { useSubscription } from "../../context/SubscriptionContext";

const monthNames = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

function formatDate(key: string) {
  const d = new Date(key);
  return `${d.getDate()} ${monthNames[d.getMonth()]}`;
}

function ConfirmationContent() {
  const { subscription } = useSubscription();
  const searchParams = useSearchParams();
  const subscriptionId = searchParams.get("subscriptionId");
  const cardRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setDownloading(true);
    setError("");
    try {
      const dataUrl = await toPng(cardRef.current, {
        backgroundColor: "#FFFFFF",
        pixelRatio: 2,
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

  return (
    <main className="h-dvh flex flex-col items-center bg-bg-page overflow-hidden px-6 pt-16 pb-10 gap-6 text-center">
      <div className="w-24 h-24 rounded-full bg-primary-light flex items-center justify-center shrink-0">
        <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
      </div>

      <div className="flex flex-col gap-2 shrink-0">
        <h1 className="text-text-main text-2xl font-extrabold">تم تفعيل اشتراكك بنجاح</h1>
        <p className="text-text-secondary text-sm">
          اشتراكك في <span className="font-bold text-text-main">{subscription.package?.name || "-"}</span> نشط الآن
        </p>
      </div>

      {/* الكارت اللي هيتحول لصورة */}
      <div ref={cardRef} className="w-full bg-white rounded-2xl p-5 flex flex-col gap-3 shadow-[0_2px_10px_rgba(16,24,40,0.05)] overflow-y-auto">
        <div className="flex items-center gap-2 justify-center">
          <span className="text-text-main text-sm font-extrabold">غسلة ولمعة</span>
        </div>
        <span className="text-text-main text-sm font-bold">مواعيد الغسيل هذا الشهر</span>
        <div className="flex flex-wrap gap-2 justify-center">
          {subscription.scheduleDates.map((date) => (
            <span key={date} className="bg-primary-light text-primary text-xs font-bold px-3 py-1.5 rounded-full">{formatDate(date)}</span>
          ))}
        </div>
      </div>

      {error && <p className="text-red-500 text-xs font-medium">{error}</p>}

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

      <Link href="/" className="w-full flex items-center justify-center py-4 rounded-2xl font-bold text-white bg-primary shadow-[0_8px_20px_rgba(25,185,198,0.35)] shrink-0">
        العودة للرئيسية
      </Link>
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