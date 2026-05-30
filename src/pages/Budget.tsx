import { Card } from '../components/Card';
import { StatTile } from '../components/StatTile';
import { BudgetEditor } from '../components/BudgetEditor';
import { useFinance } from '../store/FinanceContext';
import type { BudgetItem } from '../types';
import { averageExpense, averageIncome, disposable, sum } from '../utils/finance';
import { formatCurrency } from '../utils/format';

export function Budget() {
  const { data, setBudget } = useFinance();
  const { fixedIncome, fixedExpense } = data.budget;

  const budgetIncome = sum(fixedIncome);
  const budgetExpense = sum(fixedExpense);
  const disp = disposable(fixedIncome, fixedExpense);

  const actualIncome = averageIncome(data.monthly);
  const actualExpense = averageExpense(data.monthly);

  const setIncome = (items: BudgetItem[]) => setBudget({ fixedIncome: items, fixedExpense });
  const setExpense = (items: BudgetItem[]) => setBudget({ fixedIncome, fixedExpense: items });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <StatTile label="預算月收入" value={formatCurrency(budgetIncome, 'HKD')} />
        <StatTile label="預算月支出" value={formatCurrency(budgetExpense, 'HKD')} />
        <StatTile label="可支配收入" value={formatCurrency(disp, 'HKD')} tone={disp >= 0 ? 'positive' : 'negative'} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card title="每月固定收入">
          <BudgetEditor title="收入項目" items={fixedIncome} onChange={setIncome} accent="income" />
        </Card>
        <Card title="每月固定支出">
          <BudgetEditor title="支出項目" items={fixedExpense} onChange={setExpense} accent="expense" />
        </Card>
      </div>

      <Card title="預算 vs 實際" subtitle="預算為固定設定，實際為歷史月平均">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs text-content-faint">
              <th className="py-2 font-medium"></th>
              <th className="py-2 text-right font-medium">預算</th>
              <th className="py-2 text-right font-medium">實際（月均）</th>
              <th className="py-2 text-right font-medium">差異</th>
            </tr>
          </thead>
          <tbody>
            <Row label="收入" budget={budgetIncome} actual={actualIncome} higherIsGood />
            <Row label="支出" budget={budgetExpense} actual={actualExpense} higherIsGood={false} />
            <Row label="結餘" budget={disp} actual={actualIncome - actualExpense} higherIsGood />
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function Row({
  label,
  budget,
  actual,
  higherIsGood,
}: {
  label: string;
  budget: number;
  actual: number;
  higherIsGood: boolean;
}) {
  const diff = actual - budget;
  const good = higherIsGood ? diff >= 0 : diff <= 0;
  return (
    <tr className="border-b border-line">
      <td className="py-2 font-medium text-content">{label}</td>
      <td className="py-2 text-right tabular-nums text-content-muted">{formatCurrency(budget, 'HKD')}</td>
      <td className="py-2 text-right tabular-nums text-content-muted">{formatCurrency(actual, 'HKD')}</td>
      <td className={`py-2 text-right tabular-nums ${good ? 'text-brand' : 'text-danger'}`}>
        {diff >= 0 ? '+' : ''}
        {formatCurrency(diff, 'HKD')}
      </td>
    </tr>
  );
}
