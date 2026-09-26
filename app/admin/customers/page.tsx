"use client";

import { useEffect, useState } from "react";

type Customer = {
  id: string;
  name: string;
  phone: string;
  createdAt: string;
  ordersCount: number;
  totalSpent: number;
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/customers")
      .then((res) => res.json())
      .then((data) => setCustomers(data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8 flex flex-col gap-7">
      <div className="flex flex-col gap-1">
        <h1 className="text-text-main text-2xl font-extrabold">العملاء</h1>
        <p className="text-text-secondary text-sm">قاعدة بيانات العملاء اللي طلبوا من الموقع</p>
      </div>

      <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgba(16,24,40,0.05)] overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-text-secondary text-sm">جاري التحميل...</div>
        ) : customers.length === 0 ? (
          <div className="p-8 text-center text-text-secondary text-sm">مفيش عملاء مسجلين لسه</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-right border-b border-[#EEF2F3]">
                <th className="px-6 py-3 text-text-secondary text-xs font-bold">الاسم</th>
                <th className="px-6 py-3 text-text-secondary text-xs font-bold">رقم الجوال</th>
                <th className="px-6 py-3 text-text-secondary text-xs font-bold">عدد الطلبات</th>
                <th className="px-6 py-3 text-text-secondary text-xs font-bold">إجمالي المصروفات</th>
                <th className="px-6 py-3 text-text-secondary text-xs font-bold">تاريخ التسجيل</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id} className="border-t border-[#EEF2F3]">
                  <td className="px-6 py-4 text-text-main text-sm font-bold">{customer.name}</td>
                  <td className="px-6 py-4 text-text-secondary text-sm" dir="ltr">{customer.phone}</td>
                  <td className="px-6 py-4 text-text-secondary text-sm">{customer.ordersCount}</td>
                  <td className="px-6 py-4 text-text-main text-sm font-bold">{customer.totalSpent} ر.س</td>
                  <td className="px-6 py-4 text-text-secondary text-sm">
                    {new Date(customer.createdAt).toLocaleDateString("ar-EG", { day: "numeric", month: "short", year: "numeric" })}
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