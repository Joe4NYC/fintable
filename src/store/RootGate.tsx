import { useState } from 'react';
import type { ReactNode } from 'react';
import { getCloudConfig } from './cloud';
import { CloudProvider } from './CloudProvider';
import { CloudSetup } from './CloudSetup';
import { DemoProvider } from './DemoProvider';

// 三種狀態：
//  1. 已連接 Google Sheet → 正式使用（CloudProvider）
//  2. 試用模式 → 範例資料，不儲存（DemoProvider）
//  3. 皆無 → 連接畫面（CloudSetup，可選擇先試用）
export function RootGate({ children }: { children: ReactNode }) {
  const [demo, setDemo] = useState(false);

  if (getCloudConfig()) {
    return <CloudProvider>{children}</CloudProvider>;
  }
  if (demo) {
    return <DemoProvider onExit={() => setDemo(false)}>{children}</DemoProvider>;
  }
  return <CloudSetup onTryDemo={() => setDemo(true)} />;
}
