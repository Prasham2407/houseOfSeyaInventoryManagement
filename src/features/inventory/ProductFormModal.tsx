import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect } from 'react';
import { Button, Input, Modal, Select } from '@/components/ui';
import { useCategories, useCreateProduct, useUpdateProduct } from './hooks';
import type { Product } from '@/types';

const schema = z.object({
  sku: z.string().min(1, 'SKU is required'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  unitPrice: z.coerce.number().positive('Must be greater than 0'),
  quantityInStock: z.coerce.number().int().min(0, 'Cannot be negative'),
  reorderLevel: z.coerce.number().int().min(0, 'Cannot be negative'),
  categoryId: z.string().optional(),
});

type FormValues = z.input<typeof schema>;
type FormOutput = z.output<typeof schema>;

export function ProductFormModal({
  isOpen,
  onClose,
  product,
}: {
  isOpen: boolean;
  onClose: () => void;
  product?: Product | null;
}) {
  const isEditing = !!product;
  const { data: categories } = useCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues, unknown, FormOutput>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (isOpen) {
      reset({
        sku: product?.sku ?? '',
        name: product?.name ?? '',
        description: product?.description ?? '',
        unitPrice: product?.unitPrice ?? 0,
        quantityInStock: product?.quantityInStock ?? 0,
        reorderLevel: product?.reorderLevel ?? 0,
        categoryId: product?.categoryId ?? '',
      });
    }
  }, [isOpen, product, reset]);

  const onSubmit = async (values: FormOutput) => {
    if (isEditing && product) {
      await updateProduct.mutateAsync({ id: product.id, input: values });
    } else {
      await createProduct.mutateAsync(values);
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit product' : 'Add product'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button type="submit" form="product-form" isLoading={isSubmitting}>
            {isEditing ? 'Save changes' : 'Add product'}
          </Button>
        </>
      }
    >
      <form id="product-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <Input label="SKU" placeholder="FAB-COT-001" error={errors.sku?.message} {...register('sku')} />
          <Select label="Category" error={errors.categoryId?.message} {...register('categoryId')}>
            <option value="">Uncategorized</option>
            {categories?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>
        <Input label="Product name" placeholder="Cotton Poplin — Ivory" error={errors.name?.message} {...register('name')} />
        <Input label="Description (optional)" placeholder="Short description" error={errors.description?.message} {...register('description')} />
        <div className="grid grid-cols-3 gap-4">
          <Input label="Unit price" type="number" step="0.01" min="0" error={errors.unitPrice?.message} {...register('unitPrice')} />
          <Input
            label="Stock qty"
            type="number"
            min="0"
            disabled={isEditing}
            hint={isEditing ? 'Use Restock to change stock' : undefined}
            error={errors.quantityInStock?.message}
            {...register('quantityInStock')}
          />
          <Input label="Reorder level" type="number" min="0" error={errors.reorderLevel?.message} {...register('reorderLevel')} />
        </div>
      </form>
    </Modal>
  );
}
