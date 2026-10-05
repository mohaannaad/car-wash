import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { put, del } from "@vercel/blob";
import { prisma } from "../../../../lib/prisma";
import { REQUIRED_SPOT_KEYS } from "../../../../lib/photoSpots";

const MAX_BYTES = 4 * 1024 * 1024;

async function getEmployeeId() {
  const store = await cookies();
  return store.get("employee_session")?.value ?? null;
}

async function ownsTask(kind: string, id: string, employeeId: string) {
  if (kind === "order") {
    const o = await prisma.order.findUnique({ where: { id }, select: { employeeId: true } });
    return !!o && o.employeeId === employeeId;
  }
  if (kind === "wash") {
    const w = await prisma.subscriptionWash.findUnique({ where: { id }, select: { employeeId: true } });
    return !!w && w.employeeId === employeeId;
  }
  return false;
}

export async function GET(req: Request) {
  const employeeId = await getEmployeeId();
  if (!employeeId) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const kind = searchParams.get("kind") ?? "";
  const id = searchParams.get("id") ?? "";
  const stage = searchParams.get("stage");

  if (!(await ownsTask(kind, id, employeeId))) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }

  const photos = await prisma.taskPhoto.findMany({
    where: {
      ...(kind === "order" ? { orderId: id } : { washId: id }),
      ...(stage === "BEFORE" || stage === "AFTER" ? { stage } : {}),
    },
    select: { id: true, stage: true, spot: true, url: true },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(photos);
}

export async function POST(req: Request) {
  const employeeId = await getEmployeeId();
  if (!employeeId) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const form = await req.formData();
  const file = form.get("file");
  const kind = String(form.get("kind") ?? "");
  const id = String(form.get("id") ?? "");
  const stage = String(form.get("stage") ?? "");
  const spot = String(form.get("spot") ?? "");

  if (!(file instanceof File)) return NextResponse.json({ error: "الصورة مطلوبة" }, { status: 400 });
  if (!file.type.startsWith("image/")) return NextResponse.json({ error: "الملف لازم يكون صورة" }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "الصورة كبيرة جدًا" }, { status: 400 });
  if (stage !== "BEFORE" && stage !== "AFTER") return NextResponse.json({ error: "مرحلة غير صحيحة" }, { status: 400 });
  if (!REQUIRED_SPOT_KEYS.includes(spot)) return NextResponse.json({ error: "مكان غير صحيح" }, { status: 400 });
  if (kind !== "order" && kind !== "wash") return NextResponse.json({ error: "نوع غير صحيح" }, { status: 400 });

  if (!(await ownsTask(kind, id, employeeId))) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 403 });
  }

  const owner = kind === "order" ? { orderId: id } : { washId: id };

  // لو فيه صورة قديمة لنفس المكان: نمسحها ونستبدلها
  const old = await prisma.taskPhoto.findMany({ where: { ...owner, stage, spot } });
  for (const p of old) {
    try { await del(p.url); } catch {}
  }
  if (old.length) await prisma.taskPhoto.deleteMany({ where: { id: { in: old.map((p) => p.id) } } });

  const blob = await put(`car-photos/${kind}/${id}/${stage}-${spot}.jpg`, file, {
    access: "public",
    addRandomSuffix: true,
    contentType: "image/jpeg",
  });

  const photo = await prisma.taskPhoto.create({
    data: { stage, spot, url: blob.url, employeeId, ...owner },
    select: { id: true, stage: true, spot: true, url: true },
  });
  return NextResponse.json(photo);
}