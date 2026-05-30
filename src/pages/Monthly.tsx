import { useState } from 'react';
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
        <StatTile label="平均月收入" value={formatCurrency(avgIn, 'HKD')} />
        <StatTile label="平均月支出" value={formatCurrency(avgOut, 'HKD')} />
        <StatTile
          label="平均月結餘"
          value={formatCurrency(avgIn - avgOut, 'HKD')}
          tone={avgIn - avgOut >= 0 ? 'positive' : 'negative'}
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
            <button onClick={openAdd} className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
              + 新增
            </button>
          )
        }
      >
        {showForm && (
          <div className="mb-5 rounded-xl bg-slate-50 p-4">
            <MonthlyForm initial={editing ?? undefined} onSubmit={submit} onCancel={close} />
          </div>
        )}
        <MonthlyTable monthly={data.monthly} onEdit={openEdit} onDelete={removeMonthly} />
      </Card>
    </div>
  );
}
