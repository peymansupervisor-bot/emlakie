import Link from 'next/link';
import { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  href?: string;
  fullWidth?: boolean;
  children: ReactNode;
}

const BASE =
  'inline-flex items-center justify-center gap-1.5 font-display font-semibold tracking-tight leading-none transition ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 ' +
  'disabled:opacity-50 disabled:pointer-events-none';

const VARIANTS: Record<Variant, string> = {
  primary:   'rounded-xl bg-brand-600 text-white hover:bg-brand-700',
  secondary: 'rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50',
  ghost:     'text-gray-500 hover:text-gray-900',
};

const SIZES: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-5 py-3 text-sm',
  xl: 'px-8 py-3.5 text-sm',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  href,
  fullWidth = false,
  className = '',
  children,
  ...props
}: ButtonProps) {
  const classes = [
    BASE,
    VARIANTS[variant],
    SIZES[size],
    fullWidth ? 'w-full' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
