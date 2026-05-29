import { useRef, useState } from 'react';
import { isVault } from '../utils/crypto';
import type { Vault } from '../utils/crypto';
import { VAULT_KEY } from '../store/vaultStorage';

interface LockScreenProps {
  mode: 'setup' | 'unlock';
  busy: boolean;
  error: string | null;
  onSubmit: (passphrase: string) => void;
  onImportVault: (vault: Vault) => void;
}

const field =
  'w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20';

export function LockScreen({ mode, busy, error, onSubmit, onImportVault }: LockScreenProps) {
  const [pass, setPass] = useState('');
  const [confirm, setConfirm] = useState('');
  const [localErr, setLocalErr] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setLocalErr(null);
    if (pass.length < 6) {
      setLocalErr('密碼至少 6 個字元。');
      return;
    }
    if (mode === 'setup' && pass !== confirm) {
      setLocalErr('兩次輸入的密碼不一致。');
      return;
    }
    onSubmit(pass);
  };

  const importFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        if (!isVault(parsed)) throw new Error();
        onImportVault(parsed);
      } catch {
        setLocalErr('這不是有效的加密備份檔 (vault.json)。');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="grid min-h-screen place-items-center bg-slate-100 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-7 shadow-sm ring-1 ring-slate-200">
        <div className="mb-5 text-center">
          <div className="text-3xl">🔐</div>
          <h1 className="mt-2 text-lg font-bold text-slate-800">Fintable</h1>
          <p className="mt-1 text-xs text-slate-400">
            {mode === 'setup' ? '設定一個密碼來加密你的理財資料' : '輸入密碼以解鎖你的理財資料'}
          </p>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <input
            type="password"
            autoFocus
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            className={field}
            placeholder="密碼"
            autoComplete={mode === 'setup' ? 'new-password' : 'current-password'}
          />
          {mode === 'setup' && (
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className={field}
              placeholder="再次輸入密碼"
              autoComplete="new-password"
            />
          )}

          {(localErr || error) && (
            <p className="text-sm text-rose-600">{localErr || error}</p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {busy ? '處理中…' : mode === 'setup' ? '建立並進入' : '解鎖'}
          </button>
        </form>

        <div className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-center">
          <button
            onClick={() => fileRef.current?.click()}
            className="block w-full text-xs font-medium text-brand hover:underline"
          >
            從加密備份檔 (vault.json) 還原
          </button>
          <input ref={fileRef} type="file" accept="application/json" onChange={importFile} className="hidden" />
          <button
            onClick={() => {
              if (
                window.confirm(
                  '重設此裝置：會清除這部瀏覽器暫存的資料，改用網站附帶的加密資料。\n（不會刪除網站或你的加密備份檔。）確定嗎？'
                )
              ) {
                localStorage.removeItem(VAULT_KEY);
                location.reload();
              }
            }}
            className="block w-full text-xs text-slate-400 hover:text-slate-600 hover:underline"
          >
            資料不對 / 看到空白？重設此裝置
          </button>
        </div>

        {mode === 'setup' && (
          <p className="mt-4 text-center text-[11px] leading-relaxed text-slate-400">
            ⚠️ 密碼用於加密，無法找回。請牢記，並到「設定」匯出加密備份。
          </p>
        )}
      </div>
    </div>
  );
}
