import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { ProgressBar } from '../components/ProgressBar';
import { fieldClass } from '../components/formStyles';
import { useFinance } from '../store/FinanceContext';
import type { Goal } from '../types';
import { goalProgress, netAssets } from '../utils/finance';
import { formatCurrency, formatDate, formatPercent, parseDateMs } from '../utils/format';

const field = fieldClass;

function GoalForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: Goal;
  onSubmit: (v: Omit<Goal, 'id'>) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name ?? '');
  const [targetAmount, setTargetAmount] = useState(String(initial?.targetAmount ?? ''));
  const [targetDate, setTargetDate] = useState(initial ? formatDate(initial.targetDate) : '');

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ name: name.trim(), targetAmount: Number(targetAmount) || 0, targetDate });
      }}
      className="grid grid-cols-1 gap-3 sm:grid-cols-3"
    >
      <label className="flex flex-col gap-1 text-xs text-content-muted">
        目標名稱
        <input value={name} onChange={(e) => setName(e.target.value)} className={field} placeholder="例如 2030 財務目標" required />
      </label>
      <label className="flex flex-col gap-1 text-xs text-content-muted">
        目標金額
        <input type="number" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} className={field} required />
      </label>
      <label className="flex flex-col gap-1 text-xs text-content-muted">
        目標日期
        <input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} className={field} required />
      </label>
      <div className="flex gap-2 sm:col-span-3">
        <Button type="submit">儲存</Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          取消
        </Button>
      </div>
    </form>
  );
}

export function Goals() {
  const { data, addGoal, updateGoal, removeGoal } = useFinance();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const total = netAssets(data.assets);

  return (
    <div className="space-y-6">
      <Card
        title="財務目標"
        subtitle={`目前淨資產 ${formatCurrency(total, 'HKD')}`}
        action={
          !adding && (
            <Button onClick={() => setAdding(true)}>
              <Plus size={16} />
              新增目標
            </Button>
          )
        }
      >
        {adding && (
          <div className="mb-5 rounded-xl bg-surface-2 p-4">
            <GoalForm
              onSubmit={(v) => {
                addGoal(v);
                setAdding(false);
              }}
              onCancel={() => setAdding(false)}
            />
          </div>
        )}

        <div className="space-y-4">
          {[...data.goals]
            .sort((a, b) => parseDateMs(a.targetDate) - parseDateMs(b.targetDate))
            .map((g) => {
            const p = goalProgress(g, total);
            if (editingId === g.id) {
              return (
                <div key={g.id} className="rounded-xl bg-surface-2 p-4">
                  <GoalForm
                    initial={g}
                    onSubmit={(v) => {
                      updateGoal(g.id, v);
                      setEditingId(null);
                    }}
                    onCancel={() => setEditingId(null)}
                  />
                </div>
              );
            }
            return (
              <div key={g.id} className="rounded-xl border border-line p-4">
                <div className="mb-2 flex items-baseline justify-between">
                  <div>
                    <span className="font-semibold text-content">{g.name}</span>
                    <span className="ml-2 text-sm text-content-faint">
                      目標 {formatCurrency(g.targetAmount, 'HKD')} · {formatDate(g.targetDate)}
                    </span>
                  </div>
                  <div className="whitespace-nowrap">
                    <button onClick={() => setEditingId(g.id)} className="text-xs text-brand hover:underline">
                      編輯
                    </button>
                    <button onClick={() => removeGoal(g.id)} className="ml-3 text-xs text-danger hover:underline">
                      刪除
                    </button>
                  </div>
                </div>
                <ProgressBar ratio={p.achievementRatio} />
                <div className="mt-2 grid grid-cols-3 gap-2 text-center text-xs">
                  <div>
                    <p className="text-content-faint">達成率</p>
                    <p className="font-semibold text-content">{formatPercent(p.achievementRatio, 2)}</p>
                  </div>
                  <div>
                    <p className="text-content-faint">{p.toGo > 0 ? '尚差' : '超額'}</p>
                    <p className={`font-semibold ${p.toGo > 0 ? 'text-danger' : 'text-brand'}`}>
                      {formatCurrency(Math.abs(p.toGo), 'HKD')}
                    </p>
                  </div>
                  <div>
                    <p className="text-content-faint">剩餘天數</p>
                    <p className="font-semibold text-content">{isFinite(p.daysLeft) ? p.daysLeft : '—'} 日</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
