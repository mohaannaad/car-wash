"use client";

import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/customers");
      setCustomers(await res.json());
    } catch {
      setError("حدث خطأ أثناء تحميل البيانات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredCustomers = customers.filter((c) => {
    if (!normalizedQuery) return true;
    return c.phone.toLowerCase().includes(normalizedQuery) || c.name.toLowerCase().includes(normalizedQuery);
  });

  const handleDelete = async (id: string) => {
      if (!confirm("هل أنت متأكد من رغبتك في حذف هذا العميل؟ طلباته واشتراكاته السابقة ستبقى محفوظة في سجل الطلبات.")) return;
    setError("");
    try {
      const res = await fetch(`/api/admin/customers/${id}`, { method: "DELETE" });
      if (!res.ok) {
        setError("فشل في الحذف");
        return;
      }
      await loadCustomers();
    } catch {
      setError("حدث خطأ أثناء الحذف");
    }
  };

   const handleDeleteAll = async () => {
    if (!confirm("هل أنت متأكد من رغبتك في حذف كل العملاء؟ طلباتهم واشتراكاتهم السابقة ستبقى محفوظة في سجل الطلبات.")) return;
    setBulkDeleting(true);
    setError("");
    try {
      const res = await fetch("/api/admin/customers/bulk-delete", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "فشل في حذف العملاء");
        return;
      }
      await loadCustomers();
      alert(`تم حذف ${data.deletedCount} عميل بنجاح.`);
    } catch {
      setError("حدث خطأ أثناء الحذف");
    } finally {
      setBulkDeleting(false);
    }
  };

  const handleDownloadPdf = () => {
    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text("Customers List - Ghasla Walamma", 14, 15);

    autoTable(doc, {
      startY: 22,
      head: [["Name", "Phone", "Orders", "Total Spent (SAR)", "Registered"]],
      body: filteredCustomers.map((c) => [
        c.name,
        c.phone,
        String(c.ordersCount),
        String(c.totalSpent),
        new Date(c.createdAt).toLocaleDateString("en-GB"),
      ]),
      styles: { fontSize: 9 },
      headStyles: { fillColor: [25, 185, 198] },
    });

    doc.save(`customers-${new Date().toISOString().split("T")[0]}.pdf`);
  };

  return (
    <div className="p-8 flex flex-col gap-7">
      <div className="flex flex-col gap-1">
        <h1 className="text-text-main text-2xl font-extrabold">العملاء</h1>
        <p className="text-text-secondary text-sm">قاعدة بيانات العملاء الذين طلبوا من الموقع.</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 bg-white rounded-2xl p-4 shadow-[0_2px_10px_rgba(16,24,40,0.05)] flex items-center gap-3">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#98A2B3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.3-4.3" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث برقم الجوال أو اسم العميل"
            className="flex-1 text-sm outline-none placeholder:text-[#98A2B3]"
            dir="ltr"
            style={{ textAlign: "right" }}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="text-text-secondary text-xs font-bold hover:text-red-500">
              مسح
            </button>
          )}
        </div>

        <button
          onClick={handleDownloadPdf}
          disabled={filteredCustomers.length === 0}
          className="px-5 py-4 rounded-2xl font-bold text-primary bg-primary-light text-sm whitespace-nowrap disabled:opacity-50"
        >
          تحميل PDF
        </button>

        <button
          onClick={handleDeleteAll}
          disabled={bulkDeleting || customers.length === 0}
          className="px-5 py-4 rounded-2xl font-bold text-red-500 bg-red-50 text-sm whitespace-nowrap disabled:opacity-50"
        >
          {bulkDeleting ? "جارٍ الحذف..." : "حذف الكل"}
        </button>
      </div>

      {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

      <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgba(16,24,40,0.05)] overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-text-secondary text-sm">جارٍ التحميل...</div>
        ) : filteredCustomers.length === 0 ? (
          <div className="p-8 text-center text-text-secondary text-sm">
            {customers.length === 0 ? "لا يوجد عملاء مسجلون بعد" : "لا توجد نتائج مطابقة للبحث"}
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-right border-b border-[#EEF2F3]">
                <th className="px-6 py-3 text-text-secondary text-xs font-bold">الاسم</th>
                <th className="px-6 py-3 text-text-secondary text-xs font-bold">رقم الجوال</th>
                <th className="px-6 py-3 text-text-secondary text-xs font-bold">عدد الطلبات</th>
                <th className="px-6 py-3 text-text-secondary text-xs font-bold">إجمالي المصروفات</th>
                <th className="px-6 py-3 text-text-secondary text-xs font-bold">تاريخ التسجيل</th>
                <th className="px-6 py-3 text-text-secondary text-xs font-bold">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="border-t border-[#EEF2F3]">
                  <td className="px-6 py-4 text-text-main text-sm font-bold">{customer.name}</td>
                  <td className="px-6 py-4 text-text-secondary text-sm" dir="ltr">{customer.phone}</td>
                  <td className="px-6 py-4 text-text-secondary text-sm">{customer.ordersCount}</td>
                  <td className="px-6 py-4 text-text-main text-sm font-bold">{customer.totalSpent} ر.س</td>
                  <td className="px-6 py-4 text-text-secondary text-sm">
                    {new Date(customer.createdAt).toLocaleDateString("ar-EG", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-6 py-4">
                    <button onClick={() => handleDelete(customer.id)} className="text-red-500 text-xs font-bold hover:underline">
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