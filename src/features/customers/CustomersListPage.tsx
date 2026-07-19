import { useMemo, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  ConfirmModal,
  EmptyState,
  FullPageSpinner,
  IconButton,
  Input,
  PageHeader,
  Table,
  type Column,
} from '@/components/ui';
import { useCustomers, useDeleteCustomer } from './hooks';
import { CustomerFormModal } from './CustomerFormModal';
import type { Customer } from '@/types';

export function CustomersListPage() {
  const { data: customers, isLoading } = useCustomers();
  const deleteCustomer = useDeleteCustomer();
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);

  const filtered = useMemo(() => {
    if (!customers) return [];
    const q = search.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) => c.name.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q),
    );
  }, [customers, search]);

  const openCreate = () => {
    setEditingCustomer(null);
    setFormOpen(true);
  };

  const openEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setFormOpen(true);
  };

  const columns: Column<Customer>[] = [
    { key: 'name', header: 'Name', render: (c) => <span className="font-medium text-graphite-900">{c.name}</span> },
    { key: 'email', header: 'Email', render: (c) => c.email ?? <span className="text-graphite-300">—</span> },
    { key: 'phone', header: 'Phone', render: (c) => c.phone ?? <span className="text-graphite-300">—</span> },
    {
      key: 'invoices',
      header: 'Invoices',
      align: 'right',
      render: (c) => <Badge tone={c.totalInvoices > 0 ? 'info' : 'neutral'}>{c.totalInvoices}</Badge>,
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (c) => (
        <div className="flex justify-end gap-1">
          <IconButton
            label="Edit customer"
            tone="brand"
            onClick={(e) => {
              e.stopPropagation();
              openEdit(c);
            }}
          >
            <Pencil className="h-4 w-4" strokeWidth={2} />
          </IconButton>
          <IconButton
            label="Delete customer"
            tone="danger"
            onClick={(e) => {
              e.stopPropagation();
              setDeleteTarget(c);
            }}
          >
            <Trash2 className="h-4 w-4" strokeWidth={2} />
          </IconButton>
        </div>
      ),
    },
  ];

  if (isLoading) return <FullPageSpinner />;

  return (
    <div>
      <PageHeader
        title="Customers"
        description="Manage the companies and contacts you invoice."
        action={<Button onClick={openCreate} icon={<Plus className="h-4 w-4" strokeWidth={2} />}>Add customer</Button>}
      />

      <div className="mb-4 w-full max-w-xs">
        <Input placeholder="Search by name or email" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <Card>
        {filtered.length === 0 ? (
          <EmptyState
            title="No customers yet"
            description="Add your first customer to start creating invoices for them."
            action={<Button onClick={openCreate} icon={<Plus className="h-4 w-4" strokeWidth={2} />}>Add customer</Button>}
          />
        ) : (
          <Table columns={columns} rows={filtered} getRowKey={(c) => c.id} />
        )}
      </Card>

      <CustomerFormModal isOpen={formOpen} onClose={() => setFormOpen(false)} customer={editingCustomer} />

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteCustomer.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
        }}
        title="Delete customer"
        description={
          <>
            Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This cannot be undone.
          </>
        }
        confirmLabel="Delete"
        isLoading={deleteCustomer.isPending}
      />
    </div>
  );
}
