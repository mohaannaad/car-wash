"use client";

import { usePathname, useRouter } from "next/navigation";

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/staff/auth/logout", { method: "POST" });
    router.push("/staff/login");
    router.refresh();
  };

  if (pathname === "/staff/login") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-dvh bg-bg-page flex flex-col">
      <header className="bg-white shadow-[0_2px_10px_rgba(16,24,40,0.05)] px-5 py-4 flex items-center justify-between shrink-0">
        <span className="text-text-main text-base font-extrabold">طلباتي</span>
        <button onClick={handleLogout} className="text-text-secondary hover:text-red-500 transition-colors" title="تسجيل الخروج">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <path d="M16 17l5-5-5-5" />
            <path d="M21 12H9" />
          </svg>
        </button>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}