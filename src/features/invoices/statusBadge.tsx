import { Badge } from '@/components/ui';
import type { InvoiceStatus } from '@/types';

const toneByStatus: Record<InvoiceStatus, 'neutral' | 'info' | 'success' | 'danger'> = {
  DRAFT: 'neutral',
  ISSUED: 'info',
  PAID: 'success',
  CANCELLED: 'danger',
};

export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  return <Badge tone={toneByStatus[status]}>{status}</Badge>;
}

export function currency(n: number) {
  return n.toLocaleString(undefined, { style: 'currency', currency: 'USD' });
}
