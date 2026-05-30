import { Card } from '../components/Card';
import { ProgressBar } from '../components/ProgressBar';
import { StatTile } from '../components/StatTile';
import { AllocationDonut } from '../components/charts/AllocationDonut';
import { Sparkline } from '../components/charts/Sparkline';
import { useFinance } from '../store/FinanceContext';
import {
  cashAmount,
  goalProgress,
  investmentAmount,
  netAssets,
  runwayMonths,
  totalAssets,
  totalLoans,
} from '../utils/finance';
import { formatCurrency, formatNumber, formatPercent, parseDateMs } from '../utils/format';

export function Dashboard() {
  const { data } = useFinance();
  const { assets, goals } = data;

  const total = totalAssets(assets);
  const net = netAssets(assets);
  const invest = investmentAmount(assets);
  const cash = cashAmount(assets);
  const loans = totalLoans(assets);
  const runway = runwayMonths(data);
  const allocTotal = invest + cash;
  const investRatio = allocTotal ? invest / allocTotal : 0;
  const cashRatio = allocTotal ? cash / allocTotal : 0;

  // 累計結餘走勢（真實時序，供 hero sparkline）
  let running = 0;
  const savingsTrend = data.monthly.map((m) => (running += m.income - m.expense));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Hero：淨資產 */}
        <section className="rounded-card bg-surface p-5 shadow-card ring-1 ring-line lg:col-span-2">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-medium text-content-muted">淨資產</p>
              <p
                className={`mt-1 text-4xl font-bold tracking-tight tabular-nums ${
                  net >= 0 ? 'text-content' : 'text-danger'
                }`}
              >
                {formatCurrency(net, 'HKD')}
              </p>
              <p className="mt-1 text-xs text-content-faint">總資產 − 借貸</p>
            </div>
            {savingsTrend.length >= 2 && (
              <div className="h-14 w-32 shrink-0">
                <Sparkline values={savingsTrend} />
              </div>
            )}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-line pt-4">
            <div>
              <p className="text-xs text-content-muted">總資產</p>
              <p className="mt-0.5 text-lg font-semibold tabular-nums text-content">
                {formatCurrency(total, 'HKD')}
              </p>
            </div>
            <div>
              <p className="text-xs text-content-muted">借貸</p>
              <p className="mt-0.5 text-lg font-semibold tabular-nums text-danger">
                {formatCurrency(loans, 'HKD')}
              </p>
            </div>
          </div>
        </section>

        <StatTile label="日常流動資金" value={`${runway.toFixed(1)} 個月`} hint="流動現金 ÷ 月支出" />
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
              <span className="flex items-center gap-2 text-content-muted">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-brand-2" />投資額
              </span>
              <span className="tabular-nums text-content">{formatNumber(invest)}（{formatPercent(investRatio)}）</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-content-muted">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-content-faint" />現金額
              </span>
              <span className="tabular-nums text-content">{formatNumber(cash)}（{formatPercent(cashRatio)}）</span>
            </div>
          </div>
        </Card>

        <Card title="財務目標" subtitle="達成進度" className="lg:col-span-2">
          <div className="space-y-5">
            {[...goals]
              .sort((a, b) => parseDateMs(a.targetDate) - parseDateMs(b.targetDate))
              .map((g) => {
              const p = goalProgress(g, net);
              return (
                <div key={g.id}>
                  <div className="mb-1.5 flex items-baseline justify-between">
                    <span className="font-medium text-content">{g.name}</span>
                    <span className="text-sm text-content-faint">
                      目標 {formatCurrency(g.targetAmount, 'HKD')}
                    </span>
                  </div>
                  <ProgressBar ratio={p.achievementRatio} />
                  <div className="mt-1.5 flex flex-wrap justify-between gap-x-4 text-xs text-content-muted">
                    <span>達成率 <strong className="text-content">{formatPercent(p.achievementRatio, 2)}</strong></span>
                    <span>
                      {p.toGo > 0 ? '尚差' : '超額'}{' '}
                      <strong className={p.toGo > 0 ? 'text-danger' : 'text-brand'}>
                        {formatCurrency(Math.abs(p.toGo), 'HKD')}
                      </strong>
                    </span>
                    <span>剩餘 <strong className="text-content">{isFinite(p.daysLeft) ? p.daysLeft : '—'}</strong> 日</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <Card title="借貸" subtitle={`總額 ${formatCurrency(loans, 'HKD')}`}>
        {assets.loans.length === 0 ? (
          <p className="text-sm text-content-faint">無借貸紀錄。</p>
        ) : (
          <ul className="divide-y divide-line text-sm">
            {assets.loans.map((l, i) => (
              <li key={i} className="flex items-center justify-between py-2">
                <span className="text-content-muted">{l.name}</span>
                <span className="tabular-nums text-danger">{formatCurrency(l.amount, 'HKD')}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
