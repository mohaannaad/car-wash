"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useBooking } from "../../context/BookingContext";

const dayNames = ["أحد", "اثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"];
const monthNames = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
];

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

function buildNext14Days() {
  const days = [];
  const today = new Date();
  for (let i = 0; i < 14; i++) {
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

export default function ScheduleStep() {
  const router = useRouter();
  const { setDate, setTime } = useBooking();

  const days = useMemo(() => buildNext14Days(), []);
  const timeSlots = useMemo(() => buildTimeSlots(), []);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const now = new Date();
  const isToday = (dayKey: string) => dayKey === now.toISOString().split("T")[0];

  const isSlotDisabled = (dayKey: string, hour: number) => {
    if (!isToday(dayKey)) return false;
    // لازم نسيب ساعة فاصلة على الأقل من دلوقتي عشان الفريق يقدر يتحرك
    return hour <= now.getHours();
  };

  const availableSlotsForSelectedDay = selectedDay
    ? timeSlots.filter((slot) => !isSlotDisabled(selectedDay, slot.hour))
    : [];

  const handleSelectDay = (dayKey: string) => {
    setSelectedDay(dayKey);
    // لو الوقت المختار قبل كده بقى غير متاح في اليوم الجديد، نلغيه
    if (selectedTime) {
      const stillValid = timeSlots.some(
        (slot) => slot.label === selectedTime && !isSlotDisabled(dayKey, slot.hour)
      );
      if (!stillValid) setSelectedTime(null);
    }
  };

  const handleNext = () => {
    if (!selectedDay || !selectedTime) return;
    setDate(selectedDay);
    setTime(selectedTime);
    router.push("/booking/customer");
  };

  return (
    <main className="h-dvh flex flex-col bg-bg-page overflow-hidden">
      <div className="px-6 pt-8 pb-5 flex flex-col gap-1 shrink-0">
        <h1 className="text-text-main text-2xl font-extrabold">التاريخ والوقت</h1>
        <p className="text-text-secondary text-sm">اختر الموعد الذي يناسبك</p>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-6 px-5">
        <div>
          <span className="text-text-main text-sm font-bold mb-3 block">اختر اليوم</span>
          <div className="flex gap-2.5 overflow-x-auto pb-2 -mx-1 px-1">
            {days.map((day) => {
              const isSelected = selectedDay === day.key;
              return (
                <button
                  key={day.key}
                  onClick={() => handleSelectDay(day.key)}
                  className={`shrink-0 w-16 flex flex-col items-center justify-center gap-1 rounded-2xl py-3 transition-all ${
                    isSelected
                      ? "bg-primary text-white shadow-[0_6px_16px_rgba(25,185,198,0.3)]"
                      : "bg-white text-text-main shadow-[0_2px_10px_rgba(16,24,40,0.05)]"
                  }`}
                >
                  <span className={`text-[11px] font-medium ${isSelected ? "text-white/85" : "text-text-secondary"}`}>
                    {day.dayName}
                  </span>
                  <span className="text-lg font-extrabold">{day.dayNumber}</span>
                  <span className={`text-[10px] ${isSelected ? "text-white/85" : "text-text-secondary"}`}>
                    {day.monthName}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {selectedDay && (
          <div>
            <span className="text-text-main text-sm font-bold mb-3 block">اختر الوقت</span>
            {availableSlotsForSelectedDay.length === 0 ? (
              <p className="text-text-secondary text-sm">
                لا توجد مواعيد متاحة اليوم، من فضلك اختر يومًا آخر
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-2.5">
                {timeSlots.map((slot) => {
                  const disabled = isSlotDisabled(selectedDay, slot.hour);
                  const isSelected = selectedTime === slot.label;
                  return (
                    <button
                      key={slot.label}
                      onClick={() => !disabled && setSelectedTime(slot.label)}
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
          onClick={handleNext}
          disabled={!selectedDay || !selectedTime}
          className={`w-full py-4 rounded-2xl font-bold text-white transition-colors ${
            selectedDay && selectedTime ? "bg-primary shadow-[0_8px_20px_rgba(25,185,198,0.35)]" : "bg-disabled cursor-not-allowed"
          }`}
        >
          التالي
        </button>
      </div>
    </main>
  );
}