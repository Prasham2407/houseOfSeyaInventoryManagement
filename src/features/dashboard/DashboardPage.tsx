import { useNavigate } from 'react-router-dom';
import { AlertTriangle, DollarSign, Package, Users } from 'lucide-react';
import {
  Badge,
  Card,
  CardBody,
  CardHeader,
  EmptyState,
  FullPageSpinner,
  PageHeader,
  StatTile,
  Table,
  type Column,
} from '@/components/ui';
import { useDashboardSummary } from './hooks';
import { InvoiceStatusBadge, currency } from '@/features/invoices/statusBadge';
import type { Invoice, Product } from '@/types';

export function DashboardPage() {
  const { data, isLoading } = useDashboardSummary();
  const navigate = useNavigate();

  if (isLoading || !data) return <FullPageSpinner />;

  const invoiceColumns: Column<Invoice>[] = [
    { key: 'number', header: 'Invoice', render: (inv) => <span className="font-medium text-graphite-900">{inv.invoiceNumber}</span> },
    { key: 'customer', header: 'Customer', render: (inv) => inv.customerName },
    { key: 'status', header: 'Status', render: (inv) => <InvoiceStatusBadge status={inv.status} /> },
    { key: 'total', header: 'Total', align: 'right', render: (inv) => currency(inv.total) },
  ];

  const productColumns: Column<Product>[] = [
    {
      key: 'name',
      header: 'Product',
      render: (p) => (
        <div>
          <p className="font-medium text-graphite-900">{p.name}</p>
          <p className="text-xs text-graphite-400">{p.sku}</p>
        </div>
      ),
    },
    {
      key: 'stock',
      header: 'Stock',
      align: 'right',
      render: (p) => (
        <span className="flex items-center justify-end gap-2">
          <span className="font-medium text-amber-600">{p.quantityInStock}</span>
          <Badge tone="warning">Reorder at {p.reorderLevel}</Badge>
        </span>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Dashboard" description="A quick overview of your inventory and billing activity." />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Total products" value={data.totalProducts} icon={<Package className="h-4 w-4" strokeWidth={2} />} />
        <StatTile
          label="Low stock items"
          value={data.lowStockCount}
          icon={<AlertTriangle className="h-4 w-4" strokeWidth={2} />}
          tone={data.lowStockCount > 0 ? 'warning' : 'neutral'}
        />
        <StatTile label="Customers" value={data.totalCustomers} icon={<Users className="h-4 w-4" strokeWidth={2} />} />
        <StatTile
          label="Revenue this month"
          value={currency(data.revenueThisMonth)}
          icon={<DollarSign className="h-4 w-4" strokeWidth={2} />}
          hint={`${data.invoicesThisMonth} invoice(s)`}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Recent invoices"
            action={
              <button className="cursor-pointer text-sm font-medium text-brand-600 hover:underline" onClick={() => navigate('/invoices')}>
                View all
              </button>
            }
          />
          {data.recentInvoices.length === 0 ? (
            <CardBody>
              <EmptyState title="No invoices yet" description="Create your first invoice to see it here." />
            </CardBody>
          ) : (
            <Table
              columns={invoiceColumns}
              rows={data.recentInvoices}
              getRowKey={(inv) => inv.id}
              onRowClick={(inv) => navigate(`/invoices/${inv.id}`)}
            />
          )}
        </Card>

        <Card>
          <CardHeader
            title="Low stock alerts"
            action={
              <button className="cursor-pointer text-sm font-medium text-brand-600 hover:underline" onClick={() => navigate('/inventory/products')}>
                View all products
              </button>
            }
          />
          {data.lowStockProducts.length === 0 ? (
            <CardBody>
              <EmptyState title="All stocked up" description="No products are currently below their reorder level." />
            </CardBody>
          ) : (
            <Table
              columns={productColumns}
              rows={data.lowStockProducts}
              getRowKey={(p) => p.id}
              onRowClick={() => navigate('/inventory/products')}
            />
          )}
        </Card>
      </div>
    </div>
  );
}
