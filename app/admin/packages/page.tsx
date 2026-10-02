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

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    washCount: "",
    serviceLabel: "",
    price: "",
    originalPrice: "",
    badge: "",
  });
  const [savingEdit, setSavingEdit] = useState(false);

  const loadPackages = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/packages");
      setPackages(await res.json());
    } catch {
      setError("حدث خطأ أثناء تحميل البيانات");
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
      setError("حدث خطأ أثناء الإضافة");
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
      setError("حدث خطأ أثناء التعديل");
    }
  };

  const startEdit = (pkg: Package) => {
    setEditingId(pkg.id);
    setEditForm({
      name: pkg.name,
      washCount: String(pkg.washCount),
      serviceLabel: pkg.serviceLabel,
      price: String(pkg.price),
      originalPrice: String(pkg.originalPrice),
      badge: pkg.badge || "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async (id: string) => {
    if (!editForm.name.trim() || !editForm.washCount || !editForm.price || !editForm.originalPrice) return;
    setSavingEdit(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/packages/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (!res.ok) throw new Error();
      setEditingId(null);
      await loadPackages();
    } catch {
      setError("حدث خطأ أثناء حفظ التعديل");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من رغبتك في حذف الباقة؟")) return;
    try {
      await fetch(`/api/admin/packages/${id}`, { method: "DELETE" });
      await loadPackages();
    } catch {
      setError("حدث خطأ أثناء الحذف");
    }
  };

  return (
    <div className="p-8 flex flex-col gap-7">
      <div className="flex flex-col gap-1">
        <h1 className="text-text-main text-2xl font-extrabold">الباقات الشهرية</h1>
        <p className="text-text-secondary text-sm">إدارة باقات الاشتراك الشهري وأسعارها</p>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_rgba(16,24,40,0.05)] flex flex-col gap-3">
        <div className="grid grid-cols-3 gap-3">
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="اسم الباقة"
            className="bg-[#F4F7F8] rounded-xl px-4 py-3 text-sm outline-none placeholder:text-[#98A2B3]"
          />

          <div className="flex flex-col gap-1.5">
            <span className="text-text-secondary text-xs px-1">عدد الأيام في الشهر</span>
            <div className="grid grid-cols-3 gap-2">
              {[2, 3, 4].map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setForm({ ...form, washCount: String(count) })}
                  className={`py-3 rounded-xl text-sm font-bold transition-colors ${
                    form.washCount === String(count) ? "bg-primary text-white" : "bg-[#F4F7F8] text-text-main"
                  }`}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>

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
          {submitting ? "جارٍ الإضافة..." : "+ إضافة باقة"}
        </button>
      </div>

      {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

      <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgba(16,24,40,0.05)] overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-text-secondary text-sm">جارٍ التحميل...</div>
        ) : packages.length === 0 ? (
          <div className="p-8 text-center text-text-secondary text-sm">لا توجد باقات مضافة بعد</div>
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
              {packages.map((pkg) =>
                editingId === pkg.id ? (
                  <tr key={pkg.id} className="border-t border-[#EEF2F3] bg-primary-light/30">
                    <td className="px-6 py-3">
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="bg-white rounded-lg px-3 py-2 text-sm outline-none border border-[#EEF2F3] w-full"
                      />
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editForm.serviceLabel}
                          onChange={(e) => setEditForm({ ...editForm, serviceLabel: e.target.value })}
                          placeholder="نوع الخدمة"
                          className="bg-white rounded-lg px-3 py-2 text-sm outline-none border border-[#EEF2F3] w-24"
                        />
                        <select
                          value={editForm.washCount}
                          onChange={(e) => setEditForm({ ...editForm, washCount: e.target.value })}
                          className="bg-white rounded-lg px-2 py-2 text-sm outline-none border border-[#EEF2F3]"
                        >
                          {[2, 3, 4].map((c) => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={editForm.price}
                          onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                          placeholder="بعد الخصم"
                          className="bg-white rounded-lg px-3 py-2 text-sm outline-none border border-[#EEF2F3] w-20"
                        />
                        <input
                          type="number"
                          value={editForm.originalPrice}
                          onChange={(e) => setEditForm({ ...editForm, originalPrice: e.target.value })}
                          placeholder="الأصلي"
                          className="bg-white rounded-lg px-3 py-2 text-sm outline-none border border-[#EEF2F3] w-20"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-3 text-text-secondary text-xs">—</td>
                    <td className="px-6 py-3 flex items-center gap-3">
                      <button
                        onClick={() => saveEdit(pkg.id)}
                        disabled={savingEdit}
                        className="text-emerald-600 text-xs font-bold hover:underline disabled:opacity-50"
                      >
                        حفظ
                      </button>
                      <button onClick={cancelEdit} className="text-text-secondary text-xs font-bold hover:underline">
                        إلغاء
                      </button>
                    </td>
                  </tr>
                ) : (
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
                    <td className="px-6 py-4 flex items-center gap-3">
                      <button onClick={() => startEdit(pkg)} className="text-primary text-xs font-bold hover:underline flex items-center gap-1">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                        تعديل
                      </button>
                      <button onClick={() => handleDelete(pkg.id)} className="text-red-500 text-xs font-bold hover:underline">
                        حذف
                      </button>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}