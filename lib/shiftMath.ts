export const MAX_SHIFT_MS = 16 * 60 * 60 * 1000; // حد أقصى للدوام الواحد 16 ساعة

type ShiftLike = {
  startedAt: Date;
  endedAt: Date | null;
  breakStartedAt: Date | null;
  breakMinutes: number;
};

export function workedMinutes(s: ShiftLike, now: Date = new Date()) {
  const end = s.endedAt ?? new Date(Math.min(now.getTime(), s.startedAt.getTime() + MAX_SHIFT_MS));
  let ms = end.getTime() - s.startedAt.getTime();
  ms -= s.breakMinutes * 60000;
  if (s.breakStartedAt && !s.endedAt) {
    ms -= Math.max(0, end.getTime() - s.breakStartedAt.getTime());
  }
  return Math.max(0, Math.round(ms / 60000));
}