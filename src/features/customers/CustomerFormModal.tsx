import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect } from 'react';
import { Button, Input, Modal } from '@/components/ui';
import { useCreateCustomer, useUpdateCustomer } from './hooks';
import type { Customer } from '@/types';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Enter a valid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function CustomerFormModal({
  isOpen,
  onClose,
  customer,
}: {
  isOpen: boolean;
  onClose: () => void;
  customer?: Customer | null;
}) {
  const isEditing = !!customer;
  const createCustomer = useCreateCustomer();
  const updateCustomer = useUpdateCustomer();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (isOpen) {
      reset({
        name: customer?.name ?? '',
        email: customer?.email ?? '',
        phone: customer?.phone ?? '',
        address: customer?.address ?? '',
      });
    }
  }, [isOpen, customer, reset]);

  const onSubmit = async (values: FormValues) => {
    if (isEditing && customer) {
      await updateCustomer.mutateAsync({ id: customer.id, input: values });
    } else {
      await createCustomer.mutateAsync(values);
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit customer' : 'Add customer'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button type="submit" form="customer-form" isLoading={isSubmitting}>
            {isEditing ? 'Save changes' : 'Add customer'}
          </Button>
        </>
      }
    >
      <form id="customer-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input label="Name" placeholder="Company or contact name" error={errors.name?.message} {...register('name')} />
        <Input label="Email" type="email" placeholder="name@company.com" error={errors.email?.message} {...register('email')} />
        <Input label="Phone" placeholder="+1 555 123 4567" error={errors.phone?.message} {...register('phone')} />
        <Input label="Address" placeholder="Street, city, country" error={errors.address?.message} {...register('address')} />
      </form>
    </Modal>
  );
}
