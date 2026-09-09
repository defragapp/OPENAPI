import type { ReactNode, HTMLAttributes } from 'react';

export interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

export function GlassCard({ children, className = '', ...props }: GlassCardProps) {
  return (
    <div
      className={`glass-card mindwave-card ${className}`.trim()}
      data-visual-system="mindwave"
      style={{
        backgroundColor: 'var(--mw-card, #ffffff)',
        border: '1px solid var(--mw-line, rgba(28,26,23,.10))',
        borderRadius: 'var(--mw-radius-card, 24px)',
        padding: '32px',
        boxShadow: 'var(--mw-shadow, 0 20px 50px rgba(28,26,23,.08))',
        color: 'var(--mw-ink, #1c1a17)',
        ...props.style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
