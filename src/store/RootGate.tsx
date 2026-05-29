import type { ReactNode } from 'react';
import { getCloudConfig } from './cloud';
import { CloudProvider } from './CloudProvider';
import { VaultGate } from './VaultGate';

// 有設定 Google Sheet 同步 → 雲端模式（不上鎖）；否則 → 本機加密模式。
export function RootGate({ children }: { children: ReactNode }) {
  if (getCloudConfig()) {
    return <CloudProvider>{children}</CloudProvider>;
  }
  return <VaultGate>{children}</VaultGate>;
}
