export type When = "past" | "today" | "upcoming";

// تاريخ النهارده بتوقيت الرياض بصيغة YYYY-MM-DD
export function riyadhTodayKey(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Riyadh" });
}

// هل موعد الطلب فات، النهارده، ولا لسه جاي
export function whenOf(date: Date | string): When {
  const key = new Date(date).toISOString().slice(0, 10);
  const today = riyadhTodayKey();
  if (key < today) return "past";
  if (key === today) return "today";
  return "upcoming";
}