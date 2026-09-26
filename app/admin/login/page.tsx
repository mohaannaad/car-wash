"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "حصل خطأ");
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("حصل خطأ في الاتصال، حاول تاني");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F7F8] px-6">
      <div className="w-full max-w-sm bg-white rounded-2xl p-8 shadow-[0_4px_20px_rgba(16,24,40,0.08)] flex flex-col gap-6">
        <div className="flex flex-col items-center gap-2">
          <div className="w-14 h-14 rounded-2xl bg-primary-light flex items-center justify-center">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#19B9C6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="5" y="11" width="14" height="10" rx="2" />
              <path d="M8 11V7a4 4 0 0 1 8 0v4" />
            </svg>
          </div>
          <h1 className="text-text-main text-xl font-extrabold">تسجيل دخول لوحة التحكم</h1>
          <p className="text-text-secondary text-sm text-center">غسلة ولمعة — للفريق والإدارة فقط</p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-text-main text-sm font-bold">الإيميل</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              dir="ltr"
              placeholder="admin@carwash.com"
              className="bg-[#F4F7F8] rounded-xl px-4 py-3 text-sm outline-none placeholder:text-[#98A2B3] text-right"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-text-main text-sm font-bold">الباسورد</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              dir="ltr"
              placeholder="••••••••"
              className="bg-[#F4F7F8] rounded-xl px-4 py-3 text-sm outline-none placeholder:text-[#98A2B3] text-right"
            />
          </div>
        </div>

        {error && <p className="text-red-500 text-sm font-medium text-center">{error}</p>}

        <button
          onClick={handleLogin}
          disabled={submitting || !email.trim() || !password}
          className={`w-full py-3.5 rounded-xl font-bold text-white transition-colors ${
            submitting || !email.trim() || !password ? "bg-disabled cursor-not-allowed" : "bg-primary"
          }`}
        >
          {submitting ? "جاري الدخول..." : "تسجيل الدخول"}
        </button>
      </div>
    </div>
  );
}