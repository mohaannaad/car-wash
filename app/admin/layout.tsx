"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const navItems = [
  {
    href: "/admin",
    label: "نظرة عامة",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="9" rx="1.5" />
        <rect x="14" y="3" width="7" height="5" rx="1.5" />
        <rect x="14" y="12" width="7" height="9" rx="1.5" />
        <rect x="3" y="16" width="7" height="5" rx="1.5" />
      </svg>
    ),
  },
  {
    href: "/admin/orders",
    label: "الطلبات",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M3 10h18M8 3v4M16 3v4" />
      </svg>
    ),
  },
  {
    href: "/admin/subscriptions",
    label: "الاشتراكات",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l2.4 6.6L21 10l-5 4.3L17.4 21 12 17.6 6.6 21 8 14.3 3 10l6.6-1.4z" />
      </svg>
    ),
  },
  {
    href: "/admin/customers",
    label: "العملاء",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="8" r="3.5" />
        <path d="M2.5 20c0-3.6 2.9-6.5 6.5-6.5s6.5 2.9 6.5 6.5" />
        <path d="M16.5 13.5c2.5 0 4.5 2.2 4.5 5" />
        <circle cx="17" cy="7.5" r="2.5" />
      </svg>
    ),
  },
  {
    href: "/admin/employees",
    label: "الموظفين",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="4" width="16" height="16" rx="3" />
        <path d="M8 4v16M4 10h16" />
      </svg>
    ),
  },
  {
    href: "/admin/attendance",
    label: "الحضور والنقاط",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
    ),
  },
  {
    href: "/admin/cities",
    label: "المدن والأحياء",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },
  {
    href: "/admin/car-types",
    label: "أنواع السيارات",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 15.5V12l1.6-4a2 2 0 0 1 1.9-1.3h9a2 2 0 0 1 1.9 1.3l1.6 4v3.5" />
        <path d="M1.5 15.5h21" />
        <circle cx="7" cy="16" r="1.5" />
        <circle cx="17" cy="16" r="1.5" />
      </svg>
    ),
  },

  {
    href: "/admin/extras",
    label: "الخدمات الإضافية",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 5v14M5 12h14" />
      </svg>
    ),
  },
  {
    href: "/admin/packages",
    label: "الباقات الشهرية",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M3 10h18M8 3v4M16 3v4" />
      </svg>
    ),
  },
  {
    href: "/admin/settings",
    label: "الإعدادات",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [unseenOrders, setUnseenOrders] = useState(0);
  const [unseenSubscriptions, setUnseenSubscriptions] = useState(0);

  const handleLogout = async () => {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  useEffect(() => {
    if (pathname === "/admin/login") return;

    const checkUnseen = async () => {
      try {
        const [ordersRes, subscriptionsRes] = await Promise.all([
          fetch("/api/admin/orders/unseen-count"),
          fetch("/api/admin/subscriptions/unseen-count"),
        ]);
        const ordersData = await ordersRes.json();
        const subscriptionsData = await subscriptionsRes.json();
        setUnseenOrders(ordersData.count ?? 0);
        setUnseenSubscriptions(subscriptionsData.count ?? 0);
      } catch {
        // تجاهل
      }
    };

    checkUnseen();
    const interval = setInterval(checkUnseen, 10000);
    return () => clearInterval(interval);
  }, [pathname]);

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex bg-[#F4F7F8]">
      <aside className="w-64 shrink-0 bg-white border-l border-[#EEF2F3] flex flex-col">
        <div className="px-6 py-7 border-b border-[#EEF2F3] flex items-center gap-3">
          <div className="w-14 h-14 flex items-center justify-center shrink-0">
  <Image src="/images/logo-color.png" alt="غسلة ولمعة" width={56} height={56} className="h-auto w-auto max-w-[56px]" />
</div>
          <div className="flex flex-col">
            <span className="text-text-main text-sm font-extrabold">غسلة ولمعة</span>
            <span className="text-text-secondary text-xs">لوحة التحكم</span>
          </div>
        </div>

        <nav className="flex-1 px-3 py-5 flex flex-col gap-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
            const badgeCount =
              item.href === "/admin/orders" ? unseenOrders : item.href === "/admin/subscriptions" ? unseenSubscriptions : 0;
            const showBadge = badgeCount > 0;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors text-sm font-bold ${
                  isActive ? "bg-primary-light text-primary" : "text-text-secondary hover:bg-primary-light hover:text-primary"
                }`}
              >
                {item.icon}
                {item.label}
                {showBadge && (
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold">
                    {badgeCount > 9 ? "9+" : badgeCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="px-6 py-5 border-t border-[#EEF2F3] flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold shrink-0">أد</div>
          <div className="flex flex-col flex-1 min-w-0">
            <span className="text-text-main text-xs font-bold">الأدمن</span>
            <span className="text-text-secondary text-[11px] truncate">admin@carwash.com</span>
          </div>
          <button onClick={handleLogout} title="تسجيل الخروج" className="shrink-0 text-text-secondary hover:text-red-500 transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <path d="M16 17l5-5-5-5" />
              <path d="M21 12H9" />
            </svg>
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}