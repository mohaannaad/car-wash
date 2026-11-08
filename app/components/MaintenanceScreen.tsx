import { DEFAULT_MAINTENANCE_MESSAGE } from "../../lib/maintenanceText";

export default function MaintenanceScreen({ message }: { message?: string }) {
  return (
    <main className="min-h-dvh flex flex-col items-center justify-center gap-6 px-6 py-10 bg-bg-page text-center">
      <svg viewBox="0 0 400 280" className="w-full max-w-sm" role="img" aria-label="الموقع تحت الإنشاء">
        <defs>
          <pattern id="mstripes" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="6" height="12" fill="#F59E0B" />
            <rect x="6" width="6" height="12" fill="#1F2937" />
          </pattern>
        </defs>
        <circle cx="200" cy="140" r="128" fill="#EAF7F8" />
        <line x1="50" y1="232" x2="350" y2="232" stroke="#CFE3E1" strokeWidth="4" strokeLinecap="round" />

        {/* gear */}
        <g transform="translate(92 98)">
          <circle r="27" fill="none" stroke="#1F2937" strokeWidth="10" strokeDasharray="8.5 8.5" />
          <circle r="21" fill="#1F2937" />
          <circle r="8" fill="#EAF7F8" />
        </g>

        {/* car */}
        <g transform="translate(14 0)">
          <rect x="106" y="164" width="190" height="48" rx="14" fill="#19B9C6" />
          <path d="M138 166 L162 130 H240 L266 166 Z" fill="#149AA5" />
          <path d="M150 164 L168 136 H196 V164 Z" fill="#EAF7F8" />
          <path d="M205 136 H236 L254 164 H205 Z" fill="#EAF7F8" />
          <rect x="283" y="176" width="14" height="9" rx="3" fill="#FDE68A" />
          <circle cx="146" cy="212" r="18" fill="#1F2937" />
          <circle cx="146" cy="212" r="7" fill="#9CA3AF" />
          <circle cx="258" cy="212" r="18" fill="#1F2937" />
          <circle cx="258" cy="212" r="7" fill="#9CA3AF" />
          {/* bubbles */}
          <circle cx="160" cy="108" r="9" fill="#fff" stroke="#19B9C6" strokeWidth="2.5" />
          <circle cx="188" cy="90" r="6" fill="#fff" stroke="#19B9C6" strokeWidth="2.5" />
          <circle cx="222" cy="104" r="11" fill="#fff" stroke="#19B9C6" strokeWidth="2.5" />
          <circle cx="250" cy="86" r="5" fill="#fff" stroke="#19B9C6" strokeWidth="2.5" />
        </g>

        {/* barrier */}
        <rect x="46" y="190" width="62" height="16" rx="3" fill="url(#mstripes)" />
        <rect x="54" y="206" width="6" height="26" fill="#6B7280" />
        <rect x="94" y="206" width="6" height="26" fill="#6B7280" />

        {/* cone */}
        <path d="M322 232 L334 178 H346 L358 232 Z" fill="#F59E0B" />
        <path d="M327 210 L331 194 H349 L353 210 Z" fill="#fff" />
        <rect x="316" y="230" width="48" height="8" rx="3" fill="#D97706" />
      </svg>

      <div className="flex flex-col gap-2 max-w-sm">
        <h1 className="text-text-main text-2xl font-extrabold">الموقع تحت الإنشاء</h1>
        <p className="text-text-secondary text-sm leading-7">{message?.trim() || DEFAULT_MAINTENANCE_MESSAGE}</p>
      </div>
    </main>
  );
}
