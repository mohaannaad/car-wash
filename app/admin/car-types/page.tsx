"use client";

import { useEffect, useState } from "react";

type CarType = {
  id: string;
  name: string;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: string;
};

type Package = {
  id: string;
  name: string;
  washCount: number;
  serviceLabel: string;
  price: number;
  originalPrice: number;
  badge: string | null;
  isActive: boolean;
  carTypeId: string | null;
};

const emptyPackageForm = { name: "", washCount: "", serviceLabel: "", price: "", originalPrice: "", badge: "" };

export default function CarTypesPage() {
  const [carTypes, setCarTypes] = useState<CarType[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // إضافة نوع سيارة
  const [newName, setNewName] = useState("");
  const [newImage, setNewImage] = useState<string | null>(null);
  const [submittingCarType, setSubmittingCarType] = useState(false);

  // إضافة باقة
  const [addingForCarType, setAddingForCarType] = useState<string | null>(null);
  const [packageForm, setPackageForm] = useState(emptyPackageForm);
  const [submittingPackage, setSubmittingPackage] = useState(false);

  // تعديل باقة
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState(emptyPackageForm);
  const [savingEdit, setSavingEdit] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [carTypesRes, packagesRes] = await Promise.all([
        fetch("/api/admin/car-types"),
        fetch("/api/admin/packages"),
      ]);
      setCarTypes(await carTypesRes.json());
      setPackages(await packagesRes.json());
    } catch {
      setError("حصل خطأ في تحميل البيانات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleImageSelect = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setNewImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleAddCarType = async () => {
    if (!newName.trim()) return;
    setSubmittingCarType(true);
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
      await loadData();
    } catch {
      setError("حصل خطأ في الإضافة");
    } finally {
      setSubmittingCarType(false);
    }
  };

  const handleToggleCarTypeActive = async (id: string, current: boolean) => {
    try {
      await fetch(`/api/admin/car-types/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !current }),
      });
      await loadData();
    } catch {
      setError("حصل خطأ في التعديل");
    }
  };

  const handleDeleteCarType = async (id: string) => {
    if (!confirm("متأكد إنك عايز تحذف نوع السيارة ده؟ (لازم ملوش باقات مرتبطة بيه الأول)")) return;
    try {
      const res = await fetch(`/api/admin/car-types/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "حصل خطأ في الحذف");
        return;
      }
      setError("");
      await loadData();
    } catch {
      setError("حصل خطأ في الحذف");
    }
  };

  const startAddPackage = (carTypeId: string) => {
    setAddingForCarType(carTypeId);
    setPackageForm(emptyPackageForm);
  };

  const cancelAddPackage = () => {
    setAddingForCarType(null);
    setPackageForm(emptyPackageForm);
  };

  const submitAddPackage = async () => {
    if (!addingForCarType || !packageForm.name.trim() || !packageForm.washCount || !packageForm.price || !packageForm.originalPrice) return;
    setSubmittingPackage(true);
    setError("");
    try {
      const res = await fetch("/api/admin/packages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...packageForm, features: [], carTypeId: addingForCarType }),
      });
      if (!res.ok) throw new Error();
      setAddingForCarType(null);
      setPackageForm(emptyPackageForm);
      await loadData();
    } catch {
      setError("حدث خطأ أثناء إضافة الباقة");
    } finally {
      setSubmittingPackage(false);
    }
  };

  const handleTogglePackageActive = async (id: string, current: boolean) => {
    try {
      await fetch(`/api/admin/packages/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !current }),
      });
      await loadData();
    } catch {
      setError("حدث خطأ أثناء التعديل");
    }
  };

  const startEditPackage = (pkg: Package) => {
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

  const cancelEditPackage = () => setEditingId(null);

  const saveEditPackage = async (id: string) => {
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
      await loadData();
    } catch {
      setError("حدث خطأ أثناء حفظ التعديل");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeletePackage = async (id: string) => {
    if (!confirm("هل أنت متأكد من رغبتك في حذف الباقة؟")) return;
    try {
      await fetch(`/api/admin/packages/${id}`, { method: "DELETE" });
      await loadData();
    } catch {
      setError("حدث خطأ أثناء الحذف");
    }
  };

  const handleAssignCarType = async (packageId: string, carTypeId: string) => {
    try {
      await fetch(`/api/admin/packages/${packageId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ carTypeId }),
      });
      await loadData();
    } catch {
      setError("حدث خطأ أثناء ربط الباقة بنوع السيارة");
    }
  };

  const unassignedPackages = packages.filter((p) => !p.carTypeId);

  return (
    <div className="p-8 flex flex-col gap-7">
      <div className="flex flex-col gap-1">
        <h1 className="text-text-main text-2xl font-extrabold">أنواع السيارات والباقات</h1>
        <p className="text-text-secondary text-sm">إدارة أنواع السيارات وباقات كل نوع منها</p>
      </div>

      {/* نموذج إضافة نوع سيارة */}
      <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_rgba(16,24,40,0.05)] flex flex-col gap-4">
        <span className="text-text-main text-sm font-bold">إضافة نوع سيارة جديد</span>
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="اسم نوع السيارة (مثال: سيدان)"
            className="flex-1 bg-[#F4F7F8] rounded-xl px-4 py-3 text-sm outline-none placeholder:text-[#98A2B3]"
          />
          <button
            onClick={handleAddCarType}
            disabled={submittingCarType || !newName.trim()}
            className={`px-6 py-3 rounded-xl font-bold text-white text-sm transition-colors ${
              submittingCarType || !newName.trim() ? "bg-disabled cursor-not-allowed" : "bg-primary"
            }`}
          >
            {submittingCarType ? "جاري الإضافة..." : "+ إضافة"}
          </button>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 bg-[#F4F7F8] rounded-xl px-4 py-3 text-sm text-text-secondary cursor-pointer hover:bg-primary-light hover:text-primary transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 16l4.6-4.6a2 2 0 0 1 2.8 0L16 16M14 14l1.6-1.6a2 2 0 0 1 2.8 0L20 14M4 8h.01M6 20h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z" />
            </svg>
            اختر صورة (اختياري)
            <input type="file" accept="image/*" onChange={(e) => handleImageSelect(e.target.files?.[0])} className="hidden" />
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

      {loading ? (
        <div className="bg-white rounded-2xl p-8 text-center text-text-secondary text-sm">جاري التحميل...</div>
      ) : carTypes.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center text-text-secondary text-sm">مفيش أنواع سيارات مضافة لسه</div>
      ) : (
        carTypes.map((carType) => {
          const carTypePackages = packages.filter((p) => p.carTypeId === carType.id);
          return (
            <div key={carType.id} className="bg-white rounded-2xl shadow-[0_2px_10px_rgba(16,24,40,0.05)] overflow-hidden">
              {/* رأس نوع السيارة */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#EEF2F3] bg-[#FAFBFC]">
                <div className="flex items-center gap-3">
                  {carType.imageUrl ? (
                    <img src={carType.imageUrl} alt={carType.name} className="w-12 h-12 rounded-lg object-cover border border-[#EEF2F3]" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-[#F4F7F8] flex items-center justify-center text-text-secondary text-[10px]">
                      لا يوجد
                    </div>
                  )}
                  <div>
                    <p className="text-text-main text-base font-extrabold">{carType.name}</p>
                    <p className="text-text-secondary text-xs">{carTypePackages.length} باقة</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleToggleCarTypeActive(carType.id, carType.isActive)}
                    className={`text-xs font-bold px-3 py-1 rounded-full ${
                      carType.isActive ? "bg-emerald-50 text-emerald-600" : "bg-[#F4F7F8] text-text-secondary"
                    }`}
                  >
                    {carType.isActive ? "مفعّل" : "متوقف"}
                  </button>
                  <button onClick={() => handleDeleteCarType(carType.id)} className="text-red-500 text-xs font-bold hover:underline">
                    حذف النوع
                  </button>
                </div>
              </div>

              {/* باقات النوع ده */}
              <div className="p-5 flex flex-col gap-3">
                {carTypePackages.length === 0 && addingForCarType !== carType.id && (
                  <p className="text-text-secondary text-sm text-center py-3">مفيش باقات لنوع السيارة ده لسه</p>
                )}

                {carTypePackages.map((pkg) =>
                  editingId === pkg.id ? (
                    <div key={pkg.id} className="grid grid-cols-6 gap-2 bg-primary-light/30 rounded-xl p-3 items-center">
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="col-span-2 bg-white rounded-lg px-3 py-2 text-sm outline-none border border-[#EEF2F3]"
                        placeholder="اسم الباقة"
                      />
                      <input
                        type="text"
                        value={editForm.serviceLabel}
                        onChange={(e) => setEditForm({ ...editForm, serviceLabel: e.target.value })}
                        className="bg-white rounded-lg px-3 py-2 text-sm outline-none border border-[#EEF2F3]"
                        placeholder="نوع الخدمة"
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
                      <input
                        type="number"
                        value={editForm.price}
                        onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                        className="bg-white rounded-lg px-3 py-2 text-sm outline-none border border-[#EEF2F3]"
                        placeholder="السعر"
                      />
                      <input
                        type="number"
                        value={editForm.originalPrice}
                        onChange={(e) => setEditForm({ ...editForm, originalPrice: e.target.value })}
                        className="bg-white rounded-lg px-3 py-2 text-sm outline-none border border-[#EEF2F3]"
                        placeholder="السعر الأصلي"
                      />
                      <div className="col-span-6 flex items-center gap-3 mt-1">
                        <button
                          onClick={() => saveEditPackage(pkg.id)}
                          disabled={savingEdit}
                          className="text-emerald-600 text-xs font-bold hover:underline disabled:opacity-50"
                        >
                          حفظ
                        </button>
                        <button onClick={cancelEditPackage} className="text-text-secondary text-xs font-bold hover:underline">
                          إلغاء
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div key={pkg.id} className="flex items-center justify-between border border-[#EEF2F3] rounded-xl px-4 py-3">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-text-main text-sm font-bold">{pkg.name}</span>
                          <button
                            onClick={() => handleTogglePackageActive(pkg.id, pkg.isActive)}
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              pkg.isActive ? "bg-emerald-50 text-emerald-600" : "bg-[#F4F7F8] text-text-secondary"
                            }`}
                          >
                            {pkg.isActive ? "مفعّل" : "متوقف"}
                          </button>
                        </div>
                        <span className="text-text-secondary text-xs">
                          {pkg.washCount} × {pkg.serviceLabel} — {pkg.price} ر.س
                          <span className="line-through mr-1">{pkg.originalPrice}</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <button onClick={() => startEditPackage(pkg)} className="text-primary text-xs font-bold hover:underline">
                          تعديل
                        </button>
                        <button onClick={() => handleDeletePackage(pkg.id)} className="text-red-500 text-xs font-bold hover:underline">
                          حذف
                        </button>
                      </div>
                    </div>
                  )
                )}

                {/* نموذج إضافة باقة جديدة */}
                {addingForCarType === carType.id ? (
                  <div className="grid grid-cols-3 gap-2 bg-[#F4F7F8] rounded-xl p-3">
                    <input
                      type="text"
                      value={packageForm.name}
                      onChange={(e) => setPackageForm({ ...packageForm, name: e.target.value })}
                      placeholder="اسم الباقة"
                      className="bg-white rounded-lg px-3 py-2 text-sm outline-none border border-[#EEF2F3]"
                    />
                    <select
                      value={packageForm.washCount}
                      onChange={(e) => setPackageForm({ ...packageForm, washCount: e.target.value })}
                      className="bg-white rounded-lg px-3 py-2 text-sm outline-none border border-[#EEF2F3]"
                    >
                      <option value="">عدد الغسلات</option>
                      {[2, 3, 4].map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={packageForm.serviceLabel}
                      onChange={(e) => setPackageForm({ ...packageForm, serviceLabel: e.target.value })}
                      placeholder="نوع الخدمة"
                      className="bg-white rounded-lg px-3 py-2 text-sm outline-none border border-[#EEF2F3]"
                    />
                    <input
                      type="number"
                      value={packageForm.price}
                      onChange={(e) => setPackageForm({ ...packageForm, price: e.target.value })}
                      placeholder="السعر بعد الخصم"
                      className="bg-white rounded-lg px-3 py-2 text-sm outline-none border border-[#EEF2F3]"
                    />
                    <input
                      type="number"
                      value={packageForm.originalPrice}
                      onChange={(e) => setPackageForm({ ...packageForm, originalPrice: e.target.value })}
                      placeholder="السعر الأصلي"
                      className="bg-white rounded-lg px-3 py-2 text-sm outline-none border border-[#EEF2F3]"
                    />
                    <input
                      type="text"
                      value={packageForm.badge}
                      onChange={(e) => setPackageForm({ ...packageForm, badge: e.target.value })}
                      placeholder="بادچ (اختياري)"
                      className="bg-white rounded-lg px-3 py-2 text-sm outline-none border border-[#EEF2F3]"
                    />
                    <div className="col-span-3 flex items-center gap-3 mt-1">
                      <button
                        onClick={submitAddPackage}
                        disabled={submittingPackage}
                        className="text-white bg-primary px-4 py-2 rounded-lg text-xs font-bold disabled:opacity-50"
                      >
                        {submittingPackage ? "جاري الحفظ..." : "حفظ الباقة"}
                      </button>
                      <button onClick={cancelAddPackage} className="text-text-secondary text-xs font-bold hover:underline">
                        إلغاء
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => startAddPackage(carType.id)}
                    className="self-start text-primary text-xs font-bold hover:underline"
                  >
                    + إضافة باقة لنوع السيارة ده
                  </button>
                )}
              </div>
            </div>
          );
        })
      )}

      {/* باقات مش مربوطة بنوع سيارة */}
      {unassignedPackages.length > 0 && (
        <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgba(16,24,40,0.05)] p-5 flex flex-col gap-3 border-2 border-amber-200">
          <div className="flex flex-col gap-1">
            <span className="text-text-main text-sm font-bold">⚠️ باقات لسه مش مربوطة بنوع سيارة</span>
            <span className="text-text-secondary text-xs">اختار نوع السيارة المناسب لكل باقة من القايمة جنبها</span>
          </div>
          {unassignedPackages.map((pkg) => (
            <div key={pkg.id} className="flex items-center justify-between border border-[#EEF2F3] rounded-xl px-4 py-3">
              <div className="flex flex-col gap-0.5">
                <span className="text-text-main text-sm font-bold">{pkg.name}</span>
                <span className="text-text-secondary text-xs">
                  {pkg.washCount} × {pkg.serviceLabel} — {pkg.price} ر.س
                </span>
              </div>
              <select
                defaultValue=""
                onChange={(e) => e.target.value && handleAssignCarType(pkg.id, e.target.value)}
                className="bg-[#F4F7F8] rounded-lg px-3 py-2 text-sm outline-none border border-[#EEF2F3]"
              >
                <option value="">اختر نوع السيارة...</option>
                {carTypes.map((ct) => (
                  <option key={ct.id} value={ct.id}>{ct.name}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}