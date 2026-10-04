"use client";

import { useEffect, useState } from "react";

type CarType = {
  id: string;
  name: string;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: string;
};

type Service = {
  id: string;
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
  isActive: boolean;
  carTypeId: string | null;
};

const emptyServiceForm = { name: "", description: "", price: "", durationMinutes: "" };

export default function CarTypesPage() {
  const [carTypes, setCarTypes] = useState<CarType[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // إضافة نوع سيارة
  const [newName, setNewName] = useState("");
  const [newImage, setNewImage] = useState<string | null>(null);
  const [submittingCarType, setSubmittingCarType] = useState(false);

  // إضافة خدمة
  const [addingForCarType, setAddingForCarType] = useState<string | null>(null);
  const [serviceForm, setServiceForm] = useState(emptyServiceForm);
  const [submittingService, setSubmittingService] = useState(false);

  // تعديل خدمة
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState(emptyServiceForm);
  const [savingEdit, setSavingEdit] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [carTypesRes, servicesRes] = await Promise.all([
        fetch("/api/admin/car-types"),
        fetch("/api/admin/services"),
      ]);
      setCarTypes(await carTypesRes.json());
      setServices(await servicesRes.json());
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
    if (!confirm("متأكد إنك عايز تحذف نوع السيارة ده؟ (لازم ملوش خدمات مرتبطة بيه الأول)")) return;
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

  const startAddService = (carTypeId: string) => {
    setAddingForCarType(carTypeId);
    setServiceForm(emptyServiceForm);
  };

  const cancelAddService = () => {
    setAddingForCarType(null);
    setServiceForm(emptyServiceForm);
  };

  const submitAddService = async () => {
    if (!addingForCarType || !serviceForm.name.trim() || !serviceForm.price || !serviceForm.durationMinutes) return;
    setSubmittingService(true);
    setError("");
    try {
      const res = await fetch("/api/admin/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...serviceForm, carTypeId: addingForCarType }),
      });
      if (!res.ok) throw new Error();
      setAddingForCarType(null);
      setServiceForm(emptyServiceForm);
      await loadData();
    } catch {
      setError("حدث خطأ أثناء إضافة الخدمة");
    } finally {
      setSubmittingService(false);
    }
  };

  const handleToggleServiceActive = async (id: string, current: boolean) => {
    try {
      await fetch(`/api/admin/services/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !current }),
      });
      await loadData();
    } catch {
      setError("حدث خطأ أثناء التعديل");
    }
  };

  const startEditService = (service: Service) => {
    setEditingId(service.id);
    setEditForm({
      name: service.name,
      description: service.description,
      price: String(service.price),
      durationMinutes: String(service.durationMinutes),
    });
  };

  const cancelEditService = () => setEditingId(null);

  const saveEditService = async (id: string) => {
    if (!editForm.name.trim() || !editForm.price || !editForm.durationMinutes) return;
    setSavingEdit(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/services/${id}`, {
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

  const handleDeleteService = async (id: string) => {
    if (!confirm("هل أنت متأكد من رغبتك في حذف الخدمة؟")) return;
    try {
      await fetch(`/api/admin/services/${id}`, { method: "DELETE" });
      await loadData();
    } catch {
      setError("حدث خطأ أثناء الحذف");
    }
  };

  const handleAssignCarType = async (serviceId: string, carTypeId: string) => {
    try {
      await fetch(`/api/admin/services/${serviceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ carTypeId }),
      });
      await loadData();
    } catch {
      setError("حدث خطأ أثناء ربط الخدمة بنوع السيارة");
    }
  };

  const unassignedServices = services.filter((s) => !s.carTypeId);

  return (
    <div className="p-8 flex flex-col gap-7">
      <div className="flex flex-col gap-1">
        <h1 className="text-text-main text-2xl font-extrabold">أنواع السيارات والخدمات</h1>
        <p className="text-text-secondary text-sm">إدارة أنواع السيارات وخدمات الغسيل الخاصة بكل نوع</p>
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
          const carTypeServices = services.filter((s) => s.carTypeId === carType.id);
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
                    <p className="text-text-secondary text-xs">{carTypeServices.length} خدمة</p>
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

              {/* خدمات النوع ده */}
              <div className="p-5 flex flex-col gap-3">
                {carTypeServices.length === 0 && addingForCarType !== carType.id && (
                  <p className="text-text-secondary text-sm text-center py-3">مفيش خدمات لنوع السيارة ده لسه</p>
                )}

                {carTypeServices.map((service) =>
                  editingId === service.id ? (
                    <div key={service.id} className="grid grid-cols-4 gap-2 bg-primary-light/30 rounded-xl p-3 items-center">
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="bg-white rounded-lg px-3 py-2 text-sm outline-none border border-[#EEF2F3]"
                        placeholder="اسم الخدمة"
                      />
                      <input
                        type="text"
                        value={editForm.description}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                        className="bg-white rounded-lg px-3 py-2 text-sm outline-none border border-[#EEF2F3]"
                        placeholder="وصف مختصر"
                      />
                      <input
                        type="number"
                        value={editForm.price}
                        onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                        className="bg-white rounded-lg px-3 py-2 text-sm outline-none border border-[#EEF2F3]"
                        placeholder="السعر"
                      />
                      <input
                        type="number"
                        value={editForm.durationMinutes}
                        onChange={(e) => setEditForm({ ...editForm, durationMinutes: e.target.value })}
                        className="bg-white rounded-lg px-3 py-2 text-sm outline-none border border-[#EEF2F3]"
                        placeholder="المدة (دقيقة)"
                      />
                      <div className="col-span-4 flex items-center gap-3 mt-1">
                        <button
                          onClick={() => saveEditService(service.id)}
                          disabled={savingEdit}
                          className="text-emerald-600 text-xs font-bold hover:underline disabled:opacity-50"
                        >
                          حفظ
                        </button>
                        <button onClick={cancelEditService} className="text-text-secondary text-xs font-bold hover:underline">
                          إلغاء
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div key={service.id} className="flex items-center justify-between border border-[#EEF2F3] rounded-xl px-4 py-3">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-text-main text-sm font-bold">{service.name}</span>
                          <button
                            onClick={() => handleToggleServiceActive(service.id, service.isActive)}
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              service.isActive ? "bg-emerald-50 text-emerald-600" : "bg-[#F4F7F8] text-text-secondary"
                            }`}
                          >
                            {service.isActive ? "مفعّل" : "متوقف"}
                          </button>
                        </div>
                        <span className="text-text-secondary text-xs">
                          {service.description} — {service.price} ر.س — {service.durationMinutes} دقيقة
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <button onClick={() => startEditService(service)} className="text-primary text-xs font-bold hover:underline">
                          تعديل
                        </button>
                        <button onClick={() => handleDeleteService(service.id)} className="text-red-500 text-xs font-bold hover:underline">
                          حذف
                        </button>
                      </div>
                    </div>
                  )
                )}

                {/* نموذج إضافة خدمة جديدة */}
                {addingForCarType === carType.id ? (
                  <div className="grid grid-cols-4 gap-2 bg-[#F4F7F8] rounded-xl p-3">
                    <input
                      type="text"
                      value={serviceForm.name}
                      onChange={(e) => setServiceForm({ ...serviceForm, name: e.target.value })}
                      placeholder="اسم الخدمة (مثال: غسيل خارجي)"
                      className="bg-white rounded-lg px-3 py-2 text-sm outline-none border border-[#EEF2F3]"
                    />
                    <input
                      type="text"
                      value={serviceForm.description}
                      onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })}
                      placeholder="وصف مختصر للخدمة"
                      className="bg-white rounded-lg px-3 py-2 text-sm outline-none border border-[#EEF2F3]"
                    />
                    <input
                      type="number"
                      value={serviceForm.price}
                      onChange={(e) => setServiceForm({ ...serviceForm, price: e.target.value })}
                      placeholder="السعر (ر.س)"
                      className="bg-white rounded-lg px-3 py-2 text-sm outline-none border border-[#EEF2F3]"
                    />
                    <input
                      type="number"
                      value={serviceForm.durationMinutes}
                      onChange={(e) => setServiceForm({ ...serviceForm, durationMinutes: e.target.value })}
                      placeholder="المدة (دقيقة)"
                      className="bg-white rounded-lg px-3 py-2 text-sm outline-none border border-[#EEF2F3]"
                    />
                    <div className="col-span-4 flex items-center gap-3 mt-1">
                      <button
                        onClick={submitAddService}
                        disabled={submittingService}
                        className="text-white bg-primary px-4 py-2 rounded-lg text-xs font-bold disabled:opacity-50"
                      >
                        {submittingService ? "جاري الحفظ..." : "حفظ الخدمة"}
                      </button>
                      <button onClick={cancelAddService} className="text-text-secondary text-xs font-bold hover:underline">
                        إلغاء
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => startAddService(carType.id)}
                    className="self-start text-primary text-xs font-bold hover:underline"
                  >
                    + إضافة خدمة لنوع السيارة ده
                  </button>
                )}
              </div>
            </div>
          );
        })
      )}

      {/* خدمات مش مربوطة بنوع سيارة */}
      {unassignedServices.length > 0 && (
        <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgba(16,24,40,0.05)] p-5 flex flex-col gap-3 border-2 border-amber-200">
          <div className="flex flex-col gap-1">
            <span className="text-text-main text-sm font-bold">⚠️ خدمات لسه مش مربوطة بنوع سيارة</span>
            <span className="text-text-secondary text-xs">اختار نوع السيارة المناسب لكل خدمة من القايمة جنبها</span>
          </div>
          {unassignedServices.map((service) => (
            <div key={service.id} className="flex items-center justify-between border border-[#EEF2F3] rounded-xl px-4 py-3">
              <div className="flex flex-col gap-0.5">
                <span className="text-text-main text-sm font-bold">{service.name}</span>
                <span className="text-text-secondary text-xs">
                  {service.description} — {service.price} ر.س
                </span>
              </div>
              <select
                defaultValue=""
                onChange={(e) => e.target.value && handleAssignCarType(service.id, e.target.value)}
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