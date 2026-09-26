"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useBooking } from "../../context/BookingContext";

function SummaryRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3.5">
      <div className="shrink-0 w-11 h-11 rounded-xl bg-primary-light flex items-center justify-center">{icon}</div>
      <div className="flex-1 flex flex-col gap-0.5">
        <span className="text-text-secondary text-xs">{label}</span>
        <span className="text-text-main text-sm font-bold">{value}</span>
      </div>
    </div>
  );
}

export default function SummaryStep() {
  const router = useRouter();
  const { booking } = useBooking();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const extrasTotal = booking.extras.reduce((sum, item) => sum + item.price, 0);
  const total = (booking.service?.price ?? 0) + extrasTotal;

  const handleConfirm = async () => {
    if (!booking.carType || !booking.service || !booking.location || !booking.date || !booking.time) {
      setError("في بيانات ناقصة في طلبك، ارجع للخطوات السابقة وتأكد منها");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          carTypeId: booking.carType.id,
          serviceId: booking.service.id,
          extras: booking.extras,
          plateNumber: booking.customer.plate,
          location: booking.location,
          date: booking.date,
          time: booking.time,
          customer: { name: booking.customer.name, phone: booking.customer.phone },
          totalPrice: total,
        }),
      });
      if (!res.ok) throw new Error();
      const order = await res.json();
      router.push(`/booking/confirmation?orderId=${order.id}`);
    } catch {
      setError("حصل خطأ في إرسال الطلب، حاول تاني");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="h-dvh flex flex-col bg-bg-page overflow-hidden">
      <div className="px-6 pt-8 pb-5 flex flex-col gap-1 shrink-0">
        <h1 className="text-text-main text-2xl font-extrabold">ملخص الطلب</h1>
        <p className="text-text-secondary text-sm">راجع تفاصيل طلبك قبل التأكيد</p>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-4 px-5">
        <div className="bg-white rounded-2xl p-4 flex flex-col gap-4 shadow-[0_2px_10px_rgba(16,24,40,0.05)]">
          <SummaryRow label="نوع السيارة" value={booking.carType?.name || "-"} icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#19B9C6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 15.5V12l1.6-4a2 2 0 0 1 1.9-1.3h9a2 2 0 0 1 1.9 1.3l1.6 4v3.5" /><path d="M1.5 15.5h21" /><circle cx="7" cy="16" r="1.5" /><circle cx="17" cy="16" r="1.5" /></svg>} />
          <SummaryRow label="رقم اللوحة" value={booking.customer.plate || "-"} icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#19B9C6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="7" width="18" height="10" rx="2" /><path d="M6.5 12h11M7.5 14.5h4" /></svg>} />
          <SummaryRow label="الموقع" value={booking.location?.address || "-"} icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#19B9C6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" /><circle cx="12" cy="10" r="3" /></svg>} />
          <SummaryRow label="الموعد" value={booking.date && booking.time ? `${booking.date} - ${booking.time}` : "-"} icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#19B9C6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" /></svg>} />
          <SummaryRow label="الاسم ورقم الجوال" value={`${booking.customer.name || "-"} · ${booking.customer.phone || "-"}`} icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#19B9C6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8" /></svg>} />
        </div>

        <div className="bg-white rounded-2xl p-4 flex flex-col gap-3 shadow-[0_2px_10px_rgba(16,24,40,0.05)]">
          <span className="text-text-main text-sm font-bold">الخدمات المطلوبة</span>
          {booking.service && (
            <div className="flex items-center justify-between">
              <span className="text-text-main text-sm">{booking.service.name}</span>
              <span className="text-text-main text-sm font-bold">{booking.service.price} ر.س</span>
            </div>
          )}
          {booking.extras.map((item) => (
            <div key={item.id} className="flex items-center justify-between">
              <span className="text-text-secondary text-sm">{item.name}</span>
              <span className="text-text-secondary text-sm font-bold">{item.price} ر.س</span>
            </div>
          ))}
          <div className="h-px bg-[#EEF2F3] my-1" />
          <div className="flex items-center justify-between">
            <span className="text-text-main text-base font-extrabold">الإجمالي</span>
            <span className="text-primary text-lg font-extrabold">{total} ر.س</span>
          </div>
        </div>

        {error && <p className="text-red-500 text-sm font-medium text-center">{error}</p>}
      </div>

      <div className="px-5 pt-4 pb-8 shrink-0">
        <button
          onClick={handleConfirm}
          disabled={submitting}
          className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-white transition-colors ${
            submitting ? "bg-disabled cursor-not-allowed" : "bg-primary shadow-[0_8px_20px_rgba(25,185,198,0.35)]"
          }`}
        >
          {submitting ? "جاري إرسال الطلب..." : "تأكيد وإرسال الطلب"}
        </button>
      </div>
    </main>
  );
}