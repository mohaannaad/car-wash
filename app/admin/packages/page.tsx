"use client";

import { useEffect, useState } from "react";

type Package = {
  id: string;
  name: string;
  washCount: number;
  serviceLabel: string;
  price: number;
  originalPrice: number;
  badge: string | null;
  isActive: boolean;
};

export default function PackagesPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    washCount: "",
    serviceLabel: "",
    price: "",
    originalPrice: "",
    badge: "",
  });

  const loadPackages = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/packages");
      setPackages(await res.json());
    } catch {
      setError("حصل خطأ في تحميل البيانات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPackages();
  }, []);

  const handleAdd = async () => {
    if (!form.name.trim() || !form.washCount || !form.price || !form.originalPrice) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/admin/packages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, features: [] }),
      });
      if (!res.ok) throw new Error();
      setForm({ name: "", washCount: "", serviceLabel: "", price: "", originalPrice: "", badge: "" });
      await loadPackages();
    } catch {
      setError("حصل خطأ في الإضافة");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (id: string, current: boolean) => {
    try {
      await fetch(`/api/admin/packages/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !current }),
      });
      await loadPackages();
    } catch {
      setError("حصل خطأ في التعديل");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("متأكد إنك عايز تحذف الباقة دي؟")) return;
    try {
      await fetch(`/api/admin/packages/${id}`, { method: "DELETE" });
      await loadPackages();
    } catch {
      setError("حصل خطأ في الحذف");
    }
  };

  return (
    <div className="p-8 flex flex-col gap-7">
      <div className="flex flex-col gap-1">
        <h1 className="text-text-main text-2xl font-extrabold">الباقات الشهرية</h1>
        <p className="text-text-secondary text-sm">إدارة باقات الاشتراك الشهري وأسعارها</p>
      </div>

      {/* نموذج الإضافة */}
      <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_rgba(16,24,40,0.05)] flex flex-col gap-3">
        <div className="grid grid-cols-3 gap-3">
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="اسم الباقة"
            className="bg-[#F4F7F8] rounded-xl px-4 py-3 text-sm outline-none placeholder:text-[#98A2B3]"
          />
          <input
            type="number"
            value={form.washCount}
            onChange={(e) => setForm({ ...form, washCount: e.target.value })}
            placeholder="عدد الغسلات شهريًا"
            className="bg-[#F4F7F8] rounded-xl px-4 py-3 text-sm outline-none placeholder:text-[#98A2B3]"
          />
          <input
            type="text"
            value={form.serviceLabel}
            onChange={(e) => setForm({ ...form, serviceLabel: e.target.value })}
            placeholder="نوع الخدمة (مثال: غسيل خارجي)"
            className="bg-[#F4F7F8] rounded-xl px-4 py-3 text-sm outline-none placeholder:text-[#98A2B3]"
          />
          <input
            type="number"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            placeholder="السعر بعد الخصم"
            className="bg-[#F4F7F8] rounded-xl px-4 py-3 text-sm outline-none placeholder:text-[#98A2B3]"
          />
          <input
            type="number"
            value={form.originalPrice}
            onChange={(e) => setForm({ ...form, originalPrice: e.target.value })}
            placeholder="السعر الأصلي"
            className="bg-[#F4F7F8] rounded-xl px-4 py-3 text-sm outline-none placeholder:text-[#98A2B3]"
          />
          <input
            type="text"
            value={form.badge}
            onChange={(e) => setForm({ ...form, badge: e.target.value })}
            placeholder="بادچ (اختياري، مثال: الأكثر طلبًا)"
            className="bg-[#F4F7F8] rounded-xl px-4 py-3 text-sm outline-none placeholder:text-[#98A2B3]"
          />
        </div>
        <button
          onClick={handleAdd}
          disabled={submitting || !form.name.trim() || !form.washCount || !form.price || !form.originalPrice}
          className={`self-start px-6 py-3 rounded-xl font-bold text-white text-sm transition-colors ${
            submitting || !form.name.trim() || !form.washCount || !form.price || !form.originalPrice
              ? "bg-disabled cursor-not-allowed"
              : "bg-primary"
          }`}
        >
          {submitting ? "جاري الإضافة..." : "+ إضافة باقة"}
        </button>
      </div>

      {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

      {/* جدول الباقات */}
      <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgba(16,24,40,0.05)] overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-text-secondary text-sm">جاري التحميل...</div>
        ) : packages.length === 0 ? (
          <div className="p-8 text-center text-text-secondary text-sm">مفيش باقات مضافة لسه</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-right border-b border-[#EEF2F3]">
                <th className="px-6 py-3 text-text-secondary text-xs font-bold">الاسم</th>
                <th className="px-6 py-3 text-text-secondary text-xs font-bold">عدد الغسلات</th>
                <th className="px-6 py-3 text-text-secondary text-xs font-bold">السعر</th>
                <th className="px-6 py-3 text-text-secondary text-xs font-bold">الحالة</th>
                <th className="px-6 py-3 text-text-secondary text-xs font-bold">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {packages.map((pkg) => (
                <tr key={pkg.id} className="border-t border-[#EEF2F3]">
                  <td className="px-6 py-4 text-text-main text-sm font-bold">{pkg.name}</td>
                  <td className="px-6 py-4 text-text-secondary text-sm">{pkg.washCount} × {pkg.serviceLabel}</td>
                  <td className="px-6 py-4 text-text-main text-sm font-bold">
                    {pkg.price} ر.س <span className="text-text-secondary text-xs line-through">{pkg.originalPrice}</span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleActive(pkg.id, pkg.isActive)}
                      className={`text-xs font-bold px-3 py-1 rounded-full ${
                        pkg.isActive ? "bg-emerald-50 text-emerald-600" : "bg-[#F4F7F8] text-text-secondary"
                      }`}
                    >
                      {pkg.isActive ? "مفعّل" : "متوقف"}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleDelete(pkg.id)}
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