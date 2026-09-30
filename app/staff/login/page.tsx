"use client";

import { useState } from "react";

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
    <main className="h-dvh flex flex-col items-center justify-center bg-bg-page px-6 gap-6">
      <div className="w-14 h-14 rounded-2xl bg-primary-light flex items-center justify-center">
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#19B9C6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="5" y="11" width="14" height="10" rx="2" />
          <path d="M8 11V7a4 4 0 0 1 8 0v4" />
        </svg>
      </div>

      <div className="flex flex-col items-center gap-1 text-center">
        <h1 className="text-text-main text-xl font-extrabold">تسجيل دخول الفريق</h1>
        <p className="text-text-secondary text-sm">غسلة ولمعة — خاص بفريق العمل</p>
      </div>

      <div className="w-full flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-text-main text-sm font-bold">رقم الجوال</label>
          <input
            type="tel"
            dir="ltr"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            placeholder="05XXXXXXXX"
            className="bg-white rounded-2xl px-4 py-3.5 text-sm outline-none placeholder:text-[#98A2B3] text-right shadow-[0_2px_10px_rgba(16,24,40,0.05)]"
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
            className="bg-white rounded-2xl px-4 py-3.5 text-sm outline-none placeholder:text-[#98A2B3] text-right shadow-[0_2px_10px_rgba(16,24,40,0.05)]"
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
    </main>
  );
}