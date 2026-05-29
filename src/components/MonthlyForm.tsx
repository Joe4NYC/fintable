import { useEffect, useState } from 'react';
import type { MonthlyRecord } from '../types';

interface MonthlyFormProps {
  initial?: MonthlyRecord;
  onSubmit: (values: Omit<MonthlyRecord, 'id'>) => void;
  onCancel: () => void;
}

const thisMonth = () => new Date().toISOString().slice(0, 7);

export function MonthlyForm({ initial, onSubmit, onCancel }: MonthlyFormProps) {
  const [month, setMonth] = useState(initial?.month ?? thisMonth());
  const [income, setIncome] = useState(String(initial?.income ?? ''));
  const [expense, setExpense] = useState(String(initial?.expense ?? ''));
  const [note, setNote] = useState(initial?.note ?? '');

  useEffect(() => {
    if (initial) {
      setMonth(initial.month);
      setIncome(String(initial.income));
      setExpense(String(initial.expense));
      setNote(initial.note);
    }
  }, [initial]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      month,
      income: Number(income) || 0,
      expense: Number(expense) || 0,
      note: note.trim(),
    });
  };

  const field = 'rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20';

  return (
    <form onSubmit={submit} className="grid grid-cols-2 gap-3 sm:grid-cols-5">
      <label className="flex flex-col gap-1 text-xs text-slate-500">
        月份
        <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className={field} required />
      </label>
      <label className="flex flex-col gap-1 text-xs text-slate-500">
        收入
        <input type="number" inputMode="decimal" value={income} onChange={(e) => setIncome(e.target.value)} className={field} placeholder="0" />
      </label>
      <label className="flex flex-col gap-1 text-xs text-slate-500">
        支出
        <input type="number" inputMode="decimal" value={expense} onChange={(e) => setExpense(e.target.value)} className={field} placeholder="0" />
      </label>
      <label className="col-span-2 flex flex-col gap-1 text-xs text-slate-500 sm:col-span-2">
        備註
        <input type="text" value={note} onChange={(e) => setNote(e.target.value)} className={field} placeholder="例如 四川 trip" />
      </label>
      <div className="col-span-2 flex gap-2 sm:col-span-5">
        <button type="submit" className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          {initial ? '儲存修改' : '新增紀錄'}
        </button>
        <button type="button" onClick={onCancel} className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">
          取消
        </button>
      </div>
    </form>
  );
}
