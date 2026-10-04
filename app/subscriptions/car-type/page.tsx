"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSubscription } from "../../context/SubscriptionContext";

type CarType = {
  id: string;
  name: string;
  imageUrl: string | null;
};

export default function SubscriptionCarTypePage() {
  const router = useRouter();
  const { setCarType } = useSubscription();

  const [carTypes, setCarTypes] = useState<CarType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/car-types")
      .then((res) => res.json())
      .then((data) => setCarTypes(data))
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = (carType: CarType) => {
    setCarType({ id: carType.id, name: carType.name });
    router.push("/subscriptions");
  };

  return (
    <main className="h-dvh flex flex-col bg-bg-page overflow-hidden">
      <div className="px-6 pt-8 pb-5 flex flex-col gap-1 shrink-0">
        <h1 className="text-text-main text-2xl font-extrabold">اختر نوع سيارتك</h1>
        <p className="text-text-secondary text-sm">عشان نعرضلك الباقات المناسبة لسيارتك</p>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-3 px-5 pb-8">
        {loading ? (
          <p className="text-center text-text-secondary text-sm py-8">جاري التحميل...</p>
        ) : carTypes.length === 0 ? (
          <p className="text-center text-text-secondary text-sm py-8">لا توجد أنواع سيارات متاحة حاليًا</p>
        ) : (
          carTypes.map((carType) => (
            <button
              key={carType.id}
              onClick={() => handleSelect(carType)}
              className="flex items-center gap-4 rounded-2xl bg-white p-4 text-right shadow-[0_2px_10px_rgba(16,24,40,0.05)] border-[1.5px] border-transparent transition-all hover:border-primary"
            >
              {carType.imageUrl ? (
                <img src={carType.imageUrl} alt={carType.name} className="w-14 h-14 rounded-xl object-cover" />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-primary-light flex items-center justify-center text-primary text-xs">
                  صورة
                </div>
              )}
              <span className="text-base font-bold text-text-main">{carType.name}</span>
            </button>
          ))
        )}
      </div>
    </main>
  );
}