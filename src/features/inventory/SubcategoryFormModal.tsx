import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect } from 'react';
import { Button, Input, Modal, Select } from '@/components/ui';
import { useCategories, useCreateSubcategory, useUpdateSubcategory } from './hooks';
import type { Subcategory } from '@/types';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  categoryId: z.string().min(1, 'Category is required'),
});
type FormValues = z.infer<typeof schema>;

export function SubcategoryFormModal({
  isOpen,
  onClose,
  subcategory,
  defaultCategoryId,
}: {
  isOpen: boolean;
  onClose: () => void;
  subcategory?: Subcategory | null;
  defaultCategoryId?: string;
}) {
  const isEditing = !!subcategory;
  const { data: categories } = useCategories();
  const createSubcategory = useCreateSubcategory();
  const updateSubcategory = useUpdateSubcategory();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (isOpen) {
      reset({
        name: subcategory?.name ?? '',
        categoryId: subcategory?.categoryId ?? defaultCategoryId ?? '',
      });
    }
  }, [isOpen, subcategory, defaultCategoryId, reset]);

  const onSubmit = async (values: FormValues) => {
    if (isEditing && subcategory) {
      await updateSubcategory.mutateAsync({ id: subcategory.id, input: values });
    } else {
      await createSubcategory.mutateAsync(values);
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit subcategory' : 'Add subcategory'}
      footer={
        <>
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="subcategory-form" isLoading={isSubmitting}>
            {isEditing ? 'Save changes' : 'Add subcategory'}
          </Button>
        </>
      }
    >
      <form id="subcategory-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Select label="Category" error={errors.categoryId?.message} {...register('categoryId')}>
          <option value="">Select a category…</option>
          {categories?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
        <Input label="Subcategory name" placeholder="e.g. Cotton" error={errors.name?.message} {...register('name')} />
      </form>
    </Modal>
  );
}
