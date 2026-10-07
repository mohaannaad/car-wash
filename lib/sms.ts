// lib/sms.ts
// إرسال رسائل SMS عبر Bevatel

const API_URL = "https://sms-api.bevatel.com";

// يحوّل أي رقم سعودي (05xxxxxxxx / +9665xxxxxxxx / ٠٥...) إلى 9665xxxxxxxx
export function normalizeSaPhone(raw: string): string | null {
  const arabicDigits = "٠١٢٣٤٥٦٧٨٩";
  let d = String(raw || "")
    .replace(/[٠-٩]/g, (c) => String(arabicDigits.indexOf(c)))
    .replace(/[^\d]/g, "");
  if (d.startsWith("00")) d = d.slice(2);
  if (d.startsWith("966")) d = d.slice(3);
  if (d.startsWith("0")) d = d.slice(1);
  if (!/^5\d{8}$/.test(d)) return null;
  return "966" + d;
}

export type SmsResult = {
  ok: boolean;
  status: number;
  data: unknown;
  error?: string;
};

// لا يرمي أخطاء أبداً — حتى لو فشل الإرسال ما يتأثرش الحجز
export async function sendSms(
  phone: string,
  text: string,
  sender?: string
): Promise<SmsResult> {
  const token = process.env.SMS_API_KEY;
  const src = sender || process.env.SMS_SENDER_ID;

  if (!token) return { ok: false, status: 0, data: null, error: "SMS_API_KEY غير موجود" };
  if (!src) return { ok: false, status: 0, data: null, error: "SMS_SENDER_ID غير موجود" };

  const dest = normalizeSaPhone(phone);
  if (!dest) return { ok: false, status: 0, data: null, error: "رقم الجوال غير صحيح" };

  try {
    const res = await fetch(`${API_URL}/msgs/sms`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        src,
        dests: [dest],
        body: text,
        msgClass: "transactional",
      }),
    });
    const raw = await res.text();
    let data: unknown = raw;
    try {
      data = JSON.parse(raw);
    } catch {}
    return { ok: res.ok, status: res.status, data };
  } catch (e) {
    return { ok: false, status: 0, data: null, error: String(e) };
  }
}

// قائمة أسماء المرسل المتاحة في حسابك + الرصيد (للتجربة)
export async function getSmsInfo() {
  const token = process.env.SMS_API_KEY;
  if (!token) return { error: "SMS_API_KEY غير موجود" };
  const headers = { Authorization: `Bearer ${token}` };
  try {
    const [srcs, credits] = await Promise.all([
      fetch(`${API_URL}/addresses/srcs`, { headers }).then((r) => r.text()),
      fetch(`${API_URL}/billing/credits`, { headers }).then((r) => r.text()),
    ]);
    return { senders: srcs, credits };
  } catch (e) {
    return { error: String(e) };
  }
}