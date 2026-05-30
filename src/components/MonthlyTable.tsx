import type { MonthlyRecord } from '../types';
import { savingsRatio } from '../utils/finance';
import { formatMonth, formatNumber, formatPercent } from '../utils/format';

interface MonthlyTableProps {
  monthly: MonthlyRecord[];
  onEdit: (record: MonthlyRecord) => void;
  onDelete: (id: string) => void;
}

export function MonthlyTable({ monthly, onEdit, onDelete }: MonthlyTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-line text-left text-xs text-content-faint">
            <th className="py-2 pr-4 font-medium">月份</th>
            <th className="py-2 pr-4 text-right font-medium">收入</th>
            <th className="py-2 pr-4 text-right font-medium">支出</th>
            <th className="py-2 pr-4 text-right font-medium">存款比率</th>
            <th className="py-2 pr-4 font-medium">備註</th>
            <th className="py-2 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          {monthly.map((m) => {
            const ratio = savingsRatio(m);
            return (
              <tr key={m.id} className="border-b border-line hover:bg-surface-2">
                <td className="py-2 pr-4 font-medium text-content">{formatMonth(m.month)}</td>
                <td className="py-2 pr-4 text-right tabular-nums text-brand">{formatNumber(m.income)}</td>
                <td className="py-2 pr-4 text-right tabular-nums text-danger">{formatNumber(m.expense)}</td>
                <td className={`py-2 pr-4 text-right tabular-nums ${ratio < 0 ? 'text-danger' : 'text-content-muted'}`}>
                  {formatPercent(ratio, 0)}
                </td>
                <td className="py-2 pr-4 text-content-muted">{m.note}</td>
                <td className="py-2 text-right whitespace-nowrap">
                  <button onClick={() => onEdit(m)} className="text-xs text-brand hover:underline">
                    編輯
                  </button>
                  <button onClick={() => onDelete(m.id)} className="ml-3 text-xs text-danger hover:underline">
                    刪除
                  </button>
                </td>
              </tr>
            );
          })}
          {monthly.length === 0 && (
            <tr>
              <td colSpan={6} className="py-8 text-center text-sm text-content-faint">
                尚無紀錄，按上方「新增」開始記帳。
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
