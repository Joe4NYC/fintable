import type { ReactNode } from 'react';

interface CardProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}

export function Card({ title, subtitle, children, className = '', action }: CardProps) {
  return (
    <section className={`rounded-card bg-surface p-5 shadow-card ring-1 ring-line ${className}`}>
      {(title || action) && (
        <header className="mb-4 flex items-start justify-between gap-2">
          <div>
            {title && <h2 className="text-base font-semibold text-content">{title}</h2>}
            {subtitle && <p className="mt-0.5 text-xs text-content-muted">{subtitle}</p>}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  );
}
