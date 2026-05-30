import { useState } from 'react';
import { ping, setCloudConfig } from './cloud';

const field =
  'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20';

// 雲端連接畫面：第一次使用（或中斷後）輸入 Google Sheet (Apps Script) 連接資料。
export function CloudSetup() {
  const [url, setUrl] = useState('');
  const [token, setToken] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const connect = async () => {
    const u = url.trim();
    const t = token.trim();
    if (!u.startsWith('https://') || !u.includes('/exec')) {
      return setMsg('❌ 網址應為 Apps Script 的 /exec 結尾網址');
    }
    if (!t) return setMsg('❌ 請填入密鑰');
    setBusy(true);
    setMsg('連接中…');
    try {
      const cfg = { url: u, token: t };
      await ping(cfg); // 測試連線（同時驗證密鑰）
      setCloudConfig(cfg);
      setMsg('✅ 已連接，載入中…');
      setTimeout(() => location.reload(), 500);
    } catch (err) {
      setMsg('❌ 連接失敗：' + String((err as Error).message || err));
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-slate-100 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-7 shadow-sm ring-1 ring-slate-200">
        <div className="text-center">
          <div className="text-3xl">📈</div>
          <h1 className="mt-2 text-lg font-bold text-slate-800">連接你的 Google Sheet</h1>
          <p className="mt-1 text-xs text-slate-400">資料儲存在你自己的 Google Sheet，跨裝置自動同步。</p>
        </div>

        <div className="mt-6 space-y-3">
          <label className="flex flex-col gap-1 text-xs text-slate-500">
            Apps Script 網址（/exec 結尾）
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className={field}
              placeholder="https://script.google.com/macros/s/XXXX/exec"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-slate-500">
            密鑰（與 Apps Script 的 SECRET 相同）
            <input value={token} onChange={(e) => setToken(e.target.value)} className={field} placeholder="你設定的密鑰" />
          </label>
          <button
            onClick={connect}
            disabled={busy}
            className="w-full rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {busy ? '連接中…' : '連接'}
          </button>
        </div>

        {msg && <p className="mt-4 break-words text-center text-sm text-slate-600">{msg}</p>}

        <p className="mt-5 text-[11px] leading-relaxed text-slate-400">
          設定步驟見專案 README「Google Sheet 自動同步」。密鑰會存在此瀏覽器；資料以明文存在你自己的 Google Sheet（受你的 Google 帳號保護）。
        </p>
      </div>
    </div>
  );
}
