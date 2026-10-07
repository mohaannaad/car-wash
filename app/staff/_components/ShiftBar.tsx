"use client";

import { useCallback, useEffect, useState } from "react";

type ShiftState = {
  shift: {
    id: string;
    startedAt: string;
    onBreak: boolean;
    breakTotalMinutes: number;
    workedMinutes: number;
    stale: boolean;
  } | null;
  todayMinutes: number;
};

function fmt(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m} د`;
  return m === 0 ? `${h} س` : `${h} س ${m} د`;
}

function timeOf(iso: string) {
  return new Date(iso).toLocaleTimeString("ar-EG", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Riyadh",
  });
}

export default function ShiftBar() {
  const [state, setState] = useState<ShiftState | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/staff/shift");
      if (res.ok) setState(await res.json());
    } catch {
      // تجاهل
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [load]);

  const act = async (action: "start" | "break_start" | "break_end" | "end") => {
    if (action === "end" && !confirm("هل أنت متأكد من إنهاء الدوام؟")) return;
    setBusy(true);
    try {
      const res = await fetch("/api/staff/shift", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        setState(await res.json());
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.error || "حصل خطأ، حاول مرة تانية");
      }
    } catch {
      alert("تعذر الاتصال بالسيرفر، تأكد من الإنترنت");
    } finally {
      setBusy(false);
    }
  };

  if (!state) return null;
  const shift = state.shift;

  return (
    <div className="bg-white rounded-xl p-4 flex flex-col gap-3 shadow-[0_2px_10px_rgba(16,24,40,0.05)]">
      <div className="flex items-center justify-between">
        <span className="text-text-main text-sm font-bold">الدوام</span>
        {shift ? (
          <span
            className={`text-[11px] font-bold px-3 py-1 rounded-full ${
              shift.onBreak ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"
            }`}
          >
            {shift.onBreak ? "في استراحة" : "على رأس العمل"}
          </span>
        ) : (
          <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-[#F4F7F8] text-text-secondary">
            خارج الدوام
          </span>
        )}
      </div>

      {shift ? (
        <>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-[#F4F7F8] rounded-lg py-2">
              <div className="text-text-main text-sm font-extrabold">{fmt(shift.workedMinutes)}</div>
              <div className="text-text-secondary text-[10px] font-bold">ساعات العمل</div>
            </div>
            <div className="bg-[#F4F7F8] rounded-lg py-2">
              <div className="text-text-main text-sm font-extrabold">{fmt(shift.breakTotalMinutes)}</div>
              <div className="text-text-secondary text-[10px] font-bold">الاستراحة</div>
            </div>
            <div className="bg-[#F4F7F8] rounded-lg py-2">
              <div className="text-text-main text-sm font-extrabold">{timeOf(shift.startedAt)}</div>
              <div className="text-text-secondary text-[10px] font-bold">بدأت</div>
            </div>
          </div>

          {shift.stale && (
            <span className="text-amber-600 text-xs font-bold text-center">
              الدوام ده تجاوز 16 ساعة، أنهِه وابدأ دوام جديد
            </span>
          )}

          <div className="grid grid-cols-2 gap-2">
            {shift.onBreak ? (
              <button
                onClick={() => act("break_end")}
                disabled={busy}
                className="py-2.5 rounded-xl font-bold text-white text-sm bg-emerald-500 disabled:opacity-50"
              >
                إنهاء الاستراحة
              </button>
            ) : (
              <button
                onClick={() => act("break_start")}
                disabled={busy}
                className="py-2.5 rounded-xl font-bold text-amber-600 text-sm bg-amber-50 disabled:opacity-50"
              >
                بدء استراحة
              </button>
            )}
            <button
              onClick={() => act("end")}
              disabled={busy}
              className="py-2.5 rounded-xl font-bold text-red-500 text-sm bg-red-50 disabled:opacity-50"
            >
              إنهاء الدوام
            </button>
          </div>
        </>
      ) : (
        <button
          onClick={() => act("start")}
          disabled={busy}
          className="w-full py-3 rounded-xl font-bold text-white text-sm bg-primary disabled:opacity-50"
        >
          {busy ? "جارٍ التحديث..." : "بدء الدوام"}
        </button>
      )}

      <div className="flex items-center justify-between text-xs">
        <span className="text-text-secondary font-bold">إجمالي ساعات اليوم</span>
        <span className="text-text-main font-extrabold">{fmt(state.todayMinutes)}</span>
      </div>
    </div>
  );
}