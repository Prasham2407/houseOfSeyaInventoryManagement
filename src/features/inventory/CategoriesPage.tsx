import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2 } from 'lucide-react';
import { extractErrorMessage } from '@/lib/apiClient';
import {
  Badge,
  Button,
  Card,
  ConfirmModal,
  EmptyState,
  FullPageSpinner,
  IconButton,
  Input,
  Modal,
  PageHeader,
  Table,
  type Column,
} from '@/components/ui';
import { useCategories, useCreateCategory, useDeleteCategory } from './hooks';
import type { Category } from '@/types';

const schema = z.object({ name: z.string().min(1, 'Name is required') });
type FormValues = z.infer<typeof schema>;

export function CategoriesPage() {
  const { data: categories, isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const deleteCategory = useDeleteCategory();
  const [formOpen, setFormOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    try {
      await createCategory.mutateAsync(values);
      reset();
      setFormOpen(false);
    } catch (err) {
      setServerError(extractErrorMessage(err, 'Something went wrong.'));
    }
  };

  const openDelete = (category: Category) => {
    setDeleteError(null);
    setDeleteTarget(category);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteError(null);
    try {
      await deleteCategory.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
    } catch (err) {
      setDeleteError(extractErrorMessage(err, 'Could not delete category.'));
    }
  };

  const columns: Column<Category>[] = [
    { key: 'name', header: 'Category', render: (c) => <span className="font-medium text-graphite-900">{c.name}</span> },
    { key: 'count', header: 'Products', align: 'right', render: (c) => <Badge tone="neutral">{c.productCount}</Badge> },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (c) => (
        <div className="flex justify-end">
          <IconButton label="Delete category" tone="danger" onClick={() => openDelete(c)}>
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
        title="Categories"
        description="Group products for easier browsing and reporting."
        action={<Button onClick={() => setFormOpen(true)} icon={<Plus className="h-4 w-4" strokeWidth={2} />}>Add category</Button>}
      />

      <Card>
        {!categories || categories.length === 0 ? (
          <EmptyState title="No categories yet" description="Create a category to start organizing products." />
        ) : (
          <Table columns={columns} rows={categories} getRowKey={(c) => c.id} />
        )}
      </Card>

      <Modal
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        title="Add category"
        footer={
          <>
            <Button variant="secondary" type="button" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="category-form" isLoading={isSubmitting}>
              Add category
            </Button>
          </>
        }
      >
        <form id="category-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input label="Category name" placeholder="e.g. Fabrics" error={errors.name?.message} {...register('name')} />
          {serverError && <p className="text-sm text-red-600">{serverError}</p>}
        </form>
      </Modal>

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete category"
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
        isLoading={deleteCategory.isPending}
      />
    </div>
  );
}
