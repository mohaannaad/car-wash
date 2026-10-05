import { prisma } from "./prisma";
import { REQUIRED_SPOT_KEYS } from "./photoSpots";

export async function hasAllPhotos(
  kind: "order" | "wash",
  id: string,
  stage: "BEFORE" | "AFTER"
) {
  const rows = await prisma.taskPhoto.findMany({
    where: { ...(kind === "order" ? { orderId: id } : { washId: id }), stage },
    select: { spot: true },
  });
  const spots = new Set(rows.map((r) => r.spot));
  return REQUIRED_SPOT_KEYS.every((k) => spots.has(k));
}