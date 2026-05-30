import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { StatTile } from '../components/StatTile';
import { MonthlyForm } from '../components/MonthlyForm';
import { MonthlyTable } from '../components/MonthlyTable';
import { IncomeExpenseBar } from '../components/charts/IncomeExpenseBar';
import { CumulativeSavings } from '../components/charts/CumulativeSavings';
import { useFinance } from '../store/FinanceContext';
import type { MonthlyRecord } from '../types';
import { averageExpense, averageIncome } from '../utils/finance';
import { formatCurrency } from '../utils/format';

export function Monthly() {
  const { data, addMonthly, updateMonthly, removeMonthly } = useFinance();
  const [editing, setEditing] = useState<MonthlyRecord | null>(null);
  const [showForm, setShowForm] = useState(false);

  const avgIn = averageIncome(data.monthly);
  const avgOut = averageExpense(data.monthly);

  // 最新月 vs 上月（真實時序；monthly 已依月份排序）
  const n = data.monthly.length;
  const last = n >= 1 ? data.monthly[n - 1] : null;
  const prev = n >= 2 ? data.monthly[n - 2] : null;
  const makeDelta = (curr: number, before: number, higherIsGood: boolean) => {
    const diff = curr - before;
    const direction = diff > 0 ? 'up' : diff < 0 ? 'down' : 'flat';
    const good = diff === 0 ? true : higherIsGood ? diff > 0 : diff < 0;
    const text = `${diff >= 0 ? '+' : ''}${formatCurrency(diff, 'HKD')}`;
    return { text, direction: direction as 'up' | 'down' | 'flat', good, label: '較上月' };
  };
  const incomeDelta = last && prev ? makeDelta(last.income, prev.income, true) : undefined;
  const expenseDelta = last && prev ? makeDelta(last.expense, prev.expense, false) : undefined;
  const netDelta =
    last && prev ? makeDelta(last.income - last.expense, prev.income - prev.expense, true) : undefined;

  const openAdd = () => {
    setEditing(null);
    setShowForm(true);
  };
  const openEdit = (record: MonthlyRecord) => {
    setEditing(record);
    setShowForm(true);
  };
  const close = () => {
    setShowForm(false);
    setEditing(null);
  };

  const submit = (values: Omit<MonthlyRecord, 'id'>) => {
    if (editing) updateMonthly(editing.id, values);
    else addMonthly(values);
    close();
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatTile label="平均月收入" value={formatCurrency(avgIn, 'HKD')} delta={incomeDelta} />
        <StatTile label="平均月支出" value={formatCurrency(avgOut, 'HKD')} delta={expenseDelta} />
        <StatTile
          label="平均月結餘"
          value={formatCurrency(avgIn - avgOut, 'HKD')}
          tone={avgIn - avgOut >= 0 ? 'positive' : 'negative'}
          delta={netDelta}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card title="收支與結餘" subtitle="紫線＝每月結餘（收入 − 支出），0 以上代表有盈餘">
          <IncomeExpenseBar monthly={data.monthly} />
        </Card>
        <Card title="累計存款趨勢" subtitle="每月結餘一路累加；往上＝持續存錢，走平或下跌＝在花老本">
          <CumulativeSavings monthly={data.monthly} />
        </Card>
      </div>

      <Card
        title="每月收支紀錄"
        action={
          !showForm && (
            <Button onClick={openAdd}>
              <Plus size={16} />
              新增
            </Button>
          )
        }
      >
        {showForm && (
          <div className="mb-5 rounded-xl bg-surface-2 p-4">
            <MonthlyForm initial={editing ?? undefined} onSubmit={submit} onCancel={close} />
          </div>
        )}
        <MonthlyTable monthly={data.monthly} onEdit={openEdit} onDelete={removeMonthly} />
      </Card>
    </div>
  );
}
