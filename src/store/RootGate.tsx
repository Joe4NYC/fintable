import type { ReactNode } from 'react';
import { getCloudConfig } from './cloud';
import { CloudProvider } from './CloudProvider';
import { CloudSetup } from './CloudSetup';

// 只用雲端模式：已連接 Google Sheet → 進入 App；未連接 → 連接畫面。
export function RootGate({ children }: { children: ReactNode }) {
  if (getCloudConfig()) {
    return <CloudProvider>{children}</CloudProvider>;
  }
  return <CloudSetup />;
}
