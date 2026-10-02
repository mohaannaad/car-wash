"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSubscription } from "../../context/SubscriptionContext";

const dayNames = ["أحد", "اثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"];
const monthNames = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

const WORK_START_HOUR = 9;
const WORK_END_HOUR = 18;

function buildTimeSlots() {
  const slots: { label: string; hour: number }[] = [];
  for (let hour = WORK_START_HOUR; hour <= WORK_END_HOUR; hour++) {
    const period = hour < 12 ? "ص" : "م";
    const displayHour = hour > 12 ? hour - 12 : hour;
    slots.push({ label: `${String(displayHour).padStart(2, "0")}:00 ${period}`, hour });
  }
  return slots;
}

function buildNext30Days() {
  const days = [];
  const today = new Date();
  for (let i = 1; i <= 30; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push({
      key: d.toISOString().split("T")[0],
      dayName: dayNames[d.getDay()],
      dayNumber: d.getDate(),
      monthName: monthNames[d.getMonth()],
    });
  }
  return days;
}

type Appointment = { date: string; time: string };

export default function SubscriptionSchedulePage() {
  const router = useRouter();
  const { subscription, setAppointments } = useSubscription();

  const washCount = subscription.package?.washCount ?? 3;
  const days = useMemo(() => buildNext30Days(), []);
  const timeSlots = useMemo(() => buildTimeSlots(), []);

  const [appointments, setLocalAppointments] = useState<Appointment[]>([]);
  const [activeDate, setActiveDate] = useState<string | null>(null);

  const now = new Date();
  const todayKey = now.toISOString().split("T")[0];

  const isSlotDisabled = (dayKey: string, hour: number) => {
    if (dayKey !== todayKey) return false;
    return hour <= now.getHours();
  };

  const appointmentFor = (dateKey: string) => appointments.find((a) => a.date === dateKey);

  const handleDayClick = (dateKey: string) => {
    const existing = appointmentFor(dateKey);
    if (existing) {
      setActiveDate(dateKey);
      return;
    }
    if (appointments.length >= washCount) return;
    setActiveDate(dateKey);
  };

  const handleTimeSelect = (time: string) => {
    if (!activeDate) return;
    setLocalAppointments((prev) => {
      const withoutCurrent = prev.filter((a) => a.date !== activeDate);
      return [...withoutCurrent, { date: activeDate, time }].sort((a, b) => a.date.localeCompare(b.date));
    });
    setActiveDate(null);
  };

  const handleRemove = (dateKey: string) => {
    setLocalAppointments((prev) => prev.filter((a) => a.date !== dateKey));
    if (activeDate === dateKey) setActiveDate(null);
  };

  const formatLabel = (dateKey: string) => {
    const day = days.find((d) => d.key === dateKey);
    if (!day) return dateKey;
    return `${day.dayName} ${day.dayNumber} ${day.monthName}`;
  };

  const handleConfirm = () => {
    if (appointments.length !== washCount) return;
    setAppointments(appointments);
    router.push("/subscriptions/area");
  };

  const isComplete = appointments.length === washCount;
  const availableSlotsForActiveDate = activeDate
    ? timeSlots.filter((slot) => !isSlotDisabled(activeDate, slot.hour))
    : [];

  return (
    <main className="h-dvh flex flex-col bg-bg-page overflow-hidden">
      <div className="px-6 pt-8 pb-5 flex flex-col gap-1 shrink-0">
        <h1 className="text-text-main text-2xl font-extrabold">حدد مواعيد الغسيل</h1>
        <p className="text-text-secondary text-sm">
          اختر {washCount} أيام مختلفة على مدار الشهر، ولكل يوم وقت مناسب لك ({appointments.length}/{washCount})
        </p>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-6 px-5">
        {appointments.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="text-text-main text-sm font-bold">مواعيدك المختارة</span>
            <div className="flex flex-col gap-2">
              {appointments.map((a) => (
                <div key={a.date} className="flex items-center justify-between bg-white rounded-2xl px-4 py-3 shadow-[0_2px_10px_rgba(16,24,40,0.05)]">
                  <div className="flex items-center gap-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#19B9C6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    <span className="text-text-main text-sm font-bold">{formatLabel(a.date)}</span>
                    <span className="text-text-secondary text-xs">- {a.time}</span>
                  </div>
                  <button onClick={() => handleRemove(a.date)} className="text-red-500 text-xs font-bold">إزالة</button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <span className="text-text-main text-sm font-bold mb-3 block">
            {appointments.length >= washCount ? "وصلت للحد الأقصى من المواعيد" : "اختر يوم جديد"}
          </span>
          <div className="flex gap-2.5 overflow-x-auto pb-2 -mx-1 px-1">
            {days.map((day) => {
              const booked = appointmentFor(day.key);
              const isActive = activeDate === day.key;
              const disabled = !booked && appointments.length >= washCount;
              return (
                <button
                  key={day.key}
                  onClick={() => handleDayClick(day.key)}
                  disabled={disabled}
                  className={`relative shrink-0 w-16 flex flex-col items-center justify-center gap-1 rounded-2xl py-3 transition-all ${
                    isActive
                      ? "bg-primary text-white shadow-[0_6px_16px_rgba(25,185,198,0.3)]"
                      : booked
                      ? "bg-primary-light text-primary border-[1.5px] border-primary"
                      : disabled
                      ? "bg-white text-[#C4C4C4] opacity-50"
                      : "bg-white text-text-main shadow-[0_2px_10px_rgba(16,24,40,0.05)]"
                  }`}
                >
                  <span className={`text-[11px] font-medium ${isActive ? "text-white/85" : "text-text-secondary"}`}>{day.dayName}</span>
                  <span className="text-lg font-extrabold">{day.dayNumber}</span>
                  <span className={`text-[10px] ${isActive ? "text-white/85" : "text-text-secondary"}`}>{day.monthName}</span>
                </button>
              );
            })}
          </div>
        </div>

        {activeDate && (
          <div>
            <span className="text-text-main text-sm font-bold mb-3 block">اختر الوقت ليوم {formatLabel(activeDate)}</span>
            {availableSlotsForActiveDate.length === 0 ? (
              <p className="text-text-secondary text-sm">لا توجد مواعيد متاحة في هذا اليوم</p>
            ) : (
              <div className="grid grid-cols-3 gap-2.5">
                {timeSlots.map((slot) => {
                  const disabled = isSlotDisabled(activeDate, slot.hour);
                  const isSelected = appointmentFor(activeDate)?.time === slot.label;
                  return (
                    <button
                      key={slot.label}
                      onClick={() => !disabled && handleTimeSelect(slot.label)}
                      disabled={disabled}
                      className={`rounded-xl py-3 text-sm font-bold transition-all ${
                        disabled
                          ? "bg-[#F4F7F8] text-[#C4C4C4] cursor-not-allowed"
                          : isSelected
                          ? "bg-primary text-white shadow-[0_6px_16px_rgba(25,185,198,0.3)]"
                          : "bg-white text-text-main shadow-[0_2px_10px_rgba(16,24,40,0.05)]"
                      }`}
                    >
                      {slot.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="px-5 pt-4 pb-8 shrink-0">
        <button
          onClick={handleConfirm}
          disabled={!isComplete}
          className={`w-full py-4 rounded-2xl font-bold text-white transition-colors ${
            isComplete ? "bg-primary shadow-[0_8px_20px_rgba(25,185,198,0.35)]" : "bg-disabled cursor-not-allowed"
          }`}
        >
          التالي
        </button>
      </div>
    </main>
  );
}