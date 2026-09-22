"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSubscription } from "../../context/SubscriptionContext";

const weekDays = [
  { index: 0, name: "أحد" },
  { index: 1, name: "اثنين" },
  { index: 2, name: "ثلاثاء" },
  { index: 3, name: "أربعاء" },
  { index: 4, name: "خميس" },
  { index: 5, name: "جمعة" },
  { index: 6, name: "سبت" },
];

const timeSlots = [
  "09:00 ص", "10:00 ص", "11:00 ص", "12:00 م",
  "01:00 م", "02:00 م", "03:00 م", "04:00 م",
];

const monthNames = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
];

// بيحسب أقرب 4 تواريخ جاية بنفس يوم الأسبوع المختار
function generateScheduleDates(dayOfWeek: number, count: number) {
  const dates: { key: string; label: string }[] = [];
  const today = new Date();
  const cursor = new Date(today);

  // نبدأ من بكرة عشان أول معاد يكون في المستقبل
  cursor.setDate(cursor.getDate() + 1);

  while (dates.length < count) {
    if (cursor.getDay() === dayOfWeek) {
      dates.push({
        key: cursor.toISOString().split("T")[0],
        label: `${cursor.getDate()} ${monthNames[cursor.getMonth()]}`,
      });
      cursor.setDate(cursor.getDate() + 7);
    } else {
      cursor.setDate(cursor.getDate() + 1);
    }
  }
  return dates;
}

const washCountByPackage: Record<string, number> = {
  basic: 2,
  standard: 4,
  premium: 4,
};

export default function SubscriptionSchedulePage() {
  const router = useRouter();
  const { subscription, setSchedule } = useSubscription();

  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const washCount = subscription.packageId ? washCountByPackage[subscription.packageId] : 4;

  const previewDates = useMemo(() => {
    if (selectedDay === null) return [];
    return generateScheduleDates(selectedDay, washCount);
  }, [selectedDay, washCount]);

  const handleConfirm = () => {
    if (selectedDay === null || !selectedTime) return;
    setSchedule(
      selectedDay,
      selectedTime,
      previewDates.map((d) => d.key)
    );
    router.push("/subscriptions/confirmation");
  };

  return (
    <main className="h-dvh flex flex-col bg-bg-page overflow-hidden">
      {/* العنوان */}
      <div className="px-6 pt-8 pb-5 flex flex-col gap-1 shrink-0">
        <h1 className="text-text-main text-2xl font-extrabold">حدد معاد الغسيل</h1>
        <p className="text-text-secondary text-sm">اختر اليوم والوقت المفضل، وهنجهزلك المواعيد تلقائيًا</p>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-6 px-5">
        {/* اختيار يوم الأسبوع */}
        <div>
          <span className="text-text-main text-sm font-bold mb-3 block">اليوم المفضل أسبوعيًا</span>
          <div className="grid grid-cols-4 gap-2.5">
            {weekDays.map((day) => {
              const isSelected = selectedDay === day.index;
              return (
                <button
                  key={day.index}
                  onClick={() => setSelectedDay(day.index)}
                  className={`rounded-xl py-3 text-sm font-bold transition-all ${
                    isSelected
                      ? "bg-primary text-white shadow-[0_6px_16px_rgba(25,185,198,0.3)]"
                      : "bg-white text-text-main shadow-[0_2px_10px_rgba(16,24,40,0.05)]"
                  }`}
                >
                  {day.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* اختيار الوقت */}
        <div>
          <span className="text-text-main text-sm font-bold mb-3 block">الوقت المفضل</span>
          <div className="grid grid-cols-3 gap-2.5">
            {timeSlots.map((time) => {
              const isSelected = selectedTime === time;
              return (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={`rounded-xl py-3 text-sm font-bold transition-all ${
                    isSelected
                      ? "bg-primary text-white shadow-[0_6px_16px_rgba(25,185,198,0.3)]"
                      : "bg-white text-text-main shadow-[0_2px_10px_rgba(16,24,40,0.05)]"
                  }`}
                >
                  {time}
                </button>
              );
            })}
          </div>
        </div>

        {/* معاينة المواعيد المحسوبة تلقائيًا */}
        {selectedDay !== null && (
          <div className="bg-white rounded-2xl p-4 flex flex-col gap-3 shadow-[0_2px_10px_rgba(16,24,40,0.05)]">
            <span className="text-text-main text-sm font-bold">
              مواعيد الغسيل هذا الشهر ({washCount})
            </span>
            <div className="flex flex-wrap gap-2">
              {previewDates.map((d) => (
                <span
                  key={d.key}
                  className="bg-primary-light text-primary text-xs font-bold px-3 py-1.5 rounded-full"
                >
                  {d.label}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* زرار التأكيد */}
      <div className="px-5 pt-4 pb-8 shrink-0">
        <button
          onClick={handleConfirm}
          disabled={selectedDay === null || !selectedTime}
          className={`w-full py-4 rounded-2xl font-bold text-white transition-colors ${
            selectedDay !== null && selectedTime
              ? "bg-primary shadow-[0_8px_20px_rgba(25,185,198,0.35)]"
              : "bg-disabled cursor-not-allowed"
          }`}
        >
          تأكيد الاشتراك
        </button>
      </div>
    </main>
  );
}