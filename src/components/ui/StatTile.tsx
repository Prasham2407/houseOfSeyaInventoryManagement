import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Tone = 'neutral' | 'warning' | 'danger';

const toneAccent: Record<Tone, string> = {
  neutral: 'text-graphite-900',
  warning: 'text-amber-700',
  danger: 'text-red-700',
};

const iconTone: Record<Tone, string> = {
  neutral: 'text-graphite-400 bg-graphite-50',
  warning: 'text-amber-600 bg-amber-50',
  danger: 'text-red-600 bg-red-50',
};

export function StatTile({
  label,
  value,
  icon,
  tone = 'neutral',
  hint,
}: {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  tone?: Tone;
  hint?: string;
}) {
  return (
    <div className="rounded-lg border border-graphite-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium text-graphite-500">{label}</span>
        {icon && (
          <span className={cn('flex h-8 w-8 items-center justify-center rounded-md', iconTone[tone])}>
            {icon}
          </span>
        )}
      </div>
      <p className={cn('mt-3 text-[22px] font-semibold leading-none tabular-nums sm:text-[26px]', toneAccent[tone])}>{value}</p>
      {hint && <p className="mt-2 text-xs text-graphite-400">{hint}</p>}
    </div>
  );
}
