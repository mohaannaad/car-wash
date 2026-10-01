"use client";

import { useState } from "react";
import Image from "next/image";

export default function StaffLoginPage() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async () => {
    if (!phone.trim() || !password) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/staff/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "حدث خطأ");
        return;
      }
      window.location.href = "/staff";
    } catch {
      setError("حدث خطأ في الاتصال، حاول مرة أخرى");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="h-dvh flex flex-col bg-bg-page overflow-hidden">
      {/* الجزء العلوي بلون العلامة واللوجو */}
      <div className="bg-primary flex-[0.9] min-h-0 flex flex-col items-center justify-center gap-4 px-6 shrink-0">
        <div className="w-20 h-20 rounded-3xl bg-white/15 flex items-center justify-center backdrop-blur-sm">
          <Image src="/images/logo.png" alt="غسلة ولمعة" width={56} height={56} className="h-auto w-auto max-w-[48px] brightness-0 invert" />
        </div>
        <div className="flex flex-col items-center gap-1 text-center">
          <span className="text-white text-xl font-extrabold">غسلة ولمعة</span>
          <span className="text-white/85 text-sm">بوابة فريق العمل</span>
        </div>
      </div>

      {/* نموذج الدخول */}
      <div className="flex-1 min-h-0 overflow-y-auto bg-white rounded-t-3xl -mt-6 relative z-10 px-6 pt-8 pb-8 flex flex-col gap-5">
        <h1 className="text-text-main text-lg font-extrabold text-center">تسجيل الدخول</h1>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-text-main text-sm font-bold">رقم الجوال</label>
            <input
              type="tel"
              dir="ltr"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              placeholder="05XXXXXXXX"
              className="bg-[#F4F7F8] rounded-2xl px-4 py-3.5 text-sm outline-none placeholder:text-[#98A2B3] text-right"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-text-main text-sm font-bold">الباسورد</label>
            <input
              type="password"
              dir="ltr"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              placeholder="••••••••"
              className="bg-[#F4F7F8] rounded-2xl px-4 py-3.5 text-sm outline-none placeholder:text-[#98A2B3] text-right"
            />
          </div>
        </div>

        {error && <p className="text-red-500 text-sm font-medium text-center">{error}</p>}

        <button
          onClick={handleLogin}
          disabled={submitting || !phone.trim() || !password}
          className={`w-full py-4 rounded-2xl font-bold text-white transition-colors ${
            submitting || !phone.trim() || !password ? "bg-disabled cursor-not-allowed" : "bg-primary shadow-[0_8px_20px_rgba(25,185,198,0.35)]"
          }`}
        >
          {submitting ? "جارٍ الدخول..." : "تسجيل الدخول"}
        </button>

        <p className="text-text-secondary text-xs text-center mt-2">
          بيانات الدخول متاحة من إدارة النقابة، لو واجهت مشكلة تواصل مع المسؤول
        </p>
      </div>
    </main>
  );
}