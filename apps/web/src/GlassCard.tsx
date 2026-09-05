import type { ReactNode, HTMLAttributes } from 'react';

export interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

export function GlassCard({ children, className = '', ...props }: GlassCardProps) {
  return (
    <div
      className={`glass-card ${className}`.trim()}
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        padding: '24px',
        ...props.style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
