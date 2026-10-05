"use client";

import { useState } from "react";

type When = "past" | "today" | "upcoming";

type Props = {
  kind: "order" | "wash";
  id: string;
  status: string;
  customerCalledAt: string | null;
  phone: string;
  when: When;
  scheduledDate: string;
  onChanged: () => void | Promise<void>;
};

const nextStatusMap: Record<string, string | null> = {
  PENDING: "CONFIRMED",
  CONFIRMED: "ON_THE_WAY",
  ON_THE_WAY: "IN_PROGRESS",
  IN_PROGRESS: "COMPLETED",
  COMPLETED: null,
  CANCELLED: null,
};

const actionLabels: Record<string, string> = {
  CONFIRMED: "تأكيد استلام الطلب",
  ON_THE_WAY: "أنا في الطريق للعميل",
  IN_PROGRESS: "بدء التنفيذ",
  COMPLETED: "تم التنفيذ",
};

const paymentOptions = [
  { value: "CASH", label: "كاش" },
  { value: "TRANSFER", label: "تحويل" },
  { value: "CARD", label: "فيزا" },
];

export const paymentLabels: Record<string, string> = {
  CASH: "كاش",
  TRANSFER: "تحويل",
  CARD: "فيزا",
};

export function canCall(phone: string) {
  return /\d/.test(phone);
}

function PhoneIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

// أيقونة اتصال صغيرة ثابتة في الكارت
export function CallIconButton({ phone }: { phone: string }) {
  if (!canCall(phone)) return null;
  return (
    <a
      href={`tel:${phone}`}
      title="اتصال بالعميل"
      className="w-9 h-9 rounded-full bg-primary-light text-primary flex items-center justify-center shrink-0"
    >
      <PhoneIcon size={16} />
    </a>
  );
}

export default function TaskActions({
  kind,
  id,
  status,
  customerCalledAt,
  phone,
  when,
  scheduledDate,
  onChanged,
}: Props) {
  const [busy, setBusy] = useState(false);
  const [payment, setPayment] = useState<string | null>(null);

  const endpoint =
    kind === "order" ? `/api/staff/orders/${id}` : `/api/staff/subscription-washes/${id}`;

  const send = async (body: Record<string, unknown>) => {
    setBusy(true);
    try {
      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        keepalive: true,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "حصل خطأ، حاول مرة تانية");
      }
    } catch {
      alert("تعذر الاتصال بالسيرفر، تأكد من الإنترنت");
    } finally {
      setBusy(false);
      await onChanged();
    }
  };

  if (status === "COMPLETED" || status === "CANCELLED") return null;

  // طلب في يوم لاحق: مقفول
  if (when === "upcoming") {
    return (
      <div className="w-full py-2.5 rounded-xl bg-[#F4F7F8] text-text-secondary text-xs font-bold text-center">
        غير متاح للتنفيذ الآن — يفتح يوم{" "}
        {new Date(scheduledDate).toLocaleDateString("ar-EG", { day: "numeric", month: "long" })}
      </div>
    );
  }

  // أول خطوة: الاتصال بالعميل
  if (status === "PENDING") {
    if (!customerCalledAt) {
      if (!canCall(phone)) {
        return (
          <div className="w-full py-2.5 rounded-xl bg-[#F4F7F8] text-text-secondary text-xs font-bold text-center">
            رقم العميل غير متوفر، تواصل مع الإدارة
          </div>
        );
      }
      return (
        <a
          href={`tel:${phone}`}
          onClick={() => send({ action: "call" })}
          className="w-full py-3 rounded-xl font-bold text-white text-sm bg-emerald-500 flex items-center justify-center gap-2"
        >
          <PhoneIcon />
          اتصل بالعميل لتأكيد الموعد
        </a>
      );
    }

    return (
      <div className="flex flex-col gap-2">
        <span className="text-emerald-600 text-xs font-bold text-center">تم الاتصال بالعميل ✓</span>
        <button
          onClick={() => send({ status: "CONFIRMED" })}
          disabled={busy}
          className="w-full py-2.5 rounded-xl font-bold text-white text-sm bg-primary disabled:opacity-50"
        >
          {busy ? "جارٍ التحديث..." : actionLabels.CONFIRMED}
        </button>
      </div>
    );
  }

  // آخر خطوة في الطلبات العادية: اختيار طريقة الدفع
  if (status === "IN_PROGRESS" && kind === "order") {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2">
          <span className="text-text-main text-xs font-bold">طريقة الدفع</span>
          <div className="grid grid-cols-3 gap-2">
            {paymentOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setPayment(opt.value)}
                className={`py-2.5 rounded-xl text-sm font-bold transition-colors ${
                  payment === opt.value ? "bg-primary text-white" : "bg-[#F4F7F8] text-text-main"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={() => send({ status: "COMPLETED", paymentMethod: payment })}
          disabled={!payment || busy}
          className={`w-full py-2.5 rounded-xl font-bold text-white text-sm ${
            !payment || busy ? "bg-disabled cursor-not-allowed" : "bg-primary"
          }`}
        >
          {busy ? "جارٍ التحديث..." : actionLabels.COMPLETED}
        </button>
      </div>
    );
  }

  const next = nextStatusMap[status];
  if (!next) return null;

  return (
    <button
      onClick={() => send({ status: next })}
      disabled={busy}
      className="w-full py-2.5 rounded-xl font-bold text-white text-sm bg-primary disabled:opacity-50"
    >
      {busy ? "جارٍ التحديث..." : actionLabels[next]}
    </button>
  );
}