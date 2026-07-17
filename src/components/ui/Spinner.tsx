import { cn } from '@/lib/cn';

export function Spinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'h-5 w-5 animate-spin rounded-full border-2 border-graphite-300 border-t-brand-600',
        className,
      )}
    />
  );
}

export function FullPageSpinner() {
  return (
    <div className="flex h-full min-h-[300px] items-center justify-center">
      <Spinner className="h-8 w-8" />
    </div>
  );
}
