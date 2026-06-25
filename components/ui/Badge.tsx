import { ReactNode } from 'react';

type BadgeVariant = 'brand' | 'blue' | 'dark' | 'green' | 'gray';

interface BadgeProps {
  variant?: BadgeVariant;
  blur?: boolean;
  children: ReactNode;
  className?: string;
}

const VARIANTS: Record<BadgeVariant, string> = {
  brand: 'bg-brand-600/90 text-white',
  blue:  'bg-blue-600/90 text-white',
  dark:  'bg-gray-900/75 text-white',
  green: 'bg-green-500 text-white',
  gray:  'bg-gray-100 text-gray-600',
};

export default function Badge({
  variant = 'gray',
  blur = false,
  children,
  className = '',
}: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold leading-none',
        VARIANTS[variant],
        blur ? 'backdrop-blur-sm' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </span>
  );
}
