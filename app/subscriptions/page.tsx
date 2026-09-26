"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSubscription } from "../context/SubscriptionContext";

type Package = {
  id: string;
  name: string;
  washCount: number;
  serviceLabel: string;
  price: number;
  originalPrice: number;
  badge: string | null;
  features: string[];
};

export default function SubscriptionsPage() {
  const router = useRouter();
  const { setPackage } = useSubscription();

  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/packages")
      .then((res) => res.json())
      .then((data) => setPackages(data))
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = (pkg: Package) => {
    setPackage({ id: pkg.id, name: pkg.name, washCount: pkg.washCount, serviceLabel: pkg.serviceLabel, price: pkg.price });
    router.push("/subscriptions/schedule");
  };

  return (
    <main className="h-dvh flex flex-col bg-bg-page overflow-hidden">
      <div className="px-6 pt-8 pb-5 flex flex-col gap-1 shrink-0">
        <h1 className="text-text-main text-2xl font-extrabold">الباقات الشهرية</h1>
        <p className="text-text-secondary text-sm">اشترك واستمتع بغسيل دوري لسيارتك بأفضل سعر</p>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-4 px-5 pb-8">
        {loading ? (
          <p className="text-center text-text-secondary text-sm py-8">جاري التحميل...</p>
        ) : packages.length === 0 ? (
          <p className="text-center text-text-secondary text-sm py-8">لا توجد باقات متاحة حاليًا</p>
        ) : (
          packages.map((pkg) => (
            <button
              key={pkg.id}
              onClick={() => handleSelect(pkg)}
              className="relative flex flex-col gap-4 rounded-2xl bg-white p-5 text-right shadow-[0_2px_10px_rgba(16,24,40,0.05)] border-[1.5px] border-transparent transition-all hover:border-primary"
            >
              <div className="flex items-center gap-3.5">
                <div className="shrink-0 w-13 h-13 rounded-2xl bg-primary-light flex items-center justify-center">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#19B9C6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2l2.4 6.6L21 10l-5 4.3L17.4 21 12 17.6 6.6 21 8 14.3 3 10l6.6-1.4z" />
                  </svg>
                </div>
                <div className="flex-1 flex flex-col gap-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base font-bold text-text-main">{pkg.name}</span>
                    {pkg.badge && (
                      <span className="text-[10px] font-bold text-primary bg-primary-light px-2 py-0.5 rounded-full">{pkg.badge}</span>
                    )}
                  </div>
                  <span className="text-text-secondary text-xs">{pkg.washCount} × {pkg.serviceLabel} شهريًا</span>
                </div>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-primary text-xl font-extrabold">{pkg.price} ر.س</span>
                <span className="text-text-secondary text-sm line-through">{pkg.originalPrice} ر.س</span>
                <span className="text-text-secondary text-xs">/ شهريًا</span>
              </div>

              {pkg.features.length > 0 && (
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
              )}
            </button>
          ))
        )}
      </div>
    </main>
  );
}