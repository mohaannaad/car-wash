"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSubscription } from "../../context/SubscriptionContext";

type District = { id: string; name: string; isActive: boolean };
type City = { id: string; name: string; isActive: boolean; districts: District[] };

export default function SubscriptionAreaStep() {
  const router = useRouter();
  const { setArea } = useSubscription();

  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCityId, setSelectedCityId] = useState<string | null>(null);
  const [selectedDistrictId, setSelectedDistrictId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/cities")
      .then((res) => res.json())
      .then((data) => setCities(data))
      .finally(() => setLoading(false));
  }, []);

  const selectedCity = cities.find((c) => c.id === selectedCityId);

  const handleSelectCity = (cityId: string) => {
    setSelectedCityId(cityId);
    setSelectedDistrictId(null);
  };

  const handleNext = () => {
    if (!selectedCity || !selectedDistrictId) return;
    const district = selectedCity.districts.find((d) => d.id === selectedDistrictId);
    if (!district) return;
    setArea({ cityId: selectedCity.id, cityName: selectedCity.name, districtId: district.id, districtName: district.name });
    router.push("/subscriptions/location");
  };

  return (
    <main className="h-dvh flex flex-col bg-bg-page overflow-hidden">
      <div className="px-6 pt-8 pb-5 flex flex-col gap-1 shrink-0">
        <h1 className="text-text-main text-2xl font-extrabold">موقعك</h1>
        <p className="text-text-secondary text-sm">اختر المدينة والحي لمعرفة إذا كانت خدمتنا متاحة لديك</p>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-6 px-5">
        {loading ? (
          <p className="text-center text-text-secondary text-sm py-8">جارٍ التحميل...</p>
        ) : cities.length === 0 ? (
          <div className="bg-white rounded-2xl p-5 text-center shadow-[0_2px_10px_rgba(16,24,40,0.05)]">
            <p className="text-text-main text-sm font-bold mb-1">الخدمة غير متاحة بمدينتك حاليًا</p>
            <p className="text-text-secondary text-xs">هنتوفر قريبًا جدًا في مدن جديدة، تابعنا</p>
          </div>
        ) : (
          <>
            <div>
              <span className="text-text-main text-sm font-bold mb-3 block">المدينة</span>
              <div className="grid grid-cols-2 gap-2.5">
                {cities.map((city) => {
                  const isSelected = selectedCityId === city.id;
                  return (
                    <button
                      key={city.id}
                      onClick={() => handleSelectCity(city.id)}
                      className={`py-3.5 rounded-2xl text-sm font-bold transition-all ${
                        isSelected ? "bg-primary text-white shadow-[0_6px_16px_rgba(25,185,198,0.3)]" : "bg-white text-text-main shadow-[0_2px_10px_rgba(16,24,40,0.05)]"
                      }`}
                    >
                      {city.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedCity && (
              <div>
                <span className="text-text-main text-sm font-bold mb-3 block">الحي</span>
                {selectedCity.districts.length === 0 ? (
                  <div className="bg-white rounded-2xl p-5 text-center shadow-[0_2px_10px_rgba(16,24,40,0.05)]">
                    <p className="text-text-main text-sm font-bold mb-1">لا توجد أحياء متاحة في {selectedCity.name} حاليًا</p>
                    <p className="text-text-secondary text-xs">هنتوفر قريبًا جدًا، تابعنا</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2.5">
                    {selectedCity.districts.map((district) => {
                      const isSelected = selectedDistrictId === district.id;
                      return (
                        <button
                          key={district.id}
                          onClick={() => setSelectedDistrictId(district.id)}
                          className={`py-3.5 rounded-2xl text-sm font-bold transition-all ${
                            isSelected ? "bg-primary text-white shadow-[0_6px_16px_rgba(25,185,198,0.3)]" : "bg-white text-text-main shadow-[0_2px_10px_rgba(16,24,40,0.05)]"
                          }`}
                        >
                          {district.name}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      <div className="px-5 pt-4 pb-8 shrink-0">
        <button
          onClick={handleNext}
          disabled={!selectedCityId || !selectedDistrictId}
          className={`w-full py-4 rounded-2xl font-bold text-white transition-colors ${
            selectedCityId && selectedDistrictId ? "bg-primary shadow-[0_8px_20px_rgba(25,185,198,0.35)]" : "bg-disabled cursor-not-allowed"
          }`}
        >
          التالي
        </button>
      </div>
    </main>
  );
}