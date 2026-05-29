import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { formatNumber } from '../../utils/format';

interface Slice {
  name: string;
  value: number;
}

const COLORS = ['#2563eb', '#38bdf8', '#f59e0b', '#10b981'];

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
          contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
