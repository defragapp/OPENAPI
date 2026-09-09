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
          backgroundColor: '#d4a373',
          color: '#0a0a0a',
          border: '1px solid #d4a373',
        };
      case 'glass':
        return {
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
          color: '#ffffff',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(8px)',
        };
      case 'primary':
      default:
        return {
          backgroundColor: '#ffffff',
          color: '#0a0a0a',
          border: '1px solid #ffffff',
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
