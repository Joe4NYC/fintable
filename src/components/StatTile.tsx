import type { ReactNode } from 'react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

interface Delta {
  text: string; // 已格式化的變化值，例如「+1,200」
  direction: 'up' | 'down' | 'flat';
  good: boolean; // 此方向對使用者是好是壞（決定綠/紅）
  label?: string; // 例如「較上月」
}

interface StatTileProps {
  label: string;
  value: string;
  hint?: string;
  tone?: 'default' | 'positive' | 'negative';
  variant?: 'default' | 'hero';
  delta?: Delta;
  chart?: ReactNode; // 迷你走勢圖 slot
}

const toneClass: Record<NonNullable<StatTileProps['tone']>, string> = {
  default: 'text-content',
  positive: 'text-brand',
  negative: 'text-danger',
};

function DeltaBadge({ delta }: { delta: Delta }) {
  const color = delta.direction === 'flat' ? 'text-content-faint' : delta.good ? 'text-brand' : 'text-danger';
  const Icon = delta.direction === 'down' ? ArrowDownRight : ArrowUpRight;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${color}`}>
      {delta.direction !== 'flat' && <Icon size={14} strokeWidth={2.5} />}
      <span className="tabular-nums">{delta.text}</span>
      {delta.label && <span className="ml-1 text-content-faint">{delta.label}</span>}
    </span>
  );
}

export function StatTile({
  label,
  value,
  hint,
  tone = 'default',
  variant = 'default',
  delta,
  chart,
}: StatTileProps) {
  const valueSize = variant === 'hero' ? 'text-4xl' : 'text-2xl';
  return (
    <div className="rounded-card bg-surface p-5 shadow-card ring-1 ring-line">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-content-muted">{label}</p>
          <p className={`mt-2 font-bold tracking-tight tabular-nums ${valueSize} ${toneClass[tone]}`}>{value}</p>
          {delta && (
            <div className="mt-1.5">
              <DeltaBadge delta={delta} />
            </div>
          )}
          {hint && !delta && <p className="mt-1 text-xs text-content-faint">{hint}</p>}
        </div>
        {chart && <div className="h-12 w-24 shrink-0 self-center">{chart}</div>}
      </div>
    </div>
  );
}
