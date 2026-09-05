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
          backgroundColor: 'rgba(255, 255, 255, 0.15)',
          color: '#ffffff',
          border: '1px solid rgba(255, 255, 255, 0.2)',
        };
      case 'powder':
        return {
          backgroundColor: 'rgba(212, 163, 115, 0.15)',
          color: '#ffffff',
          border: '1px solid #d4a373',
        };
      case 'default':
      default:
        return {
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          color: 'rgba(255, 255, 255, 0.7)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
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
