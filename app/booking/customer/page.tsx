"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useBooking } from "../../context/BookingContext";

export default function CustomerStep() {
  const router = useRouter();
  const { setCustomer } = useBooking();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [plate, setPlate] = useState("");
  const [error, setError] = useState("");

  const isPhoneValid = /^01[0125]\d{8}$/.test(phone);
  const isNameValid = name.trim().length >= 3;
  const isPlateValid = plate.trim().length >= 3;
  const isFormValid = isNameValid && isPhoneValid && isPlateValid;

  const handleNext = () => {
    if (!isNameValid) {
      setError("من فضلك اكتب اسمك كامل (3 حروف على الأقل)");
      return;
    }
    if (!isPhoneValid) {
      setError("رقم الجوال لازم يبدأ بـ 05 ويكون 10 أرقام");
      return;
    }
    if (!isPlateValid) {
      setError("من فضلك اكتب رقم لوحة السيارة");
      return;
    }
    setError("");
    setCustomer({ name: name.trim(), phone, plate: plate.trim() });
    router.push("/booking/summary");
  };

  return (
    <main className="h-dvh flex flex-col bg-bg-page overflow-hidden">
      {/* العنوان */}
      <div className="px-6 pt-8 pb-5 flex flex-col gap-1 shrink-0">
        <h1 className="text-text-main text-2xl font-extrabold">بياناتك</h1>
        <p className="text-text-secondary text-sm">هنحتاج بياناتك عشان نتواصل معاك بخصوص الطلب</p>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-5 px-5">
        {/* حقل الاسم */}
        <div className="flex flex-col gap-2">
          <label htmlFor="name" className="text-text-main text-sm font-bold">
            الاسم بالكامل
          </label>
          <div className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3.5 shadow-[0_2px_10px_rgba(16,24,40,0.05)]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#98A2B3" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8" />
            </svg>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="اكتب اسمك بالكامل"
              className="flex-1 text-text-main text-sm outline-none placeholder:text-[#98A2B3]"
            />
          </div>
        </div>

        {/* حقل رقم الجوال */}
        <div className="flex flex-col gap-2">
          <label htmlFor="phone" className="text-text-main text-sm font-bold">
            رقم الجوال
          </label>
          <div className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3.5 shadow-[0_2px_10px_rgba(16,24,40,0.05)]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#98A2B3" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15.5 17.5l-1-1.8a1.5 1.5 0 0 0-1.9-.6l-1 .4a1.5 1.5 0 0 1-1.7-.5 15 15 0 0 1-3.9-3.9 1.5 1.5 0 0 1-.5-1.7l.4-1a1.5 1.5 0 0 0-.6-1.9l-1.8-1a1.5 1.5 0 0 0-1.9.3l-.7.8c-.6.6-.8 1.5-.5 2.3a20 20 0 0 0 11.6 11.6c.8.3 1.7.1 2.3-.5l.8-.7a1.5 1.5 0 0 0 .3-1.9z" />
            </svg>
            <input
              id="phone"
              type="tel"
              dir="ltr"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
              placeholder="05XXXXXXXX"
              className="flex-1 text-text-main text-sm outline-none placeholder:text-[#98A2B3] text-right"
            />
          </div>
        </div>

        {/* حقل رقم اللوحة */}
        <div className="flex flex-col gap-2">
          <label htmlFor="plate" className="text-text-main text-sm font-bold">
            رقم لوحة السيارة
          </label>
          <div className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3.5 shadow-[0_2px_10px_rgba(16,24,40,0.05)]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#98A2B3" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="7" width="18" height="10" rx="2" />
              <path d="M6.5 12h11M7.5 14.5h4" />
            </svg>
            <input
              id="plate"
              type="text"
              dir="ltr"
              value={plate}
              onChange={(e) => setPlate(e.target.value)}
              placeholder="مثال: أ ب ج 1234"
              className="flex-1 text-text-main text-sm outline-none placeholder:text-[#98A2B3] text-right"
            />
          </div>
        </div>

        {/* رسالة الخطأ */}
        {error && (
          <p className="text-sm font-medium text-red-500 -mt-2">{error}</p>
        )}
      </div>

      {/* زرار التالي */}
      <div className="px-5 pt-4 pb-8 shrink-0">
        <button
          onClick={handleNext}
          disabled={!isFormValid}
          className={`w-full py-4 rounded-2xl font-bold text-white transition-colors ${
            isFormValid
              ? "bg-primary shadow-[0_8px_20px_rgba(25,185,198,0.35)]"
              : "bg-disabled cursor-not-allowed"
          }`}
        >
          التالي
        </button>
      </div>
    </main>
  );
}