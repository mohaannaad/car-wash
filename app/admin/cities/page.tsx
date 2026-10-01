"use client";

import { useEffect, useState } from "react";

type District = { id: string; name: string; isActive: boolean };
type City = { id: string; name: string; isActive: boolean; districts: District[] };

export default function CitiesPage() {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newCityName, setNewCityName] = useState("");
  const [submittingCity, setSubmittingCity] = useState(false);
  const [districtInputs, setDistrictInputs] = useState<Record<string, string>>({});
  const [submittingDistrict, setSubmittingDistrict] = useState<string | null>(null);

  const loadCities = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/cities");
      setCities(await res.json());
    } catch {
      setError("حدث خطأ أثناء تحميل البيانات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCities();
  }, []);

  const handleAddCity = async () => {
    if (!newCityName.trim()) return;
    setSubmittingCity(true);
    setError("");
    try {
      const res = await fetch("/api/admin/cities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCityName.trim() }),
      });
      if (!res.ok) throw new Error();
      setNewCityName("");
      await loadCities();
    } catch {
      setError("حدث خطأ أثناء إضافة المدينة");
    } finally {
      setSubmittingCity(false);
    }
  };

  const handleToggleCity = async (id: string, current: boolean) => {
    try {
      await fetch(`/api/admin/cities/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !current }),
      });
      await loadCities();
    } catch {
      setError("حدث خطأ أثناء التعديل");
    }
  };

  const handleDeleteCity = async (id: string) => {
    if (!confirm("هل أنت متأكد من رغبتك في حذف هذه المدينة؟")) return;
    try {
      const res = await fetch(`/api/admin/cities/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "فشل في الحذف");
        return;
      }
      setError("");
      await loadCities();
    } catch {
      setError("حدث خطأ أثناء الحذف");
    }
  };

  const handleAddDistrict = async (cityId: string) => {
    const name = districtInputs[cityId]?.trim();
    if (!name) return;
    setSubmittingDistrict(cityId);
    setError("");
    try {
      const res = await fetch("/api/admin/districts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, cityId }),
      });
      if (!res.ok) throw new Error();
      setDistrictInputs((prev) => ({ ...prev, [cityId]: "" }));
      await loadCities();
    } catch {
      setError("حدث خطأ أثناء إضافة الحي");
    } finally {
      setSubmittingDistrict(null);
    }
  };

  const handleToggleDistrict = async (id: string, current: boolean) => {
    try {
      await fetch(`/api/admin/districts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !current }),
      });
      await loadCities();
    } catch {
      setError("حدث خطأ أثناء التعديل");
    }
  };

  const handleDeleteDistrict = async (id: string) => {
    if (!confirm("هل أنت متأكد من رغبتك في حذف هذا الحي؟")) return;
    try {
      const res = await fetch(`/api/admin/districts/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "فشل في الحذف");
        return;
      }
      setError("");
      await loadCities();
    } catch {
      setError("حدث خطأ أثناء الحذف");
    }
  };

  return (
    <div className="p-8 flex flex-col gap-7">
      <div className="flex flex-col gap-1">
        <h1 className="text-text-main text-2xl font-extrabold">المدن والأحياء</h1>
        <p className="text-text-secondary text-sm">إدارة المدن والأحياء المتاحة للعملاء، ولتحديد منطقة كل موظف</p>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_rgba(16,24,40,0.05)] flex items-center gap-3">
        <input
          type="text"
          value={newCityName}
          onChange={(e) => setNewCityName(e.target.value)}
          placeholder="اسم المدينة (مثال: الرياض)"
          className="flex-1 bg-[#F4F7F8] rounded-xl px-4 py-3 text-sm outline-none placeholder:text-[#98A2B3]"
        />
        <button
          onClick={handleAddCity}
          disabled={submittingCity || !newCityName.trim()}
          className={`px-6 py-3 rounded-xl font-bold text-white text-sm transition-colors ${
            submittingCity || !newCityName.trim() ? "bg-disabled cursor-not-allowed" : "bg-primary"
          }`}
        >
          {submittingCity ? "جارٍ الإضافة..." : "+ إضافة مدينة"}
        </button>
      </div>

      {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

      <div className="flex flex-col gap-4">
        {loading ? (
          <div className="bg-white rounded-2xl p-8 text-center text-text-secondary text-sm shadow-[0_2px_10px_rgba(16,24,40,0.05)]">جارٍ التحميل...</div>
        ) : cities.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-text-secondary text-sm shadow-[0_2px_10px_rgba(16,24,40,0.05)]">لا توجد مدن مضافة بعد</div>
        ) : (
          cities.map((city) => (
            <div key={city.id} className="bg-white rounded-2xl shadow-[0_2px_10px_rgba(16,24,40,0.05)] overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#EEF2F3]">
                <span className="text-text-main text-base font-extrabold">{city.name}</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleToggleCity(city.id, city.isActive)}
                    className={`text-xs font-bold px-3 py-1 rounded-full ${
                      city.isActive ? "bg-emerald-50 text-emerald-600" : "bg-[#F4F7F8] text-text-secondary"
                    }`}
                  >
                    {city.isActive ? "مفعّلة" : "متوقفة"}
                  </button>
                  <button onClick={() => handleDeleteCity(city.id)} className="text-red-500 text-xs font-bold hover:underline">
                    حذف المدينة
                  </button>
                </div>
              </div>

              <div className="p-5 flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={districtInputs[city.id] || ""}
                    onChange={(e) => setDistrictInputs((prev) => ({ ...prev, [city.id]: e.target.value }))}
                    placeholder="اسم الحي (مثال: العليا)"
                    className="flex-1 bg-[#F4F7F8] rounded-xl px-4 py-2.5 text-sm outline-none placeholder:text-[#98A2B3]"
                  />
                  <button
                    onClick={() => handleAddDistrict(city.id)}
                    disabled={submittingDistrict === city.id || !districtInputs[city.id]?.trim()}
                    className={`px-4 py-2.5 rounded-xl font-bold text-white text-xs whitespace-nowrap transition-colors ${
                      submittingDistrict === city.id || !districtInputs[city.id]?.trim() ? "bg-disabled cursor-not-allowed" : "bg-primary"
                    }`}
                  >
                    + إضافة حي
                  </button>
                </div>

                {city.districts.length === 0 ? (
                  <p className="text-text-secondary text-xs">لا توجد أحياء مضافة لهذه المدينة بعد</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {city.districts.map((district) => (
                      <div
                        key={district.id}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold ${
                          district.isActive ? "bg-primary-light text-primary" : "bg-[#F4F7F8] text-text-secondary"
                        }`}
                      >
                        <span>{district.name}</span>
                        <button onClick={() => handleToggleDistrict(district.id, district.isActive)} className="opacity-70 hover:opacity-100">
                          {district.isActive ? "إيقاف" : "تفعيل"}
                        </button>
                        <button onClick={() => handleDeleteDistrict(district.id)} className="text-red-500 opacity-70 hover:opacity-100">
                          حذف
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}