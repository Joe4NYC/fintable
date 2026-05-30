import { useState } from 'react';
import { Card } from '../components/Card';
import { ProgressBar } from '../components/ProgressBar';
import { useFinance } from '../store/FinanceContext';
import type { Goal } from '../types';
import { goalProgress, netAssets } from '../utils/finance';
import { formatCurrency, formatDate, formatPercent, parseDateMs } from '../utils/format';

const field =
  'rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20';

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
      <label className="flex flex-col gap-1 text-xs text-slate-500">
        目標名稱
        <input value={name} onChange={(e) => setName(e.target.value)} className={field} placeholder="例如 2030 財務目標" required />
      </label>
      <label className="flex flex-col gap-1 text-xs text-slate-500">
        目標金額
        <input type="number" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} className={field} required />
      </label>
      <label className="flex flex-col gap-1 text-xs text-slate-500">
        目標日期
        <input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} className={field} required />
      </label>
      <div className="flex gap-2 sm:col-span-3">
        <button type="submit" className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          儲存
        </button>
        <button type="button" onClick={onCancel} className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">
          取消
        </button>
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
            <button onClick={() => setAdding(true)} className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
              + 新增目標
            </button>
          )
        }
      >
        {adding && (
          <div className="mb-5 rounded-xl bg-slate-50 p-4">
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
                <div key={g.id} className="rounded-xl bg-slate-50 p-4">
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
              <div key={g.id} className="rounded-xl border border-slate-100 p-4">
                <div className="mb-2 flex items-baseline justify-between">
                  <div>
                    <span className="font-semibold text-slate-800">{g.name}</span>
                    <span className="ml-2 text-sm text-slate-400">
                      目標 {formatCurrency(g.targetAmount, 'HKD')} · {formatDate(g.targetDate)}
                    </span>
                  </div>
                  <div className="whitespace-nowrap">
                    <button onClick={() => setEditingId(g.id)} className="text-xs text-brand hover:underline">
                      編輯
                    </button>
                    <button onClick={() => removeGoal(g.id)} className="ml-3 text-xs text-rose-500 hover:underline">
                      刪除
                    </button>
                  </div>
                </div>
                <ProgressBar ratio={p.achievementRatio} />
                <div className="mt-2 grid grid-cols-3 gap-2 text-center text-xs">
                  <div>
                    <p className="text-slate-400">達成率</p>
                    <p className="font-semibold text-slate-700">{formatPercent(p.achievementRatio, 2)}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">{p.toGo > 0 ? '尚差' : '超額'}</p>
                    <p className={`font-semibold ${p.toGo > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {formatCurrency(Math.abs(p.toGo), 'HKD')}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400">剩餘天數</p>
                    <p className="font-semibold text-slate-700">{isFinite(p.daysLeft) ? p.daysLeft : '—'} 日</p>
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
