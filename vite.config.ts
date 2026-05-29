import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// 部署到 GitHub Pages 專案站（Joe4NYC.github.io/fintable）時需要子路徑 base。
// 本機開發 / 預覽維持根路徑 '/'。
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' ? '/fintable/' : '/',
}));
