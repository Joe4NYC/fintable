/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // 語意化色票（深色金融）→ 由 index.css 的 CSS 變數提供
        bg: 'var(--color-bg)',
        surface: {
          DEFAULT: 'var(--color-surface)',
          2: 'var(--color-surface-2)',
        },
        line: 'var(--color-line)',
        content: {
          DEFAULT: 'var(--color-text)',
          muted: 'var(--color-muted)',
          faint: 'var(--color-faint)',
        },
        brand: {
          DEFAULT: 'var(--color-brand)',
          2: 'var(--color-brand-2)',
        },
        danger: 'var(--color-danger)',
        warn: 'var(--color-warn)',
        // 保留舊名以防遺漏
        ink: '#0f172a',
      },
      borderRadius: {
        card: '1rem',
      },
      boxShadow: {
        card: '0 1px 2px 0 rgb(0 0 0 / 0.4), 0 1px 3px 0 rgb(0 0 0 / 0.3)',
      },
      fontFamily: {
        sans: ['"PingFang HK"', '"Noto Sans TC"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
