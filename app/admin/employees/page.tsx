"use client";

import { useEffect, useState } from "react";

type District = { id: string; name: string; isActive: boolean };
type City = { id: string; name: string; isActive: boolean; districts: District[] };

type Employee = {
  id: string;
  name: string;
  phone: string;
  role: string;
  isActive: boolean;
  districtId: string | null;
  onShift?: boolean;
  ratingAvg?: number | null;
  ratingCount?: number;
};

type LocationInfo = {
  onShift: boolean;
  name?: string;
  phone?: string;
  onBreak?: boolean;
  startedAt?: string;
  lat?: number | null;
  lng?: number | null;
  accuracy?: number | null;
  updatedAt?: string | null;
};

function agoText(iso: string) {
  const min = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (min < 1) return "الآن";
  if (min < 60) return `منذ ${min} دقيقة`;
  const h = Math.floor(min / 60);
  return `منذ ${h} ساعة`;
}

function LocationModal({ employee, onClose }: { employee: Employee; onClose: () => void }) {
  const [info, setInfo] = useState<LocationInfo | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const res = await fetch(`/api/admin/employees/${employee.id}/location`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        if (alive) {
          setInfo(data);
          setFailed(false);
        }
      } catch {
        if (alive) setFailed(true);
      }
    };
    load();
    const t = setInterval(load, 15000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, [employee.id]);

  const hasPos = info?.onShift && typeof info.lat === "number" && typeof info.lng === "number";
  const d = 0.004;
  const mapSrc = hasPos
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${info!.lng! - d}%2C${info!.lat! - d}%2C${
        info!.lng! + d
      }%2C${info!.lat! + d}&layer=mapnik&marker=${info!.lat}%2C${info!.lng}`
    : "";
  const stale = info?.updatedAt ? Date.now() - new Date(info.updatedAt).getTime() > 5 * 60000 : false;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-6"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-2xl p-6 flex flex-col gap-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <h2 className="text-text-main text-lg font-extrabold">موقع {employee.name}</h2>
            <span className="text-text-secondary text-xs" dir="ltr">{employee.phone}</span>
          </div>
          <button onClick={onClose} className="text-text-secondary text-2xl leading-none px-2">×</button>
        </div>

        {!info && !failed && (
          <div className="py-10 text-center text-text-secondary text-sm">جارٍ التحميل...</div>
        )}
        {failed && !info && (
          <div className="py-10 text-center text-red-500 text-sm">تعذر جلب الموقع، حاول مرة تانية</div>
        )}

        {info && !info.onShift && (
          <div className="py-10 text-center text-text-secondary text-sm font-bold">
            الموظف خارج الدوام حالياً، التتبع متاح أثناء الدوام فقط
          </div>
        )}

        {info?.onShift && !hasPos && (
          <div className="py-10 text-center text-amber-600 text-sm font-bold leading-7">
            الموقع لم يصل بعد.
            <br />
            تأكد أن الموظف فاتح صفحة حسابه وسامح للمتصفح بالوصول للموقع.
            {info.onBreak && <><br />الموظف في استراحة حالياً.</>}
          </div>
        )}

        {hasPos && (
          <>
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
              <span
                className={`px-3 py-1 rounded-full ${
                  info!.onBreak ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"
                }`}
              >
                {info!.onBreak ? "في استراحة" : "على رأس العمل"}
              </span>
              {info!.updatedAt && (
                <span
                  className={`px-3 py-1 rounded-full ${
                    stale ? "bg-red-50 text-red-500" : "bg-[#F4F7F8] text-text-secondary"
                  }`}
                >
                  آخر تحديث: {agoText(info!.updatedAt)}
                </span>
              )}
              {typeof info!.accuracy === "number" && (
                <span className="px-3 py-1 rounded-full bg-[#F4F7F8] text-text-secondary">
                  الدقة ≈ {Math.round(info!.accuracy)} م
                </span>
              )}
            </div>

            <iframe
              key={mapSrc}
              src={mapSrc}
              title="موقع الموظف"
              className="w-full h-[360px] rounded-xl border border-[#EEF2F3]"
              loading="lazy"
            />

            <div className="flex items-center justify-between">
              <span className="text-text-secondary text-xs">يتحدث تلقائياً كل 15 ثانية</span>
              <a
                href={`https://www.google.com/maps?q=${info!.lat},${info!.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary text-sm font-bold hover:underline"
              >
                فتح في خرائط جوجل ↗
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function EmployeesPage() {
  const [locationFor, setLocationFor] = useState<Employee | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({ name: "", phone: "", role: "", password: "", cityId: "", districtId: "" });

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/employees");
      setEmployees(await res.json());
    } catch {
      setError("حدث خطأ أثناء تحميل البيانات");
    } finally {
      setLoading(false);
    }
  };

  const loadCities = async () => {
    try {
      const res = await fetch("/api/admin/cities");
      setCities(await res.json());
    } catch {
      // تجاهل
    }
  };

  useEffect(() => {
    loadEmployees();
    loadCities();
  }, []);

  const activeCities = cities.filter((c) => c.isActive);
