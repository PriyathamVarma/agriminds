export default function ProgressRing({ percent, size = 96, strokeWidth = 9, label }: { percent: number; size?: number; strokeWidth?: number; label?: string }) {
  const clamped = Math.max(0, Math.min(100, percent));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - clamped / 100);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} strokeWidth={strokeWidth} className="stroke-surface" fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className={clamped >= 100 ? "stroke-status-success" : "stroke-primary"}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 600ms ease" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="font-display text-xl font-semibold text-foreground-heading">{Math.round(clamped)}%</span>
        {label ? <span className="text-[10px] font-medium text-foreground-muted uppercase">{label}</span> : null}
      </div>
    </div>
  );
}
