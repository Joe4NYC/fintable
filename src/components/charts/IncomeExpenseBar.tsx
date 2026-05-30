import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { MonthlyRecord } from '../../types';
import { formatMonth, formatNumber } from '../../utils/format';

// 收入／支出長條，疊上「每月結餘」線（收入 − 支出）。
// 結餘線在 0 以上＝該月有盈餘；跌破 0＝該月超支。
export function IncomeExpenseBar({ monthly }: { monthly: MonthlyRecord[] }) {
  const data = monthly.map((m) => ({
    month: formatMonth(m.month),
    收入: m.income,
    支出: m.expense,
    結餘: m.income - m.expense,
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <ComposedChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#232c40" vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#8b97ad' }} />
        <YAxis
          tick={{ fontSize: 12, fill: '#8b97ad' }}
          tickFormatter={(v) => formatNumber(v as number)}
          width={56}
        />
        <Tooltip
          formatter={(v) => formatNumber(v as number)}
          contentStyle={{
            borderRadius: 12,
            background: '#141b2d',
            border: '1px solid #232c40',
            color: '#e6edf6',
            fontSize: 12,
          }}
          itemStyle={{ color: '#e6edf6' }}
          cursor={{ fill: 'rgba(255,255,255,0.04)' }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <ReferenceLine y={0} stroke="#5b6678" />
        <Bar dataKey="收入" fill="#10b981" radius={[4, 4, 0, 0]} />
        <Bar dataKey="支出" fill="#f43f5e" radius={[4, 4, 0, 0]} />
        <Line
          type="monotone"
          dataKey="結餘"
          stroke="#a78bfa"
          strokeWidth={2.5}
          dot={{ r: 3 }}
          activeDot={{ r: 5 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
