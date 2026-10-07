"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ShiftBar from "./_components/ShiftBar";

interface StaffInfo {
  name: string;
  phone: string;
  role: string;
  district: { name: string; city: string } | null;
}

interface StaffStats {
  todayTotal: number;
  todayDone: number;
  todayRemaining: number;
  allTotal: number;
  points: number;
  todayPoints: number;
  pointValue: number;
}

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [staff, setStaff] = useState<StaffInfo | null>(null);
  const [stats, setStats] = useState<StaffStats | null>(null);

  const handleLogout = async () => {
    await fetch("/api/staff/auth/logout", { method: "POST" });
    router.push("/staff/login");
    router.refresh();
  };

  useEffect(() => {
    if (pathname === "/staff/login") return;
    fetch("/api/staff/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => data && setStaff(data))
      .catch(() => {});
  }, [pathname]);

  useEffect(() => {
    if (pathname === "/staff/login") return;

    const loadStats = () => {
      fetch("/api/staff/stats")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => data && setStats(data))
        .catch(() => {});
    };

    loadStats();
    const interval = setInterval(loadStats, 10000);
    window.addEventListener("staff-data-changed", loadStats);
    return () => {
      clearInterval(interval);
      window.removeEventListener("staff-data-changed", loadStats);
    };
  }, [pathname]);

  if (pathname === "/staff/login") {
    return <>{children}</>;
  }

  const initials = staff?.name?.trim().slice(0, 1) ?? "م";

  const statCards = [
    { label: "طلبات اليوم", value: stats?.todayTotal, color: "text-text-main" },
    { label: "المنفّذ", value: stats?.todayDone, color: "text-emerald-600" },
    { label: "المتبقي", value: stats?.todayRemaining, color: "text-amber-600" },
    { label: "الإجمالي", value: stats?.allTotal, color: "text-primary" },
  ];

  const pointsMoney =
    stats && stats.pointValue > 0 ? Math.round(stats.points * stats.pointValue * 100) / 100 : null;

  return (
    <div className="min-h-dvh bg-[#F4F7F8] flex flex-col">
      <header className="bg-white shadow-[0_2px_10px_rgba(16,24,40,0.05)] shrink-0">
        <div className="px-5 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 flex items-center justify-center shrink-0">
              <Image src="/images/logo-color.png" alt="غسلة ولمعة" width={36} height={36} className="h-auto w-auto max-w-[36px]" />
            </div>
            <span className="text-text-main text-base font-extrabold">غسلة ولمعة</span>
          </div>

          <div className="flex items-center gap-3">
            {staff && (
              <div className="flex items-center gap-2.5">
                <div className="flex flex-col items-end leading-tight">
                  <span className="text-text-main text-xs font-bold">{staff.name}</span>
                  <span className="text-text-secondary text-[11px]">
                    {staff.district ? `${staff.district.city} - ${staff.district.name}` : staff.role}
                  </span>
                </div>
                <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {initials}
                </div>
              </div>
            )}
            <button onClick={handleLogout} className="text-text-secondary hover:text-red-500 transition-colors shrink-0" title="تسجيل الخروج">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <path d="M16 17l5-5-5-5" />
                <path d="M21 12H9" />
              </svg>
            </button>
          </div>
        </div>

        <div className="px-5 pb-3 flex gap-2">
          <Link
            href="/staff"
            className={`flex-1 text-center py-2.5 rounded-xl text-sm font-bold transition-colors ${
              pathname === "/staff" ? "bg-primary text-white shadow-[0_6px_16px_rgba(25,185,198,0.3)]" : "bg-[#F4F7F8] text-text-secondary"
            }`}
          >
            طلبات الحجز
          </Link>
          <Link
            href="/staff/subscriptions"
            className={`flex-1 text-center py-2.5 rounded-xl text-sm font-bold transition-colors ${
              pathname === "/staff/subscriptions" ? "bg-primary text-white shadow-[0_6px_16px_rgba(25,185,198,0.3)]" : "bg-[#F4F7F8] text-text-secondary"
            }`}
          >
            مهام الباقات
          </Link>
        </div>
      </header>

      <div className="px-5 pt-4 grid grid-cols-4 gap-2">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-xl py-3 px-1 flex flex-col items-center gap-1 shadow-[0_2px_10px_rgba(16,24,40,0.05)]"
          >
            <span className={`text-xl font-extrabold ${card.color}`}>{card.value ?? "-"}</span>
            <span className="text-text-secondary text-[10px] font-bold text-center">{card.label}</span>
          </div>
        ))}
      </div>

      {/* النقاط */}
      <div className="px-5 pt-2">
        <div className="bg-white rounded-xl px-4 py-3 flex items-center justify-between shadow-[0_2px_10px_rgba(16,24,40,0.05)]">
          <div className="flex items-center gap-2">
            <span className="text-lg">⭐</span>
            <div className="flex flex-col leading-tight">
              <span className="text-text-main text-sm font-bold">نقاطي</span>
              <span className="text-text-secondary text-[11px]">
                اليوم: +{stats?.todayPoints ?? 0}
                {pointsMoney !== null && ` • ≈ ${pointsMoney} ر.س`}
              </span>
            </div>
          </div>
          <span className="text-primary text-2xl font-extrabold">{stats?.points ?? "-"}</span>
        </div>
      </div>

      {/* الدوام */}
      <div className="px-5 pt-2">
        <ShiftBar />
      </div>

      <main className="flex-1">{children}</main>
    </div>
  );
}