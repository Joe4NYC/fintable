import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { MonthlyRecord } from '../../types';
import { formatMonth, formatNumber } from '../../utils/format';

// 累計存款趨勢：把每月結餘（收入 − 支出）一路累加。
// 線一路往上＝持續在存錢；走平或往下＝在花老本。
export function CumulativeSavings({ monthly }: { monthly: MonthlyRecord[] }) {
  let running = 0;
  const data = monthly.map((m) => {
    running += m.income - m.expense;
    return { month: formatMonth(m.month), 累計結餘: running };
  });

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <defs>
          <linearGradient id="savingsFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#10b981" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} />
        <YAxis
          tick={{ fontSize: 12, fill: '#64748b' }}
          tickFormatter={(v) => formatNumber(v as number)}
          width={56}
        />
        <Tooltip
          formatter={(v) => formatNumber(v as number)}
          contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
        />
        <ReferenceLine y={0} stroke="#94a3b8" />
        <Area
          type="monotone"
          dataKey="累計結餘"
          stroke="#10b981"
          strokeWidth={2.5}
          fill="url(#savingsFill)"
          dot={{ r: 3 }}
          activeDot={{ r: 5 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
