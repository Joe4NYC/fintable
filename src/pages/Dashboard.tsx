import { Card } from '../components/Card';
import { ProgressBar } from '../components/ProgressBar';
import { StatTile } from '../components/StatTile';
import { AllocationDonut } from '../components/charts/AllocationDonut';
import { useFinance } from '../store/FinanceContext';
import {
  cashAmount,
  goalProgress,
  investmentAmount,
  netAssets,
  runwayYears,
  totalAssets,
  totalLoans,
} from '../utils/finance';
import { formatCurrency, formatNumber, formatPercent } from '../utils/format';

export function Dashboard() {
  const { data } = useFinance();
  const { assets, goals } = data;

  const total = totalAssets(assets);
  const net = netAssets(assets);
  const invest = investmentAmount(assets);
  const cash = cashAmount(assets);
  const loans = totalLoans(assets);
  const runway = runwayYears(data);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="總資產" value={formatCurrency(total, 'HKD')} hint="投資組合 + 緊急後備金" />
        <StatTile label="淨資產" value={formatCurrency(net, 'HKD')} hint="總資產 − 借貸" tone={net >= 0 ? 'positive' : 'negative'} />
        <StatTile label="緊急後備金" value={formatCurrency(assets.emergencyFund, 'HKD')} />
        <StatTile label="日常流動資金" value={`${runway.toFixed(1)} 年`} hint="可動用現金 ÷ 年支出" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card title="資產配置" subtitle="投資 vs 現金" className="lg:col-span-1">
          <AllocationDonut
            data={[
              { name: '投資額', value: invest },
              { name: '現金額', value: cash },
            ]}
          />
          <div className="mt-2 space-y-1 text-sm">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-600">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-brand" />投資額
              </span>
              <span className="tabular-nums">{formatNumber(invest)}（{formatPercent(assets.investmentRatio)}）</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-600">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-sky-400" />現金額
              </span>
              <span className="tabular-nums">{formatNumber(cash)}（{formatPercent(assets.cashRatio)}）</span>
            </div>
          </div>
        </Card>

        <Card title="財務目標" subtitle="達成進度" className="lg:col-span-2">
          <div className="space-y-5">
            {goals.map((g) => {
              const p = goalProgress(g, total);
              return (
                <div key={g.id}>
                  <div className="mb-1.5 flex items-baseline justify-between">
                    <span className="font-medium text-slate-700">{g.name}</span>
                    <span className="text-sm text-slate-400">
                      目標 {formatCurrency(g.targetAmount, 'HKD')}
                    </span>
                  </div>
                  <ProgressBar ratio={p.achievementRatio} />
                  <div className="mt-1.5 flex flex-wrap justify-between gap-x-4 text-xs text-slate-500">
                    <span>達成率 <strong className="text-slate-700">{formatPercent(p.achievementRatio, 2)}</strong></span>
                    <span>
                      {p.toGo > 0 ? '尚差' : '超額'}{' '}
                      <strong className={p.toGo > 0 ? 'text-rose-600' : 'text-emerald-600'}>
                        {formatCurrency(Math.abs(p.toGo), 'HKD')}
                      </strong>
                    </span>
                    <span>剩餘 <strong className="text-slate-700">{p.daysLeft}</strong> 日</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <Card title="借貸" subtitle={`總額 ${formatCurrency(loans, 'HKD')}`}>
        {assets.loans.length === 0 ? (
          <p className="text-sm text-slate-400">無借貸紀錄。</p>
        ) : (
          <ul className="divide-y divide-slate-100 text-sm">
            {assets.loans.map((l, i) => (
              <li key={i} className="flex items-center justify-between py-2">
                <span className="text-slate-600">{l.name}</span>
                <span className="tabular-nums text-rose-600">{formatCurrency(l.amount, 'HKD')}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
