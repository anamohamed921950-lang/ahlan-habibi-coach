export function RingScore({ value, label, size = 120 }: { value: number; label: string; size?: number }) {
  const r = size / 2 - 8;
  const c = 2 * Math.PI * r;
  const off = c - (Math.min(value, 100) / 100) * c;
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={8} className="stroke-secondary" fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={r} strokeWidth={8} fill="none"
          stroke="url(#ring-grad)" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={off}
          style={{ transition: "stroke-dashoffset 800ms ease" }}
        />
        <defs>
          <linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="oklch(0.5 0.13 300)" />
            <stop offset="100%" stopColor="oklch(0.78 0.09 15)" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <div className="font-display text-3xl text-primary num leading-none">{Math.round(value)}</div>
        <div className="text-[10px] text-muted-foreground mt-1 text-center px-2">{label}</div>
      </div>
    </div>
  );
}