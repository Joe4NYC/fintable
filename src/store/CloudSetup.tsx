import { useState } from 'react';
import { ping, setCloudConfig } from './cloud';

const field =
  'w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20';

const features = [
  { icon: '📊', title: '儀表板', desc: '總資產、淨資產、日常流動資金、資產配置與目標進度一覽' },
  { icon: '🧾', title: '每月收支', desc: '逐月記帳，收支長條 + 累計存款趨勢圖' },
  { icon: '🎯', title: '財務目標', desc: '設定金額與日期，自動算達成率與剩餘時間' },
  { icon: '💰', title: '預算', desc: '固定收支編列，計算每月可支配' },
];

// 連接畫面：新訪客可先「試用」（範例資料），或輸入自己的 Google Sheet 連接資料。
export function CloudSetup({ onTryDemo }: { onTryDemo: () => void }) {
  const [url, setUrl] = useState('');
  const [token, setToken] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [showConnect, setShowConnect] = useState(false);

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
    <div className="grid min-h-screen place-items-center bg-slate-100 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl bg-white p-7 shadow-sm ring-1 ring-slate-200">
        <div className="text-center">
          <div className="text-4xl">📈</div>
          <h1 className="mt-2 text-xl font-bold text-slate-800">Fintable · 個人理財</h1>
          <p className="mt-1 text-sm text-slate-500">把你的理財 Google Sheet 變成互動儀表板，方便輸入、清楚視覺化。</p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {features.map((f) => (
            <div key={f.title} className="rounded-xl bg-slate-50 p-3">
              <div className="text-sm font-semibold text-slate-700">
                <span className="mr-1">{f.icon}</span>
                {f.title}
              </div>
              <p className="mt-0.5 text-[11px] leading-snug text-slate-500">{f.desc}</p>
            </div>
          ))}
        </div>

        <button
          onClick={onTryDemo}
          className="mt-6 w-full rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          🧪 立即試用（範例資料）
        </button>
        <p className="mt-2 text-center text-[11px] text-slate-400">免設定、不需登入；試用資料不會儲存。</p>

        <div className="my-5 flex items-center gap-3 text-[11px] text-slate-400">
          <span className="h-px flex-1 bg-slate-200" />
          已有 Google Sheet？
          <span className="h-px flex-1 bg-slate-200" />
        </div>

        {!showConnect ? (
          <button
            onClick={() => setShowConnect(true)}
            className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            連接我的 Google Sheet
          </button>
        ) : (
          <div className="space-y-3">
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
            <p className="text-[11px] leading-relaxed text-slate-400">
              設定步驟見專案 README「Google Sheet 自動同步」。密鑰會存在此瀏覽器；資料以明文存在你自己的 Google Sheet（受你的 Google 帳號保護）。
            </p>
          </div>
        )}

        {msg && <p className="mt-4 break-words text-center text-sm text-slate-600">{msg}</p>}
      </div>
    </div>
  );
}
