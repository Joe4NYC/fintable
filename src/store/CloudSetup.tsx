import { useState } from 'react';
import { FlaskConical, LayoutDashboard, NotebookText, Target, TrendingUp, Wallet } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Button } from '../components/Button';
import { fieldClass } from '../components/formStyles';
import { ping, setCloudConfig } from './cloud';

const field = `w-full ${fieldClass}`;

const features: { icon: LucideIcon; title: string; desc: string }[] = [
  { icon: LayoutDashboard, title: '儀表板', desc: '總資產、淨資產、日常流動資金、資產配置與目標進度一覽' },
  { icon: NotebookText, title: '每月收支', desc: '逐月記帳，收支長條 + 累計存款趨勢圖' },
  { icon: Target, title: '財務目標', desc: '設定金額與日期，自動算達成率與剩餘時間' },
  { icon: Wallet, title: '預算', desc: '固定收支編列，計算每月可支配' },
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
    <div className="grid min-h-screen place-items-center bg-bg px-4 py-10">
      <div className="w-full max-w-md rounded-card bg-surface p-7 shadow-card ring-1 ring-line">
        <div className="text-center">
          <div className="flex justify-center">
            <TrendingUp size={36} className="text-brand" />
          </div>
          <h1 className="mt-2 text-xl font-bold text-content">Fintable · 個人理財</h1>
          <p className="mt-1 text-sm text-content-muted">把你的理財 Google Sheet 變成互動儀表板，方便輸入、清楚視覺化。</p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="rounded-xl bg-surface-2 p-3">
                <div className="flex items-center gap-1.5 text-sm font-semibold text-content">
                  <Icon size={16} className="text-brand" />
                  {f.title}
                </div>
                <p className="mt-0.5 text-[11px] leading-snug text-content-muted">{f.desc}</p>
              </div>
            );
          })}
        </div>

        <Button onClick={onTryDemo} className="mt-6 w-full py-2.5 font-semibold">
          <FlaskConical size={16} />
          立即試用（範例資料）
        </Button>
        <p className="mt-2 text-center text-[11px] text-content-faint">免設定、不需登入；試用資料不會儲存。</p>

        <div className="my-5 flex items-center gap-3 text-[11px] text-content-faint">
          <span className="h-px flex-1 bg-line" />
          已有 Google Sheet？
          <span className="h-px flex-1 bg-line" />
        </div>

        {!showConnect ? (
          <Button variant="secondary" onClick={() => setShowConnect(true)} className="w-full">
            連接我的 Google Sheet
          </Button>
        ) : (
          <div className="space-y-3">
            <label className="flex flex-col gap-1 text-xs text-content-muted">
              Apps Script 網址（/exec 結尾）
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className={field}
                placeholder="https://script.google.com/macros/s/XXXX/exec"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-content-muted">
              密鑰（與 Apps Script 的 SECRET 相同）
              <input value={token} onChange={(e) => setToken(e.target.value)} className={field} placeholder="你設定的密鑰" />
            </label>
            <Button onClick={connect} disabled={busy} className="w-full">
              {busy ? '連接中…' : '連接'}
            </Button>
            <p className="text-[11px] leading-relaxed text-content-faint">
              設定步驟見專案 README「Google Sheet 自動同步」。密鑰會存在此瀏覽器；資料以明文存在你自己的 Google Sheet（受你的 Google 帳號保護）。
            </p>
          </div>
        )}

        {msg && <p className="mt-4 break-words text-center text-sm text-content-muted">{msg}</p>}
      </div>
    </div>
  );
}
