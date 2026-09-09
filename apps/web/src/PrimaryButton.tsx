import type { ReactNode, ButtonHTMLAttributes, AnchorHTMLAttributes } from 'react';

type BaseProps = {
  children: ReactNode;
  className?: string;
  variant?: 'primary' | 'powder' | 'glass';
  href?: string;
};

export type PrimaryButtonProps = BaseProps &
  (
    | (ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined })
    | (AnchorHTMLAttributes<HTMLAnchorElement> & { href: string })
  );

export function PrimaryButton({
  children,
  className = '',
  variant = 'primary',
  href,
  ...props
}: PrimaryButtonProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'powder':
        return {
          backgroundColor: 'var(--mw-chip, #e9e2d6)',
          color: 'var(--mw-ink, #1c1a17)',
          border: '1px solid var(--mw-line, rgba(28,26,23,.10))',
        };
      case 'glass':
        return {
          backgroundColor: 'transparent',
          color: 'var(--mw-ink, #1c1a17)',
          border: '1px solid var(--mw-line-strong, rgba(28,26,23,.18))',
        };
      case 'primary':
      default:
        return {
          backgroundColor: 'var(--mw-cta, #1c1a17)',
          color: 'var(--mw-cta-ink, #f7f5f1)',
          border: '1px solid var(--mw-cta, #1c1a17)',
        };
    }
  };

  const style: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px 24px',
    borderRadius: '999px',
    fontSize: '14px',
    fontWeight: 600,
    textDecoration: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    ...getVariantStyles(),
    ...(props.style ?? {}),
  };

  if (href) {
    const { style: _ignoredStyle, ...anchorProps } = props as AnchorHTMLAttributes<HTMLAnchorElement> & { style?: React.CSSProperties };
    return (
      <a
        href={href}
        className={`primary-button ${className}`.trim()}
        style={style}
        {...anchorProps}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      className={`primary-button ${className}`.trim()}
      style={style}
      {...((({ style: _ignoredStyle2, ...rest }) => rest)(props as ButtonHTMLAttributes<HTMLButtonElement> & { style?: React.CSSProperties }))}
    >
      {children}
    </button>
  );
}
