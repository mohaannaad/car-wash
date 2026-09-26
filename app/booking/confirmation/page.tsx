"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useBooking } from "../../context/BookingContext";

function ConfirmationContent() {
  const { booking } = useBooking();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  return (
    <main className="h-dvh flex flex-col items-center justify-center bg-bg-page overflow-hidden px-6 text-center gap-6">
      <div className="w-24 h-24 rounded-full bg-primary-light flex items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="text-text-main text-2xl font-extrabold">تم إرسال طلبك بنجاح</h1>
        <p className="text-text-secondary text-sm leading-relaxed max-w-xs">
          فريقنا هيتواصل معاك على الرقم{" "}
          <span className="font-bold text-text-main" dir="ltr">{booking.customer.phone || "المسجل"}</span>{" "}
          لتأكيد الموعد
        </p>
      </div>

      {orderId && (
        <div className="bg-white rounded-2xl px-6 py-4 shadow-[0_2px_10px_rgba(16,24,40,0.05)] flex flex-col gap-1">
          <span className="text-text-secondary text-xs">رقم الطلب</span>
          <span className="text-primary text-lg font-extrabold" dir="ltr">#{orderId.slice(-6).toUpperCase()}</span>
        </div>
      )}

      <Link href="/" className="w-full max-w-sm mt-4 flex items-center justify-center py-4 rounded-2xl font-bold text-white bg-primary shadow-[0_8px_20px_rgba(25,185,198,0.35)]">
        العودة للرئيسية
      </Link>
    </main>
  );
}

export default function ConfirmationStep() {
  return (
    <Suspense fallback={<div className="h-dvh flex items-center justify-center bg-bg-page"><p className="text-text-secondary">جاري التحميل...</p></div>}>
      <ConfirmationContent />
    </Suspense>
  );
}