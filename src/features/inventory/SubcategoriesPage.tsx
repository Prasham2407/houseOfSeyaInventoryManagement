import { useState } from 'react';
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
  Pagination,
  Select,
  Table,
  type Column,
} from '@/components/ui';
import { useTableQuery } from '@/lib/useTableQuery';
import { useCategories, useDeleteSubcategory, useSubcategoriesPage } from './hooks';
import { SubcategoryFormModal } from './SubcategoryFormModal';
import { extractErrorMessage } from '@/lib/apiClient';
import type { Subcategory } from '@/types';

export function SubcategoriesPage() {
  const query = useTableQuery({ defaultSortBy: 'name', defaultSortDir: 'asc' });
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const { data: categories } = useCategories();
  const { data, isLoading, isPlaceholderData } = useSubcategoriesPage({
    page: query.page,
    pageSize: query.pageSize,
    search: query.search,
    sortBy: query.sortBy,
    sortDir: query.sortDir,
    categoryId: categoryFilter === 'ALL' ? undefined : categoryFilter,
  });
  const deleteSubcategory = useDeleteSubcategory();
  const [formOpen, setFormOpen] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Subcategory | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const subcategories = data?.data ?? [];

  const handleCategoryFilterChange = (value: string) => {
    setCategoryFilter(value);
    query.setPage(1);
  };

  const openCreate = () => {
    setEditingSubcategory(null);
    setFormOpen(true);
  };

  const openEdit = (subcategory: Subcategory) => {
    setEditingSubcategory(subcategory);
    setFormOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteError(null);
    try {
      await deleteSubcategory.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
    } catch (err) {
      setDeleteError(extractErrorMessage(err, 'Could not delete subcategory.'));
    }
  };

  const columns: Column<Subcategory>[] = [
    {
      key: 'name',
      header: 'Subcategory',
      sortField: 'name',
      render: (s) => <span className="font-medium text-graphite-900">{s.name}</span>,
    },
    {
      key: 'category',
      header: 'Category',
      sortField: 'category',
      render: (s) => s.categoryName,
    },
    {
      key: 'count',
      header: 'Products',
      align: 'right',
      sortField: 'productCount',
      render: (s) => <Badge tone="neutral">{s.productCount}</Badge>,
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (s) => (
        <div className="flex justify-end gap-1">
          <IconButton label="Edit subcategory" tone="brand" onClick={() => openEdit(s)}>
            <Pencil className="h-4 w-4" strokeWidth={2} />
          </IconButton>
          <IconButton label="Delete subcategory" tone="danger" onClick={() => { setDeleteError(null); setDeleteTarget(s); }}>
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
        title="Subcategories"
        description="Group products within a category for finer organization."
        action={<Button onClick={openCreate} icon={<Plus className="h-4 w-4" strokeWidth={2} />}>Add subcategory</Button>}
      />

      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div className="w-full max-w-xs">
          <Input
            placeholder="Search subcategories"
            value={query.searchInput}
            onChange={(e) => query.setSearchInput(e.target.value)}
            onKeyDown={query.handleSearchKeyDown}
          />
        </div>
        <div className="w-full max-w-[12rem]">
          <Select
            aria-label="Category filter"
            value={categoryFilter}
            onChange={(e) => handleCategoryFilterChange(e.target.value)}
          >
            <option value="ALL">All categories</option>
            {categories?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <Card className={isPlaceholderData ? 'opacity-60 transition-opacity' : undefined}>
        {subcategories.length === 0 ? (
          <EmptyState
            title="No subcategories yet"
            description="Create a subcategory to organize products within a category."
            action={<Button onClick={openCreate} icon={<Plus className="h-4 w-4" strokeWidth={2} />}>Add subcategory</Button>}
          />
        ) : (
          <>
            <Table
              columns={columns}
              rows={subcategories}
              getRowKey={(s) => s.id}
              sortBy={query.sortBy}
              sortDir={query.sortDir}
              onSortChange={query.toggleSort}
            />
            <Pagination
              page={data?.page ?? query.page}
              pageSize={data?.pageSize ?? query.pageSize}
              total={data?.total ?? 0}
              onPageChange={query.setPage}
              onPageSizeChange={query.setPageSize}
            />
          </>
        )}
      </Card>

      <SubcategoryFormModal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        subcategory={editingSubcategory}
        defaultCategoryId={categoryFilter === 'ALL' ? undefined : categoryFilter}
      />

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete subcategory"
        description={
          <>
            {deleteError ? (
              <span className="text-red-600">{deleteError}</span>
            ) : (
              <>
                Are you sure you want to delete <strong>{deleteTarget?.name}</strong>?
              </>
            )}
          </>
        }
        confirmLabel="Delete"
        isLoading={deleteSubcategory.isPending}
      />
    </div>
  );
}
