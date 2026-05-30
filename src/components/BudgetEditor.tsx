import { X } from 'lucide-react';
import type { BudgetItem } from '../types';
import { formatNumber } from '../utils/format';
import { fieldClass } from './formStyles';

interface BudgetEditorProps {
  title: string;
  items: BudgetItem[];
  onChange: (items: BudgetItem[]) => void;
  accent: 'income' | 'expense';
}

const field = fieldClass.replace('py-2', 'py-1.5');

export function BudgetEditor({ title, items, onChange, accent }: BudgetEditorProps) {
  const total = items.reduce((acc, i) => acc + i.amount, 0);
  const totalColor = accent === 'income' ? 'text-brand' : 'text-danger';

  const update = (idx: number, patch: Partial<BudgetItem>) =>
    onChange(items.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  const remove = (idx: number) => onChange(items.filter((_, i) => i !== idx));
  const add = () => onChange([...items, { name: '', amount: 0 }]);

  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="text-sm font-semibold text-content">{title}</h3>
        <span className={`text-sm font-semibold tabular-nums ${totalColor}`}>{formatNumber(total)}</span>
      </div>
      <div className="space-y-2">
        {items.map((it, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <input
              value={it.name}
              onChange={(e) => update(idx, { name: e.target.value })}
              className={`${field} flex-1`}
              placeholder="項目名稱"
            />
            <input
              type="number"
              value={it.amount === 0 ? '' : it.amount}
              onChange={(e) => update(idx, { amount: Number(e.target.value) || 0 })}
              className={`${field} w-28 text-right`}
              placeholder="0"
            />
            <button onClick={() => remove(idx)} className="text-content-faint hover:text-danger" aria-label="刪除">
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
      <button onClick={add} className="mt-3 text-xs font-medium text-brand hover:underline">
        + 新增項目
      </button>
    </div>
  );
}
