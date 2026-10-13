import { NextResponse } from "next/server";
import { resendSms } from "../../../../../../lib/smsEvents";

// إعادة إرسال رسالة سابقة يدوياً (بنفس النص والرقم) وتسجيلها كمحاولة جديدة
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await resendSms(id);
    if (!result.ok) {
      return NextResponse.json({ error: result.error || "فشل الإرسال" }, { status: 502 });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "تعذر إعادة الإرسال" }, { status: 500 });
  }
}
