interface ProgressBarProps {
  ratio: number; // 0-1+
}

export function ProgressBar({ ratio }: ProgressBarProps) {
  const pct = Math.max(0, Math.min(1, ratio)) * 100;
  const reached = ratio >= 1;
  return (
    <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
      <div
        className={`h-full rounded-full transition-all ${reached ? 'bg-emerald-500' : 'bg-brand'}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
