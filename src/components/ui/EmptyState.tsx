import type { ReactNode } from 'react';

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
      {icon && <div className="mb-1 text-graphite-300">{icon}</div>}
      <p className="text-sm font-medium text-graphite-700">{title}</p>
      {description && <p className="max-w-sm text-sm text-graphite-400">{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
