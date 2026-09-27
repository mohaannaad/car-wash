"use client";

import { useEffect, useState } from "react";

type CarType = {
  id: string;
  name: string;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: string;
};

export default function CarTypesPage() {
  const [carTypes, setCarTypes] = useState<CarType[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [newImage, setNewImage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const loadCarTypes = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/car-types");
      const data = await res.json();
      setCarTypes(data);
    } catch {
      setError("حصل خطأ في تحميل البيانات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCarTypes();
  }, []);

  const handleImageSelect = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setNewImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleAdd = async () => {
    if (!newName.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/admin/car-types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim(), imageUrl: newImage }),
      });
      if (!res.ok) throw new Error();
      setNewName("");
      setNewImage(null);
      await loadCarTypes();
    } catch {
      setError("حصل خطأ في الإضافة");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (id: string, current: boolean) => {
    try {
      await fetch(`/api/admin/car-types/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !current }),
      });
      await loadCarTypes();
    } catch {
      setError("حصل خطأ في التعديل");
    }
  };

  const handleDelete = async (id: string) => {
  if (!confirm("متأكد إنك عايز تحذف نوع السيارة ده؟")) return;
  try {
    const res = await fetch(`/api/admin/car-types/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "حصل خطأ في الحذف");
      return;
    }
    setError("");
    await loadCarTypes();
  } catch {
    setError("حصل خطأ في الحذف");
  }
};

  return (
    <div className="p-8 flex flex-col gap-7">
      {/* العنوان */}
      <div className="flex flex-col gap-1">
        <h1 className="text-text-main text-2xl font-extrabold">أنواع السيارات</h1>
        <p className="text-text-secondary text-sm">إدارة أنواع السيارات المتاحة للعملاء وقت الحجز</p>
      </div>

      {/* نموذج الإضافة */}
      <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_rgba(16,24,40,0.05)] flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="اسم نوع السيارة (مثال: سيدان)"
            className="flex-1 bg-[#F4F7F8] rounded-xl px-4 py-3 text-sm outline-none placeholder:text-[#98A2B3]"
          />
          <button
            onClick={handleAdd}
            disabled={submitting || !newName.trim()}
            className={`px-6 py-3 rounded-xl font-bold text-white text-sm transition-colors ${
              submitting || !newName.trim() ? "bg-disabled cursor-not-allowed" : "bg-primary"
            }`}
          >
            {submitting ? "جاري الإضافة..." : "+ إضافة"}
          </button>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 bg-[#F4F7F8] rounded-xl px-4 py-3 text-sm text-text-secondary cursor-pointer hover:bg-primary-light hover:text-primary transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 16l4.6-4.6a2 2 0 0 1 2.8 0L16 16M14 14l1.6-1.6a2 2 0 0 1 2.8 0L20 14M4 8h.01M6 20h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z" />
            </svg>
            اختر صورة (اختياري)
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageSelect(e.target.files?.[0])}
              className="hidden"
            />
          </label>
          {newImage && (
            <div className="flex items-center gap-2">
              <img src={newImage} alt="preview" className="w-12 h-12 rounded-lg object-cover border border-[#EEF2F3]" />
              <button onClick={() => setNewImage(null)} className="text-red-500 text-xs font-bold hover:underline">
                إزالة الصورة
              </button>
            </div>
          )}
        </div>
      </div>

      {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

      {/* جدول أنواع السيارات */}
      <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgba(16,24,40,0.05)] overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-text-secondary text-sm">جاري التحميل...</div>
        ) : carTypes.length === 0 ? (
          <div className="p-8 text-center text-text-secondary text-sm">مفيش أنواع سيارات مضافة لسه</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-right border-b border-[#EEF2F3]">
                <th className="px-6 py-3 text-text-secondary text-xs font-bold">الصورة</th>
                <th className="px-6 py-3 text-text-secondary text-xs font-bold">الاسم</th>
                <th className="px-6 py-3 text-text-secondary text-xs font-bold">الحالة</th>
                <th className="px-6 py-3 text-text-secondary text-xs font-bold">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {carTypes.map((carType) => (
                <tr key={carType.id} className="border-t border-[#EEF2F3]">
                  <td className="px-6 py-4">
                    {carType.imageUrl ? (
                      <img src={carType.imageUrl} alt={carType.name} className="w-12 h-12 rounded-lg object-cover border border-[#EEF2F3]" />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-[#F4F7F8] flex items-center justify-center text-text-secondary text-[10px]">
                        لا يوجد
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-text-main text-sm font-bold">{carType.name}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleActive(carType.id, carType.isActive)}
                      className={`text-xs font-bold px-3 py-1 rounded-full ${
                        carType.isActive
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-[#F4F7F8] text-text-secondary"
                      }`}
                    >
                      {carType.isActive ? "مفعّل" : "متوقف"}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleDelete(carType.id)}
                      className="text-red-500 text-xs font-bold hover:underline"
                    >
                      حذف
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}