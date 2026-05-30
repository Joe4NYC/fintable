import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { formatNumber } from '../../utils/format';

interface Slice {
  name: string;
  value: number;
}

const COLORS = ['#38bdf8', '#5b6678', '#f59e0b', '#10b981'];

export function AllocationDonut({ data }: { data: Slice[] }) {
  const total = data.reduce((acc, d) => acc + d.value, 0);
  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={2}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(v) => {
            const num = v as number;
            const pct = total ? ((num / total) * 100).toFixed(1) : '0';
            return [`${formatNumber(num)}（${pct}%）`, ''];
          }}
          contentStyle={{
            borderRadius: 12,
            background: '#141b2d',
            border: '1px solid #232c40',
            color: '#e6edf6',
            fontSize: 12,
          }}
          itemStyle={{ color: '#e6edf6' }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
