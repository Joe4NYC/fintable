import { useRef, useState } from 'react';
import { Card } from '../components/Card';
import { useFinance } from '../store/FinanceContext';
import { useAuthOptional } from '../store/VaultGate';
import { useSync } from '../store/CloudProvider';
import { ping, push, setCloudConfig } from '../store/cloud';
import { isVault } from '../utils/crypto';
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
  const auth = useAuthOptional();
  const sync = useSync();
  const plainFileRef = useRef<HTMLInputElement>(null);
  const vaultFileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [showChangePass, setShowChangePass] = useState(false);
  const [newPass, setNewPass] = useState('');
  const [newPass2, setNewPass2] = useState('');
  const [cloudUrl, setCloudUrl] = useState('');
  const [cloudToken, setCloudToken] = useState('');
  const [connecting, setConnecting] = useState(false);

  const connectCloud = async () => {
    const url = cloudUrl.trim();
    const token = cloudToken.trim();
    if (!url.startsWith('https://') || !url.includes('/exec')) {
      return setMsg('❌ 網址應為 Apps Script 的 /exec 結尾網址');
    }
    if (!token) return setMsg('❌ 請填入密鑰');
    setConnecting(true);
    setMsg('連接中…');
    try {
      const cfg = { url, token };
      await ping(cfg); // 測試連線
      await push(cfg, data); // 把目前資料上傳到 Sheet 當作初始內容
      setCloudConfig(cfg);
      setMsg('✅ 已連接並上傳，重新載入中…');
      setTimeout(() => location.reload(), 600);
    } catch (err) {
      setMsg('❌ 連接失敗：' + String((err as Error).message || err));
    } finally {
      setConnecting(false);
    }
  };

  const exportEncrypted = () => {
    const blob = auth?.exportVaultBlob();
    if (!blob) {
      setMsg('❌ 尚無加密資料可匯出');
      return;
    }
    download('vault.json', blob);
    setMsg('✅ 已匯出加密備份 vault.json（部署用此檔；換裝置也可用它還原）');
  };

  const importEncrypted = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (!isVault(parsed)) throw new Error();
        auth?.importVault(parsed); // 會回到鎖定畫面，用該檔的密碼解鎖
      } catch {
        setMsg('❌ 這不是有效的加密備份檔');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const exportPlain = () => {
    download(`fintable-明文備份-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(data, null, 2));
    setMsg('⚠️ 已匯出「明文」備份（未加密，請妥善保管，勿上傳到公開地方）');
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
        setMsg('✅ 已匯入明文備份（已用目前密碼重新加密儲存）');
      } catch {
        setMsg('❌ 匯入失敗：檔案格式不正確');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const submitChangePass = async () => {
    if (!auth) return;
    if (newPass.length < 6) return setMsg('❌ 新密碼至少 6 字元');
    if (newPass !== newPass2) return setMsg('❌ 兩次新密碼不一致');
    await auth.changePassphrase(newPass, data);
    setShowChangePass(false);
    setNewPass('');
    setNewPass2('');
    setMsg('✅ 密碼已更改（請重新匯出 vault.json 再部署）');
  };

  const a = data.assets;
  const num = (v: string) => Number(v) || 0;
  const btn = 'rounded-lg px-4 py-2 text-sm font-medium';

  return (
    <div className="space-y-6">
      {msg && <p className="rounded-lg bg-white px-4 py-3 text-sm text-slate-700 shadow-sm ring-1 ring-slate-200">{msg}</p>}

      <Card title="☁ 雲端同步 (Google Sheet)" subtitle="連接後資料自動同步，跨裝置共用">
        {sync ? (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              狀態：<span className="font-medium text-slate-800">{sync.status === 'synced' ? '已連接，自動同步中 ✅' : sync.status === 'offline' ? '離線（顯示快取）' : sync.status === 'error' ? '同步失敗' : '同步中…'}</span>
            </p>
            {sync.lastError && <p className="break-words text-xs text-rose-500">{sync.lastError}</p>}
            <p className="text-xs text-slate-400">你的資料儲存在自己的 Google Sheet；在網站或 Sheet 任一邊修改都會同步。</p>
            <button onClick={sync.disconnect} className={`${btn} border border-slate-200 text-slate-600 hover:bg-slate-50`}>
              中斷連接（改用本機模式）
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-slate-500">貼上你的 Apps Script 網址與密鑰即可啟用自動同步（設定步驟見 README）。</p>
            <div className="grid grid-cols-1 gap-3">
              <label className="flex flex-col gap-1 text-xs text-slate-500">
                Apps Script 網址（/exec 結尾）
                <input value={cloudUrl} onChange={(e) => setCloudUrl(e.target.value)} className={field} placeholder="https://script.google.com/macros/s/XXXX/exec" />
              </label>
              <label className="flex flex-col gap-1 text-xs text-slate-500">
                密鑰（與 Apps Script 的 SECRET 相同）
                <input value={cloudToken} onChange={(e) => setCloudToken(e.target.value)} className={field} placeholder="你設定的密鑰" />
              </label>
            </div>
            <button onClick={connectCloud} disabled={connecting} className={`${btn} bg-brand text-white hover:bg-blue-700 disabled:opacity-50`}>
              {connecting ? '連接中…' : '連接並上傳目前資料'}
            </button>
            <p className="text-[11px] leading-relaxed text-slate-400">⚠️ 連接後資料會以明文存在你自己的 Google Sheet（受你的 Google 帳號保護）。密鑰會存在此瀏覽器。</p>
          </div>
        )}
      </Card>

      {auth && (
        <Card title="🔐 安全與加密" subtitle="本機模式：資料以密碼 AES-GCM 加密後才儲存">
          <div className="flex flex-wrap gap-3">
            <button onClick={exportEncrypted} className={`${btn} bg-brand text-white hover:bg-blue-700`}>
              匯出加密備份 (vault.json)
            </button>
            <button onClick={() => vaultFileRef.current?.click()} className={`${btn} border border-slate-200 text-slate-600 hover:bg-slate-50`}>
              從加密檔還原
            </button>
            <input ref={vaultFileRef} type="file" accept="application/json" onChange={importEncrypted} className="hidden" />
            <button onClick={() => setShowChangePass((v) => !v)} className={`${btn} border border-slate-200 text-slate-600 hover:bg-slate-50`}>
              更改密碼
            </button>
            <button onClick={() => auth.lock()} className={`${btn} border border-slate-200 text-slate-600 hover:bg-slate-50`}>
              🔒 立即鎖定
            </button>
          </div>

          {showChangePass && (
            <div className="mt-4 flex flex-wrap items-end gap-3 rounded-xl bg-slate-50 p-4">
              <label className="flex flex-col gap-1 text-xs text-slate-500">
                新密碼
                <input type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} className={field} />
              </label>
              <label className="flex flex-col gap-1 text-xs text-slate-500">
                再次輸入
                <input type="password" value={newPass2} onChange={(e) => setNewPass2(e.target.value)} className={field} />
              </label>
              <button onClick={submitChangePass} className={`${btn} bg-brand text-white hover:bg-blue-700`}>
                確認更改
              </button>
            </div>
          )}

          <p className="mt-4 text-[11px] leading-relaxed text-slate-400">
            ⚠️ 密碼無法找回。要在公開網站部署你的資料，請在本機執行 <code className="rounded bg-slate-100 px-1">node scripts/make-vault.mjs</code> 產生 vault.json，或在此匯出加密備份後放到 <code className="rounded bg-slate-100 px-1">public/vault.json</code> 再部署。
          </p>
        </Card>
      )}

      <Card title="資產設定" subtitle="調整資產組合與借貸數值">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-xs text-slate-500">
            投資組合總額
            <input type="number" defaultValue={a.investmentTotal} onBlur={(e) => setAssets({ investmentTotal: num(e.target.value) })} className={field} />
          </label>
          <label className="flex flex-col gap-1 text-xs text-slate-500">
            流動現金總額（含緊急後備金）
            <input type="number" defaultValue={a.liquidCash} onBlur={(e) => setAssets({ liquidCash: num(e.target.value) })} className={field} />
          </label>
          <label className="flex flex-col gap-1 text-xs text-slate-500">
            緊急後備金
            <input type="number" defaultValue={a.emergencyFund} onBlur={(e) => setAssets({ emergencyFund: num(e.target.value) })} className={field} />
          </label>
          <div className="flex flex-col justify-end gap-1 text-xs text-slate-400">
            總資產 = 投資組合 +（流動現金 − 緊急後備金）
            <span className="text-sm font-semibold text-slate-700">
              {formatCurrency(a.investmentTotal + ((a.liquidCash || 0) - a.emergencyFund), 'HKD')}
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

      <Card title="明文備份與重設" subtitle="明文匯出未加密，僅供自己保存或遷移">
        <div className="flex flex-wrap gap-3">
          <button onClick={exportPlain} className={`${btn} border border-slate-200 text-slate-600 hover:bg-slate-50`}>
            匯出明文 JSON
          </button>
          <button onClick={() => plainFileRef.current?.click()} className={`${btn} border border-slate-200 text-slate-600 hover:bg-slate-50`}>
            匯入明文 JSON
          </button>
          <input ref={plainFileRef} type="file" accept="application/json" onChange={importPlain} className="hidden" />
          <button
            onClick={() => {
              if (confirm('確定要清空為空白範本嗎？目前資料會被覆蓋（建議先匯出加密備份）。')) {
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
