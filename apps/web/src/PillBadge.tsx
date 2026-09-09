import type { ReactNode, HTMLAttributes } from 'react';

export interface PillBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'active' | 'powder';
}

export function PillBadge({ children, className = '', variant = 'default', ...props }: PillBadgeProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'active':
        return {
          backgroundColor: 'var(--mw-cta, #1c1a17)',
          color: 'var(--mw-cta-ink, #f7f5f1)',
          border: '1px solid var(--mw-cta, #1c1a17)',
        };
      case 'powder':
        return {
          backgroundColor: 'var(--mw-chip, #e9e2d6)',
          color: 'var(--mw-ink, #1c1a17)',
          border: '1px solid var(--mw-line, rgba(28,26,23,.10))',
        };
      case 'default':
      default:
        return {
          backgroundColor: 'var(--mw-card-tint, #fbf9f6)',
          color: 'var(--mw-muted, #6b645b)',
          border: '1px solid var(--mw-line, rgba(28,26,23,.10))',
        };
    }
  };

  return (
    <span
      className={`pill-badge ${className}`.trim()}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 14px',
        borderRadius: '999px',
        fontSize: '12px',
        fontWeight: 500,
        letterSpacing: '0.04em',
        transition: 'all 0.2s ease',
        ...getVariantStyles(),
        ...props.style,
      }}
      {...props}
    >
      {children}
    </span>
  );
}
