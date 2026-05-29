import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { FinanceData } from '../types';
import type { Vault } from '../utils/crypto';
import { isVault } from '../utils/crypto';
import { seedData } from '../data/seed';
import { FinanceProvider } from './FinanceContext';
import { LockScreen } from '../components/LockScreen';
import {
  clearLocalVault,
  encryptData,
  fetchBundledVault,
  readLocalVault,
  unlockToData,
  writeLocalVault,
} from './vaultStorage';

type Status = 'loading' | 'setup' | 'locked' | 'unlocked';

interface AuthContextValue {
  lock: () => void;
  exportVaultBlob: () => string | null; // 最新的加密 vault JSON 字串
  importVault: (vault: Vault) => void; // 匯入加密檔，回到鎖定畫面用該檔密碼解鎖
  changePassphrase: (newPassphrase: string, data: FinanceData) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within VaultGate');
  return ctx;
}

// 雲端模式沒有 AuthContext，回傳 null 而非丟錯
export function useAuthOptional() {
  return useContext(AuthContext);
}

export function VaultGate({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>('loading');
  const [vault, setVault] = useState<Vault | null>(null);
  const [data, setData] = useState<FinanceData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const passphraseRef = useRef<string | null>(null);
  const saveChain = useRef<Promise<unknown>>(Promise.resolve());

  // 初始載入：先看本機 localStorage，再看部署附帶的 vault.json
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const local = readLocalVault();
      if (local) {
        if (!cancelled) {
          setVault(local);
          setStatus('locked');
        }
        return;
      }
      const bundled = await fetchBundledVault();
      if (cancelled) return;
      if (bundled) {
        setVault(bundled);
        setStatus('locked');
      } else {
        setStatus('setup');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const persist = useCallback((next: FinanceData) => {
    const pass = passphraseRef.current;
    if (!pass) return;
    saveChain.current = saveChain.current
      .then(() => encryptData(pass, next))
      .then((v) => writeLocalVault(v))
      .catch(() => {});
  }, []);

  const unlock = useCallback(
    async (passphrase: string) => {
      if (!vault) return;
      setBusy(true);
      setError(null);
      try {
        const decrypted = await unlockToData(passphrase, vault);
        passphraseRef.current = passphrase;
        writeLocalVault(vault); // 在此裝置快取加密檔
        setData(decrypted);
        setStatus('unlocked');
      } catch {
        setError('密碼錯誤，請再試一次。');
      } finally {
        setBusy(false);
      }
    },
    [vault]
  );

  const setup = useCallback(async (passphrase: string) => {
    setBusy(true);
    setError(null);
    try {
      const v = await encryptData(passphrase, seedData);
      writeLocalVault(v);
      passphraseRef.current = passphrase;
      setVault(v);
      setData(seedData);
      setStatus('unlocked');
    } finally {
      setBusy(false);
    }
  }, []);

  const lock = useCallback(() => {
    passphraseRef.current = null;
    setData(null);
    setError(null);
    setStatus(readLocalVault() ? 'locked' : 'setup');
  }, []);

  const exportVaultBlob = useCallback(() => {
    const v = readLocalVault();
    return v ? JSON.stringify(v, null, 2) : null;
  }, []);

  const importVault = useCallback((v: Vault) => {
    if (!isVault(v)) return;
    clearLocalVault();
    writeLocalVault(v);
    passphraseRef.current = null;
    setData(null);
    setVault(v);
    setStatus('locked'); // 以匯入檔的密碼重新解鎖
  }, []);

  const changePassphrase = useCallback(async (newPassphrase: string, current: FinanceData) => {
    const v = await encryptData(newPassphrase, current);
    writeLocalVault(v);
    passphraseRef.current = newPassphrase;
    setVault(v);
  }, []);

  if (status === 'loading') {
    return <div className="grid min-h-screen place-items-center text-slate-400">載入中…</div>;
  }

  if (status === 'setup' || status === 'locked') {
    return (
      <LockScreen
        mode={status === 'setup' ? 'setup' : 'unlock'}
        busy={busy}
        error={error}
        onSubmit={status === 'setup' ? setup : unlock}
        onImportVault={importVault}
      />
    );
  }

  return (
    <AuthContext.Provider value={{ lock, exportVaultBlob, importVault, changePassphrase }}>
      <FinanceProvider initialData={data!} onChange={persist}>
        {children}
      </FinanceProvider>
    </AuthContext.Provider>
  );
}
