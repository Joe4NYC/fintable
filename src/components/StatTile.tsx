interface StatTileProps {
  label: string;
  value: string;
  hint?: string;
  tone?: 'default' | 'positive' | 'negative';
}

const toneClass: Record<NonNullable<StatTileProps['tone']>, string> = {
  default: 'text-slate-800',
  positive: 'text-emerald-600',
  negative: 'text-rose-600',
};

export function StatTile({ label, value, hint, tone = 'default' }: StatTileProps) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <p className="text-xs font-medium text-slate-400">{label}</p>
      <p className={`mt-2 text-2xl font-bold tracking-tight ${toneClass[tone]}`}>{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}
