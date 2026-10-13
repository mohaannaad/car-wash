// app/api/admin/sms-test/route.ts  (مؤقت للتشخيص - هنمسحه بعد ما نخلص)
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSmsInfo, sendSms, normalizeSaPhone, type MsgClass } from "../../../../lib/sms";

export async function GET(req: Request) {
  const store = await cookies();
  if (!store.get("admin_session")) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const url = new URL(req.url);
  const to = url.searchParams.get("to");
  const cls = url.searchParams.get("cls");
  const msgClass: MsgClass | undefined =
    cls === "transactional" || cls === "promotional" ? cls : undefined;

  const env = {
    hasApiKey: !!process.env.SMS_API_KEY,
    apiKeyLength: process.env.SMS_API_KEY?.length ?? 0,
    senderId: process.env.SMS_SENDER_ID ?? null,
    hasAdminAlertPhone: !!process.env.ADMIN_ALERT_PHONE,
  };

  if (!to) {
    return NextResponse.json({ env, info: await getSmsInfo() });
  }

  const result = await sendSms(
    to,
    "تجربة من غسلة ولمعة: تم تأكيد حجزك بنجاح",
    undefined,
    msgClass
  );
  return NextResponse.json({
    env,
    normalized: normalizeSaPhone(to),
    msgClass: msgClass ?? null,
    ...result,
  });
}
