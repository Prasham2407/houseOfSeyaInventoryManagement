import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button, Card, EmptyState, FullPageSpinner, Input, PageHeader, Select, Table, type Column } from '@/components/ui';
import { useInvoices } from './hooks';
import { InvoiceStatusBadge, currency } from './statusBadge';
import type { Invoice, InvoiceStatus } from '@/types';

export function InvoicesListPage() {
  const { data: invoices, isLoading } = useInvoices();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'ALL'>('ALL');

  const filtered = useMemo(() => {
    if (!invoices) return [];
    return invoices.filter((inv) => {
      const matchesStatus = statusFilter === 'ALL' || inv.status === statusFilter;
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q || inv.invoiceNumber.toLowerCase().includes(q) || inv.customerName.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [invoices, search, statusFilter]);

  const columns: Column<Invoice>[] = [
    {
      key: 'number',
      header: 'Invoice',
      render: (inv) => <span className="font-medium text-graphite-900">{inv.invoiceNumber}</span>,
    },
    { key: 'customer', header: 'Customer', render: (inv) => inv.customerName },
    { key: 'status', header: 'Status', render: (inv) => <InvoiceStatusBadge status={inv.status} /> },
    { key: 'total', header: 'Total', align: 'right', render: (inv) => currency(inv.total) },
    {
      key: 'date',
      header: 'Created',
      render: (inv) => new Date(inv.createdAt).toLocaleDateString(),
    },
  ];

  if (isLoading) return <FullPageSpinner />;

  return (
    <div>
      <PageHeader
        title="Invoices"
        description="Create and track invoices issued to customers."
        action={<Button onClick={() => navigate('/invoices/new')} icon={<Plus className="h-4 w-4" strokeWidth={2} />}>New invoice</Button>}
      />

      <div className="mb-4 flex flex-wrap gap-3">
        <div className="max-w-xs flex-1">
          <Input placeholder="Search by invoice # or customer" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select
          className="max-w-[160px]"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as InvoiceStatus | 'ALL')}
        >
          <option value="ALL">All statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="ISSUED">Issued</option>
          <option value="PAID">Paid</option>
          <option value="CANCELLED">Cancelled</option>
        </Select>
      </div>

      <Card>
        {filtered.length === 0 ? (
          <EmptyState
            title="No invoices found"
            description="Create your first invoice to bill a customer."
            action={<Button onClick={() => navigate('/invoices/new')} icon={<Plus className="h-4 w-4" strokeWidth={2} />}>New invoice</Button>}
          />
        ) : (
          <Table columns={columns} rows={filtered} getRowKey={(inv) => inv.id} onRowClick={(inv) => navigate(`/invoices/${inv.id}`)} />
        )}
      </Card>
    </div>
  );
}
