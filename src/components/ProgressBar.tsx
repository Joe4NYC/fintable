interface ProgressBarProps {
  ratio: number; // 0-1+
}

export function ProgressBar({ ratio }: ProgressBarProps) {
  const pct = Math.max(0, Math.min(1, ratio)) * 100;
  const reached = ratio >= 1;
  return (
    <div className="h-3 w-full overflow-hidden rounded-full bg-surface-2">
      <div
        className={`h-full rounded-full transition-all ${reached ? 'bg-brand' : 'bg-brand-2'}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
