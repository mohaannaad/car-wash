export type Stage = "BEFORE" | "AFTER";

export const SPOTS = [
  { key: "FRONT", label: "أمامي" },
  { key: "REAR", label: "خلفي" },
  { key: "RIGHT", label: "الجانب الأيمن" },
  { key: "LEFT", label: "الجانب الأيسر" },
  { key: "INTERIOR", label: "الداخل" },
  { key: "TRUNK", label: "الشنطة" },
] as const;

export const REQUIRED_SPOT_KEYS: string[] = SPOTS.map((s) => s.key);