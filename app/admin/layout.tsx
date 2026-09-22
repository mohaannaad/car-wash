import Image from "next/image";
import Link from "next/link";

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
  return (
    <div className="min-h-screen flex bg-[#F4F7F8]">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 bg-white border-l border-[#EEF2F3] flex flex-col">
        {/* اللوجو */}
        <div className="px-6 py-7 border-b border-[#EEF2F3] flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-primary-light flex items-center justify-center shrink-0">
            {/* هنستبدل ده باللوجو الحقيقي لما يوصلنا */}
            <Image src="/images/logo.png" alt="غسلة ولمعة" width={32} height={32} className="h-auto w-auto max-w-[28px]" />
          </div>
          <div className="flex flex-col">
            <span className="text-text-main text-sm font-extrabold">غسلة ولمعة</span>
            <span className="text-text-secondary text-xs">لوحة التحكم</span>
          </div>
        </div>

        {/* روابط التنقل */}
        <nav className="flex-1 px-3 py-5 flex flex-col gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-text-secondary hover:bg-primary-light hover:text-primary transition-colors text-sm font-bold"
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        {/* أسفل الـ Sidebar */}
        <div className="px-6 py-5 border-t border-[#EEF2F3] flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold shrink-0">
            أد
          </div>
          <div className="flex flex-col">
            <span className="text-text-main text-xs font-bold">الأدمن</span>
            <span className="text-text-secondary text-[11px]">admin@carwash.com</span>
          </div>
        </div>
      </aside>

      {/* المساحة الرئيسية */}
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}