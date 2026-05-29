import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { MonthlyRecord } from '../../types';
import { formatMonth, formatNumber } from '../../utils/format';

export function IncomeExpenseBar({ monthly }: { monthly: MonthlyRecord[] }) {
  const data = monthly.map((m) => ({
    month: formatMonth(m.month),
    收入: m.income,
    支出: m.expense,
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
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
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="收入" fill="#2563eb" radius={[4, 4, 0, 0]} />
        <Bar dataKey="支出" fill="#f43f5e" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
