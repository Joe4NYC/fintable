import { useRef, useState } from 'react';
import { Card } from '../components/Card';
import { useFinance } from '../store/FinanceContext';
import { useSync } from '../store/CloudProvider';
import { formatCurrency } from '../utils/format';
import type { FinanceData } from '../types';

const field =
  'rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20';

function download(filename: string, content: string, type = 'application/json') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function Settings() {
  const { data, replaceAll, resetToSeed, setAssets } = useFinance();
  const sync = useSync();
  const plainFileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const exportPlain = () => {
    download(`fintable-備份-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(data, null, 2));
    setMsg('✅ 已匯出 JSON 備份（請妥善保管）');
  };

  const importPlain = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as FinanceData;
        if (!parsed.monthly || !parsed.assets || !parsed.goals) throw new Error();
        replaceAll(parsed);
        setMsg('✅ 已匯入備份（會自動同步上 Google Sheet）');
      } catch {
        setMsg('❌ 匯入失敗：檔案格式不正確');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const a = data.assets;
  const num = (v: string) => Number(v) || 0;
  const btn = 'rounded-lg px-4 py-2 text-sm font-medium';

  return (
    <div className="space-y-6">
      {msg && <p className="rounded-lg bg-white px-4 py-3 text-sm text-slate-700 shadow-sm ring-1 ring-slate-200">{msg}</p>}

      <Card title="☁ 雲端同步 (Google Sheet)" subtitle="資料自動同步，跨裝置共用">
        <div className="space-y-3">
          <p className="text-sm text-slate-600">
            狀態：
            <span className="font-medium text-slate-800">
              {sync?.status === 'synced'
                ? ' 已連接，自動同步中 ✅'
                : sync?.status === 'offline'
                ? ' 離線（顯示快取）'
                : sync?.status === 'error'
                ? ' 同步失敗'
                : ' 同步中…'}
            </span>
          </p>
          {sync?.lastError && <p className="break-words text-xs text-rose-500">{sync.lastError}</p>}
          <p className="text-xs text-slate-400">你的資料儲存在自己的 Google Sheet；在網站或 Sheet 任一邊修改都會同步。</p>
          <button onClick={() => sync?.disconnect()} className={`${btn} border border-slate-200 text-slate-600 hover:bg-slate-50`}>
            中斷連接（重新輸入連接資料）
          </button>
        </div>
      </Card>

      <Card title="資產設定" subtitle="調整資產組合與借貸數值">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-xs text-slate-500">
            投資組合總額
            <input type="number" defaultValue={a.investmentTotal} onBlur={(e) => setAssets({ investmentTotal: num(e.target.value) })} className={field} />
          </label>
          <label className="flex flex-col gap-1 text-xs text-slate-500">
            流動現金總額
            <input type="number" defaultValue={a.liquidCash} onBlur={(e) => setAssets({ liquidCash: num(e.target.value) })} className={field} />
          </label>
          <div className="flex flex-col justify-end gap-1 text-xs text-slate-400 sm:col-span-2">
            總資產 = 投資組合 + 流動現金
            <span className="text-sm font-semibold text-slate-700">
              {formatCurrency(a.investmentTotal + (a.liquidCash || 0), 'HKD')}
            </span>
          </div>
        </div>
        <div className="mt-4">
          <h3 className="mb-2 text-sm font-semibold text-slate-700">借貸</h3>
          <div className="space-y-2">
            {a.loans.map((l, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  defaultValue={l.name}
                  onBlur={(e) => setAssets({ loans: a.loans.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)) })}
                  className={`${field} flex-1`}
                  placeholder="名稱"
                />
                <input
                  type="number"
                  defaultValue={l.amount}
                  onBlur={(e) => setAssets({ loans: a.loans.map((x, j) => (j === i ? { ...x, amount: num(e.target.value) } : x)) })}
                  className={`${field} w-32 text-right`}
                />
                <button onClick={() => setAssets({ loans: a.loans.filter((_, j) => j !== i) })} className="text-xs text-rose-400 hover:text-rose-600">✕</button>
              </div>
            ))}
          </div>
          <button onClick={() => setAssets({ loans: [...a.loans, { name: '', amount: 0 }] })} className="mt-2 text-xs font-medium text-brand hover:underline">
            + 新增借貸
          </button>
        </div>
      </Card>

      <Card title="備份與重設" subtitle="匯出／匯入 JSON，或清空資料">
        <div className="flex flex-wrap gap-3">
          <button onClick={exportPlain} className={`${btn} border border-slate-200 text-slate-600 hover:bg-slate-50`}>
            匯出 JSON 備份
          </button>
          <button onClick={() => plainFileRef.current?.click()} className={`${btn} border border-slate-200 text-slate-600 hover:bg-slate-50`}>
            匯入 JSON 備份
          </button>
          <input ref={plainFileRef} type="file" accept="application/json" onChange={importPlain} className="hidden" />
          <button
            onClick={() => {
              if (window.confirm('確定要清空為空白範本嗎？目前資料會被覆蓋並同步到 Google Sheet（建議先匯出備份）。')) {
                resetToSeed();
                setMsg('已重設為空白範本');
              }
            }}
            className={`${btn} border border-rose-200 text-rose-600 hover:bg-rose-50`}
          >
            清空資料
          </button>
        </div>
      </Card>
    </div>
  );
}
