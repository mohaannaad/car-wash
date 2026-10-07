// app/api/admin/sms-test/route.ts  (مؤقت — هنمسحه بعد التجربة)
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSmsInfo, sendSms } from "../../../../lib/sms";

export async function GET(req: Request) {
  const store = await cookies();
  if (!store.get("admin_session")) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const url = new URL(req.url);
  const to = url.searchParams.get("to");
  const src = url.searchParams.get("src") || undefined;

  // بدون ?to=  → يعرض أسماء المرسل المتاحة والرصيد
  if (!to) {
    return NextResponse.json(await getSmsInfo());
  }

  const result = await sendSms(
    to,
    "تجربة من غسلة ولمعة: تم تأكيد حجزك بنجاح ✅",
    src
  );
  return NextResponse.json(result);
}