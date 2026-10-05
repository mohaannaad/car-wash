"use client";

import { useCallback, useEffect, useState } from "react";
import { SPOTS, type Stage } from "../../../lib/photoSpots";

type Photo = { id: string; stage: string; spot: string; url: string };

async function compress(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const max = 1280;
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("تعذر معالجة الصورة");
  ctx.drawImage(bitmap, 0, 0, w, h);
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("تعذر ضغط الصورة"))), "image/jpeg", 0.72)
  );
}

export default function PhotoStage({
  kind,
  id,
  stage,
  onChange,
}: {
  kind: "order" | "wash";
  id: string;
  stage: Stage;
  onChange?: (complete: boolean) => void;
}) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const res = await fetch(`/api/staff/photos?kind=${kind}&id=${id}&stage=${stage}`);
    if (res.ok) setPhotos(await res.json());
  }, [kind, id, stage]);

  useEffect(() => {
    load();
  }, [load]);

  const count = SPOTS.filter((s) => photos.some((p) => p.spot === s.key)).length;
  const complete = count === SPOTS.length;

  useEffect(() => {
    onChange?.(complete);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [complete]);

  const handleFile = async (spot: string, file?: File | null) => {
    if (!file) return;
    setBusy(spot);
    setError("");
    try {
      const blob = await compress(file);
      const fd = new FormData();
      fd.append("file", blob, "photo.jpg");
      fd.append("kind", kind);
      fd.append("id", id);
      fd.append("stage", stage);
      fd.append("spot", spot);
      const res = await fetch("/api/staff/photos", { method: "POST", body: fd });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "فشل رفع الصورة");
      }
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "فشل رفع الصورة");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-text-main text-xs font-bold">
          {stage === "BEFORE" ? "صور السيارة قبل التنفيذ" : "صور السيارة بعد التنفيذ"}
        </span>
        <span className={`text-xs font-bold ${complete ? "text-emerald-600" : "text-text-secondary"}`}>
          {count}/{SPOTS.length}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {SPOTS.map((s) => {
          const photo = photos.find((p) => p.spot === s.key);
          const loading = busy === s.key;
          return (
            <label
              key={s.key}
              className={`relative aspect-square rounded-xl overflow-hidden flex flex-col items-center justify-center gap-1 text-[11px] font-bold cursor-pointer border-2 ${
                photo ? "border-emerald-400" : "border-dashed border-primary/50 bg-primary-light text-primary"
              }`}
            >
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                disabled={loading}
                onChange={(e) => {
                  handleFile(s.key, e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
              {photo ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo.url} alt={s.label} className="absolute inset-0 w-full h-full object-cover" />
                  <span className="absolute bottom-0 inset-x-0 bg-black/55 text-white py-0.5 text-center">
                    ✓ {s.label}
                  </span>
                </>
              ) : (
                <>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                  <span>{s.label}</span>
                </>
              )}
              {loading && (
                <span className="absolute inset-0 bg-white/80 flex items-center justify-center text-text-secondary">
                  جارٍ الرفع...
                </span>
              )}
            </label>
          );
        })}
      </div>

      {error && <p className="text-red-500 text-xs">{error}</p>}
    </div>
  );
}