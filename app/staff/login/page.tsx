"use client";

import { useState } from "react";
import Image from "next/image";

export default function StaffLoginPage() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
    <main className="min-h-dvh flex items-center justify-center bg-[#F4F7F8] px-5 py-10 relative overflow-hidden">
      {/* دوائر زخرفية خفيفة في الخلفية */}
      <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-primary-light/60 blur-2xl" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-primary-light/50 blur-2xl" />

      <div className="w-full max-w-sm relative z-10">
        {/* الكارت */}
        <div className="bg-white rounded-3xl shadow-[0_20px_50px_rgba(16,24,40,0.1)] p-8 flex flex-col items-center gap-6">
          {/* اللوجو */}
          <div className="w-20 h-20 flex items-center justify-center">
            <Image
              src="/images/logo-color.png"
              alt="غسلة ولمعة"
              width={80}
              height={80}
              className="h-auto w-auto max-w-[80px]"
            />
          </div>

          <div className="flex flex-col items-center gap-1 text-center">
            <span className="text-text-main text-xl font-extrabold">غسلة ولمعة</span>
            <span className="text-text-secondary text-sm">بوابة فريق العمل</span>
          </div>

          {/* النموذج */}
          <div className="w-full flex flex-col gap-4 mt-2">
            <div className="flex flex-col gap-2">
              <label className="text-text-main text-sm font-bold">رقم الجوال</label>
              <div className="relative">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#98A2B3"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <input
                  type="tel"
                  dir="ltr"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  placeholder="05XXXXXXXX"
                  className="w-full bg-[#F4F7F8] rounded-2xl pr-11 pl-4 py-3.5 text-sm outline-none placeholder:text-[#98A2B3] text-right focus:ring-2 focus:ring-primary/30 transition-shadow"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-text-main text-sm font-bold">الباسورد</label>
              <div className="relative">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#98A2B3"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
                >
                  <rect x="3" y="11" width="18" height="10" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  type={showPassword ? "text" : "password"}
                  dir="ltr"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  placeholder="••••••••"
                  className="w-full bg-[#F4F7F8] rounded-2xl pr-11 pl-11 py-3.5 text-sm outline-none placeholder:text-[#98A2B3] text-right focus:ring-2 focus:ring-primary/30 transition-shadow"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#98A2B3] hover:text-text-secondary"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <path d="M1 1l22 22" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm font-medium text-center -mt-1">{error}</p>}

          <button
            onClick={handleLogin}
            disabled={submitting || !phone.trim() || !password}
            className={`w-full py-4 rounded-2xl font-bold text-white transition-colors ${
              submitting || !phone.trim() || !password
                ? "bg-disabled cursor-not-allowed"
                : "bg-primary shadow-[0_8px_20px_rgba(25,185,198,0.35)] hover:brightness-95"
            }`}
          >
            {submitting ? "جارٍ الدخول..." : "تسجيل الدخول"}
          </button>
        </div>

        <p className="text-text-secondary text-xs text-center mt-6">
          بيانات الدخول متاحة من إدارة غسلة ولمعة، لو واجهت مشكلة تواصل مع المسؤول
        </p>
      </div>
    </main>
  );
}