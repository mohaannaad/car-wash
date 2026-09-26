"use client";

import Link from "next/link";
import { useSubscription } from "../../context/SubscriptionContext";

const monthNames = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

function formatDate(key: string) {
  const d = new Date(key);
  return `${d.getDate()} ${monthNames[d.getMonth()]}`;
}

export default function SubscriptionConfirmationPage() {
  const { subscription } = useSubscription();

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
          اشتراكك في <span className="font-bold text-text-main">{subscription.package?.name || "-"}</span> شغال دلوقتي
        </p>
      </div>

      <div className="w-full bg-white rounded-2xl p-5 flex flex-col gap-3 shadow-[0_2px_10px_rgba(16,24,40,0.05)] overflow-y-auto">
        <span className="text-text-main text-sm font-bold">مواعيد الغسيل هذا الشهر</span>
        <div className="flex flex-wrap gap-2 justify-center">
          {subscription.scheduleDates.map((date) => (
            <span key={date} className="bg-primary-light text-primary text-xs font-bold px-3 py-1.5 rounded-full">{formatDate(date)}</span>
          ))}
        </div>
      </div>

      <Link href="/" className="w-full max-w-sm mt-4 flex items-center justify-center py-4 rounded-2xl font-bold text-white bg-primary shadow-[0_8px_20px_rgba(25,185,198,0.35)] shrink-0">
        العودة للرئيسية
      </Link>
    </main>
  );
}