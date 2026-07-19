import { useMemo, useState } from 'react';
import { PackagePlus, Pencil, Plus, Trash2 } from 'lucide-react';
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
import { useDeleteProduct, useProducts } from './hooks';
import { ProductFormModal } from './ProductFormModal';
import { RestockModal } from './RestockModal';
import { formatCurrency } from '@/lib/format';
import type { Product } from '@/types';

export function ProductsListPage() {
  const { data: products, isLoading } = useProducts();
  const deleteProduct = useDeleteProduct();
  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [restockTarget, setRestockTarget] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  const filtered = useMemo(() => {
    if (!products) return [];
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q),
    );
  }, [products, search]);

  const openCreate = () => {
    setEditingProduct(null);
    setFormOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setFormOpen(true);
  };

  const columns: Column<Product>[] = [
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
    { key: 'category', header: 'Category', render: (p) => p.categoryName ?? <span className="text-graphite-300">—</span> },
    { key: 'price', header: 'Unit price', align: 'right', render: (p) => formatCurrency(p.unitPrice) },
    {
      key: 'stock',
      header: 'Stock',
      align: 'right',
      render: (p) => {
        const isLow = p.quantityInStock <= p.reorderLevel;
        return (
          <div className="flex items-center justify-end gap-2">
            <span className={isLow ? 'font-medium text-amber-600' : 'text-graphite-700'}>{p.quantityInStock}</span>
            {isLow && <Badge tone="warning">Low</Badge>}
          </div>
        );
      },
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (p) => (
        <div className="flex justify-end gap-1">
          <IconButton
            label="Restock product"
            tone="amber"
            onClick={(e) => {
              e.stopPropagation();
              setRestockTarget(p);
            }}
          >
            <PackagePlus className="h-4 w-4" strokeWidth={2} />
          </IconButton>
          <IconButton
            label="Edit product"
            tone="brand"
            onClick={(e) => {
              e.stopPropagation();
              openEdit(p);
            }}
          >
            <Pencil className="h-4 w-4" strokeWidth={2} />
          </IconButton>
          <IconButton
            label="Delete product"
            tone="danger"
            onClick={(e) => {
              e.stopPropagation();
              setDeleteTarget(p);
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
        title="Products"
        description="Track stock levels and manage your product catalog."
        action={<Button onClick={openCreate} icon={<Plus className="h-4 w-4" strokeWidth={2} />}>Add product</Button>}
      />

      <div className="mb-4 w-full max-w-xs">
        <Input placeholder="Search by name or SKU" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <Card>
        {filtered.length === 0 ? (
          <EmptyState
            title="No products yet"
            description="Add your first product to start tracking inventory."
            action={<Button onClick={openCreate} icon={<Plus className="h-4 w-4" strokeWidth={2} />}>Add product</Button>}
          />
        ) : (
          <Table columns={columns} rows={filtered} getRowKey={(p) => p.id} />
        )}
      </Card>

      <ProductFormModal isOpen={formOpen} onClose={() => setFormOpen(false)} product={editingProduct} />
      <RestockModal isOpen={!!restockTarget} onClose={() => setRestockTarget(null)} product={restockTarget} />

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (!deleteTarget) return;
          deleteProduct.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) });
        }}
        title="Delete product"
        description={
          <>
            Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This cannot be undone.
          </>
        }
        confirmLabel="Delete"
        isLoading={deleteProduct.isPending}
      />
    </div>
  );
}