const districtsForSelectedCity = (activeCities.find((c) => c.id === form.cityId)?.districts || []).filter((d) => d.isActive);
const allDistricts = activeCities.flatMap((c) =>
  c.districts.filter((d) => d.isActive).map((d) => ({ ...d, cityName: c.name }))
);

  const handleAdd = async () => {
    if (!form.name.trim() || !form.phone.trim() || !form.role.trim() || !form.password.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/admin/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          role: form.role,
          password: form.password,
          districtId: form.districtId || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "فشل في الإضافة");
      }
      setForm({ name: "", phone: "", role: "", password: "", cityId: "", districtId: "" });
      await loadEmployees();
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ أثناء الإضافة");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (id: string, current: boolean) => {
    try {
      await fetch(`/api/admin/employees/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !current }),
      });
      await loadEmployees();
    } catch {
      setError("حدث خطأ أثناء التعديل");
    }
  };

  const handleDistrictChange = async (id: string, districtId: string) => {
    try {
      await fetch(`/api/admin/employees/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ districtId: districtId || null }),
      });
      await loadEmployees();
    } catch {
      setError("حدث خطأ أثناء التعديل");
    }
  };

  const handleResetPassword = async (id: string, name: string) => {
    const newPassword = window.prompt(`اكتب باسورد جديد للموظف "${name}" (6 أحرف على الأقل):`);
    if (!newPassword) return;
    if (newPassword.trim().length < 6) {
      alert("الباسورد قصير جدًا، لازم 6 أحرف على الأقل");
      return;
    }
    try {
      const res = await fetch(`/api/admin/employees/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword.trim() }),
      });
      if (!res.ok) throw new Error();
      alert("تم تغيير الباسورد بنجاح");
    } catch {
      setError("حدث خطأ أثناء تغيير الباسورد");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من رغبتك في حذف الموظف؟")) return;
    try {
      await fetch(`/api/admin/employees/${id}`, { method: "DELETE" });
      await loadEmployees();
    } catch {
      setError("حدث خطأ أثناء الحذف");
    }
  };

  return (
    <div className="p-8 flex flex-col gap-7">
      <div className="flex flex-col gap-1">
        <h1 className="text-text-main text-2xl font-extrabold">الموظفين</h1>
        <p className="text-text-secondary text-sm">
          إدارة فريق العمل ومنطقة عمل كل موظف، وحسابات دخولهم على{" "}
          <span dir="ltr" className="font-bold text-primary">washksa.com/staff</span>
        </p>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_rgba(16,24,40,0.05)] flex flex-col gap-3">
        <div className="grid grid-cols-3 gap-3">
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="اسم الموظف"
            className="bg-[#F4F7F8] rounded-xl px-4 py-3 text-sm outline-none placeholder:text-[#98A2B3]"
          />
          <input
            type="text"
            dir="ltr"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="رقم الجوال (اسم الدخول)"
            className="bg-[#F4F7F8] rounded-xl px-4 py-3 text-sm outline-none placeholder:text-[#98A2B3] text-right"
          />
          <input
            type="text"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            placeholder="الوظيفة (مثال: فني غسيل)"
            className="bg-[#F4F7F8] rounded-xl px-4 py-3 text-sm outline-none placeholder:text-[#98A2B3]"
          />
          <input
            type="text"
            dir="ltr"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="باسورد الدخول"
            className="bg-[#F4F7F8] rounded-xl px-4 py-3 text-sm outline-none placeholder:text-[#98A2B3] text-right"
          />
          <select
  value={form.cityId}
  onChange={(e) => setForm({ ...form, cityId: e.target.value, districtId: "" })}
  className="bg-[#F4F7F8] rounded-xl px-4 py-3 text-sm outline-none"
>
  <option value="">اختر المدينة</option>
  {activeCities.map((city) => (
    <option key={city.id} value={city.id}>{city.name}</option>
  ))}
</select>
          <select
            value={form.districtId}
            onChange={(e) => setForm({ ...form, districtId: e.target.value })}
            disabled={!form.cityId}
            className="bg-[#F4F7F8] rounded-xl px-4 py-3 text-sm outline-none disabled:opacity-50"
          >
            <option value="">اختر الحي</option>
            {districtsForSelectedCity.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
        <button
          onClick={handleAdd}
          disabled={submitting || !form.name.trim() || !form.phone.trim() || !form.role.trim() || !form.password.trim()}
          className={`self-start px-6 py-3 rounded-xl font-bold text-white text-sm transition-colors ${
            submitting || !form.name.trim() || !form.phone.trim() || !form.role.trim() || !form.password.trim()
              ? "bg-disabled cursor-not-allowed"
              : "bg-primary"
          }`}
        >
          {submitting ? "جارٍ الإضافة..." : "+ إضافة موظف"}
        </button>
      </div>

      {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

      <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgba(16,24,40,0.05)] overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-text-secondary text-sm">جارٍ التحميل...</div>
        ) : employees.length === 0 ? (
          <div className="p-8 text-center text-text-secondary text-sm">لا يوجد موظفون مضافون بعد</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-right border-b border-[#EEF2F3]">
                <th className="px-6 py-3 text-text-secondary text-xs font-bold whitespace-nowrap">الاسم</th>
                <th className="px-6 py-3 text-text-secondary text-xs font-bold whitespace-nowrap">رقم الجوال</th>
                <th className="px-6 py-3 text-text-secondary text-xs font-bold whitespace-nowrap">الوظيفة</th>
                <th className="px-6 py-3 text-text-secondary text-xs font-bold whitespace-nowrap">التقييم</th>
                <th className="px-6 py-3 text-text-secondary text-xs font-bold whitespace-nowrap">المنطقة</th>
                <th className="px-6 py-3 text-text-secondary text-xs font-bold whitespace-nowrap">الحالة</th>
                <th className="px-6 py-3 text-text-secondary text-xs font-bold whitespace-nowrap">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => (
                <tr key={employee.id} className="border-t border-[#EEF2F3]">
                  <td className="px-6 py-4 text-text-main text-sm font-bold whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span>{employee.name}</span>
                      <button
                        onClick={() => employee.onShift && setLocationFor(employee)}
                        disabled={!employee.onShift}
                        title={employee.onShift ? "عرض موقع الموظف" : "الموظف خارج الدوام"}
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                          employee.onShift
                            ? "bg-primary/10 text-primary hover:bg-primary/20 cursor-pointer"
                            : "bg-[#F4F7F8] text-[#C5CCD3] cursor-not-allowed"
                        }`}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z" />
                          <circle cx="12" cy="9.5" r="2.5" />
                        </svg>
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-text-secondary text-sm whitespace-nowrap" dir="ltr">{employee.phone}</td>
                  <td className="px-6 py-4 text-text-secondary text-sm whitespace-nowrap">{employee.role}</td>
                  <td className="px-6 py-4 text-sm whitespace-nowrap">
                    {employee.ratingCount && employee.ratingAvg != null ? (
                      <span className="text-amber-600 font-bold">
                        ★ {employee.ratingAvg.toFixed(1)}{" "}
                        <span className="text-text-secondary text-xs font-normal">({employee.ratingCount})</span>
                      </span>
                    ) : (
                      <span className="text-text-secondary text-xs">لا يوجد</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={employee.districtId || ""}
                      onChange={(e) => handleDistrictChange(employee.id, e.target.value)}
                      className="text-xs font-bold px-3 py-1.5 rounded-full outline-none cursor-pointer bg-[#F4F7F8] text-text-main"
                    >
                      <option value="">بدون تحديد</option>
                      {allDistricts.map((d) => (
                        <option key={d.id} value={d.id}>{d.cityName} - {d.name}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggleActive(employee.id, employee.isActive)}
                      className={`text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap ${
                        employee.isActive ? "bg-emerald-50 text-emerald-600" : "bg-[#F4F7F8] text-text-secondary"
                      }`}
                    >
                      {employee.isActive ? "شغال" : "متوقف"}
                    </button>
                  </td>
                  <td className="px-6 py-4 flex items-center gap-3">
                    <button onClick={() => handleResetPassword(employee.id, employee.name)} className="text-primary text-xs font-bold hover:underline whitespace-nowrap">
                      تغيير الباسورد
                    </button>
                    <button onClick={() => handleDelete(employee.id)} className="text-red-500 text-xs font-bold hover:underline whitespace-nowrap">
                      حذف
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {locationFor && <LocationModal employee={locationFor} onClose={() => setLocationFor(null)} />}
    </div>
  );
}