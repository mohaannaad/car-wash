import { prisma } from "./prisma";

// لو عمود الصيانة لسه مش موجود في الداتابيز (قبل prisma db push) الموقع يفضل شغال عادي
export async function getMaintenance() {
  try {
    const s = await prisma.settings.findUnique({
      where: { id: "singleton" },
      select: { maintenanceMode: true, maintenanceMessage: true },
    });
    return { on: s?.maintenanceMode ?? false, message: s?.maintenanceMessage ?? "" };
  } catch {
    return { on: false, message: "" };
  }
}
