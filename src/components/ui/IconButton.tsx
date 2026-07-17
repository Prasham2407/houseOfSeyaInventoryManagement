import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Tone = 'neutral' | 'brand' | 'danger' | 'amber';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  tone?: Tone;
  label: string;
  children: ReactNode;
}

const toneClasses: Record<Tone, string> = {
  neutral: 'text-graphite-500 hover:bg-graphite-100 hover:text-graphite-800',
  brand: 'text-sky-600 hover:bg-sky-50 hover:text-sky-700',
  danger: 'text-red-600 hover:bg-red-50 hover:text-red-700',
  amber: 'text-amber-700 hover:bg-amber-50 hover:text-amber-800',
};

export function IconButton({ tone = 'neutral', label, className, children, ...rest }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md transition-colors',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-graphite-400',
        'disabled:cursor-not-allowed disabled:opacity-40',
        toneClasses[tone],
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
