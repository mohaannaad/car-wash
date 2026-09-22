"use client";

import { useRouter } from "next/navigation";
import { useSubscription } from "../context/SubscriptionContext";

const packages = [
  {
    id: "basic",
    name: "الباقة الأساسية",
    washCount: 2,
    serviceLabel: "غسيل خارجي",
    price: 90,
    originalPrice: 100,
    icon: (color: string) => (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 13l2-5a3 3 0 0 1 2.8-2h8.4A3 3 0 0 1 19 8l2 5" />
        <path d="M3 13h18v4a1 1 0 0 1-1 1h-1.2a1 1 0 0 1-1-.8L17.5 16h-11l-.3 1.2a1 1 0 0 1-1 .8H4a1 1 0 0 1-1-1z" />
        <circle cx="7.5" cy="16.5" r="1.4" />
        <circle cx="16.5" cy="16.5" r="1.4" />
      </svg>
    ),
    features: ["غسلتين خارجي شهريًا", "توفير 10% عن السعر العادي", "إلغاء في أي وقت"],
  },
  {
    id: "standard",
    name: "الباقة القياسية",
    washCount: 4,
    serviceLabel: "غسيل خارجي",
    price: 170,
    originalPrice: 200,
    badge: "الأكثر اشتراكًا",
    icon: (color: string) => (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M3 10h18M8 3v4M16 3v4" />
        <path d="M8 14l2 2 4-4" />
      </svg>
    ),
    features: ["4 غسلات خارجي شهريًا", "توفير 15% عن السعر العادي", "أولوية في الحجز", "إلغاء في أي وقت"],
  },
  {
    id: "premium",
    name: "الباقة المميزة",
    washCount: 4,
    serviceLabel: "غسيل كامل",
    price: 380,
    originalPrice: 480,
    icon: (color: string) => (
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l2.4 6.6L21 10l-5 4.3L17.4 21 12 17.6 6.6 21 8 14.3 3 10l6.6-1.4z" />
      </svg>
    ),
    features: ["4 غسلات كاملة (داخلي وخارجي) شهريًا", "توفير 20% عن السعر العادي", "أولوية في الحجز", "خدمات إضافية بخصم 10%", "إلغاء في أي وقت"],
  },
];

export default function SubscriptionsPage() {
  const router = useRouter();
  const { setPackage } = useSubscription();

  const handleSelect = (id: string) => {
    setPackage(id);
    router.push("/subscriptions/schedule");
  };

  return (
    <main className="min-h-dvh flex flex-col bg-bg-page">
      {/* العنوان */}
      <div className="px-6 pt-8 pb-5 flex flex-col gap-1">
        <h1 className="text-text-main text-2xl font-extrabold">الباقات الشهرية</h1>
        <p className="text-text-secondary text-sm">اشترك واستمتع بغسيل دوري لسيارتك بأفضل سعر</p>
      </div>

      {/* قائمة الباقات */}
      <div className="flex-1 flex flex-col gap-4 px-5 pb-8">
        {packages.map((pkg) => (
          <button
            key={pkg.id}
            onClick={() => handleSelect(pkg.id)}
            className="relative flex flex-col gap-4 rounded-2xl bg-white p-5 text-right shadow-[0_2px_10px_rgba(16,24,40,0.05)] border-[1.5px] border-transparent transition-all hover:border-primary"
          >
            {/* الرأس: أيقونة + اسم + بادچ */}
            <div className="flex items-center gap-3.5">
              <div className="shrink-0 w-13 h-13 rounded-2xl bg-primary-light flex items-center justify-center">
                {pkg.icon("#19B9C6")}
              </div>
              <div className="flex-1 flex flex-col gap-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-bold text-text-main">{pkg.name}</span>
                  {pkg.badge && (
                    <span className="text-[10px] font-bold text-primary bg-primary-light px-2 py-0.5 rounded-full">
                      {pkg.badge}
                    </span>
                  )}
                </div>
                <span className="text-text-secondary text-xs">
                  {pkg.washCount} × {pkg.serviceLabel} شهريًا
                </span>
              </div>
            </div>

            {/* السعر */}
            <div className="flex items-baseline gap-2">
              <span className="text-primary text-xl font-extrabold">{pkg.price} ر.س</span>
              <span className="text-text-secondary text-sm line-through">{pkg.originalPrice} ر.س</span>
              <span className="text-text-secondary text-xs">/ شهريًا</span>
            </div>

            {/* المميزات */}
            <div className="flex flex-col gap-2 pt-2 border-t border-[#EEF2F3]">
              {pkg.features.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#19B9C6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  <span className="text-text-main text-xs">{feature}</span>
                </div>
              ))}
            </div>
          </button>
        ))}
      </div>
    </main>
  );
}