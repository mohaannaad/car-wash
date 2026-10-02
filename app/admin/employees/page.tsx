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
};

export default function EmployeesPage() {
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
                <th className="px-6 py-3 text-text-secondary text-xs font-bold whitespace-nowrap">المنطقة</th>
                <th className="px-6 py-3 text-text-secondary text-xs font-bold whitespace-nowrap">الحالة</th>
                <th className="px-6 py-3 text-text-secondary text-xs font-bold whitespace-nowrap">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => (
                <tr key={employee.id} className="border-t border-[#EEF2F3]">
                  <td className="px-6 py-4 text-text-main text-sm font-bold whitespace-nowrap">{employee.name}</td>
                  <td className="px-6 py-4 text-text-secondary text-sm whitespace-nowrap" dir="ltr">{employee.phone}</td>
                  <td className="px-6 py-4 text-text-secondary text-sm whitespace-nowrap">{employee.role}</td>
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
    </div>
  );
}