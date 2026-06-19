import { useState } from 'react';
import { CalendarClock, Plus } from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { ProgressBar } from '../components/ProgressBar';
import { fieldClass } from '../components/formStyles';
import { useFinance } from '../store/FinanceContext';
import type { Goal } from '../types';
import { averageExpense, averageIncome, goalProgress, netAssets, projectGoal } from '../utils/finance';
import { formatCurrency, formatDate, formatMonth, formatPercent, parseDateMs } from '../utils/format';

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
  const avgNet = averageIncome(data.monthly) - averageExpense(data.monthly);

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
            const proj = projectGoal(g, total, avgNet);
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
                <div className="mt-3 flex items-center gap-1.5 border-t border-line pt-2.5 text-xs">
                  <CalendarClock size={14} className="shrink-0 text-content-faint" />
                  {proj.alreadyMet ? (
                    <span className="font-medium text-brand">已達標 🎉</span>
                  ) : !proj.reachable ? (
                    <span className="text-content-faint">平均月結餘 ≤ 0，依目前速度無法估算達標日</span>
                  ) : (
                    <span className="text-content-muted">
                      依目前儲蓄速度，預計{' '}
                      <strong className="text-content">{formatMonth(proj.projectedDate!)}</strong> 達標
                      {proj.diffMonths !== null && (
                        <>
                          {' · '}
                          {proj.diffMonths <= 0 ? (
                            <span className="font-medium text-brand">
                              較目標{proj.diffMonths === 0 ? '準時' : `早 ${-proj.diffMonths} 個月`}
                            </span>
                          ) : (
                            <span className="font-medium text-warn">較目標遲 {proj.diffMonths} 個月</span>
                          )}
                        </>
                      )}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
