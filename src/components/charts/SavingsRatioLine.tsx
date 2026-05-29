import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { MonthlyRecord } from '../../types';
import { savingsRatio } from '../../utils/finance';
import { formatMonth, formatPercent } from '../../utils/format';

export function SavingsRatioLine({ monthly }: { monthly: MonthlyRecord[] }) {
  const data = monthly.map((m) => ({
    month: formatMonth(m.month),
    比率: Math.round(savingsRatio(m) * 100),
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} />
        <YAxis
          tick={{ fontSize: 12, fill: '#64748b' }}
          tickFormatter={(v) => `${v}%`}
          width={48}
        />
        <Tooltip
          formatter={(v) => formatPercent((v as number) / 100, 0)}
          contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
        />
        <ReferenceLine y={0} stroke="#94a3b8" />
        <Line
          type="monotone"
          dataKey="比率"
          stroke="#10b981"
          strokeWidth={2.5}
          dot={{ r: 3 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
