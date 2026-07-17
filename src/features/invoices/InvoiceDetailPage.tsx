import { useParams, useNavigate, Link } from 'react-router-dom';
import { extractErrorMessage } from '@/lib/apiClient';
import { Button, Card, CardBody, CardHeader, FullPageSpinner, PageHeader, Table, type Column } from '@/components/ui';
import { useCancelInvoice, useInvoice, useIssueInvoice, useMarkInvoicePaid } from './hooks';
import { InvoiceStatusBadge, currency } from './statusBadge';
import type { InvoiceItem } from '@/types';
import { useState } from 'react';

export function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: invoice, isLoading } = useInvoice(id);
  const issueInvoice = useIssueInvoice();
  const markPaid = useMarkInvoicePaid();
  const cancelInvoice = useCancelInvoice();
  const [actionError, setActionError] = useState<string | null>(null);

  if (isLoading) return <FullPageSpinner />;
  if (!invoice) {
    return (
      <div className="py-16 text-center text-sm text-graphite-400">
        Invoice not found. <Link to="/invoices" className="text-brand-600 hover:underline">Back to invoices</Link>
      </div>
    );
  }

  const columns: Column<InvoiceItem>[] = [
    {
      key: 'product',
      header: 'Product',
      render: (item) => (
        <div>
          <p className="font-medium text-graphite-900">{item.productName}</p>
          <p className="text-xs text-graphite-400">{item.sku}</p>
        </div>
      ),
    },
    { key: 'qty', header: 'Qty', align: 'right', render: (item) => item.quantity },
    { key: 'unitPrice', header: 'Unit price', align: 'right', render: (item) => currency(item.unitPrice) },
    { key: 'lineTotal', header: 'Line total', align: 'right', render: (item) => currency(item.lineTotal) },
  ];

  const runAction = async (action: () => Promise<unknown>) => {
    setActionError(null);
    try {
      await action();
    } catch (err) {
      setActionError(extractErrorMessage(err, 'Action failed.'));
    }
  };

  return (
    <div>
      <PageHeader
        title={invoice.invoiceNumber}
        description={`Billed to ${invoice.customerName}`}
        action={
          <div className="flex items-center gap-3">
            <InvoiceStatusBadge status={invoice.status} />
            <Button variant="secondary" size="sm" onClick={() => navigate('/invoices')}>
              Back
            </Button>
          </div>
        }
      />

      {actionError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {actionError}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader title="Line items" />
            <Table columns={columns} rows={invoice.items} getRowKey={(item) => item.id} />
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader title="Summary" />
            <CardBody>
              <dl className="flex flex-col gap-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-graphite-500">Subtotal</dt>
                  <dd className="font-medium text-graphite-800">{currency(invoice.subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-graphite-500">Tax</dt>
                  <dd className="font-medium text-graphite-800">{currency(invoice.tax)}</dd>
                </div>
                <div className="mt-1 flex justify-between border-t border-graphite-100 pt-2 text-base">
                  <dt className="font-semibold text-graphite-900">Total</dt>
                  <dd className="font-semibold text-graphite-900">{currency(invoice.total)}</dd>
                </div>
              </dl>
              <p className="mt-4 text-xs text-graphite-400">
                Created {new Date(invoice.createdAt).toLocaleString()}
                {invoice.issuedAt && <> · Issued {new Date(invoice.issuedAt).toLocaleString()}</>}
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Actions" />
            <CardBody className="flex flex-col gap-2">
              {invoice.status === 'DRAFT' && (
                <Button
                  isLoading={issueInvoice.isPending}
                  onClick={() => runAction(() => issueInvoice.mutateAsync(invoice.id))}
                >
                  Issue invoice
                </Button>
              )}
              {invoice.status === 'ISSUED' && (
                <Button
                  isLoading={markPaid.isPending}
                  onClick={() => runAction(() => markPaid.mutateAsync(invoice.id))}
                >
                  Mark as paid
                </Button>
              )}
              {(invoice.status === 'DRAFT' || invoice.status === 'ISSUED') && (
                <Button
                  variant="danger"
                  isLoading={cancelInvoice.isPending}
                  onClick={() => runAction(() => cancelInvoice.mutateAsync(invoice.id))}
                >
                  Cancel invoice
                </Button>
              )}
              {(invoice.status === 'PAID' || invoice.status === 'CANCELLED') && (
                <p className="text-sm text-graphite-400">No further actions available.</p>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
