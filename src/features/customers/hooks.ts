import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as api from './api';

export const customerKeys = {
  all: ['customers'] as const,
  detail: (id: string) => ['customers', id] as const,
  page: (params: api.FetchCustomersPageParams) => ['customers', 'page', params] as const,
};

export function useCustomers() {
  return useQuery({ queryKey: customerKeys.all, queryFn: api.fetchCustomers });
}

export function useCustomersPage(params: api.FetchCustomersPageParams) {
  return useQuery({
    queryKey: customerKeys.page(params),
    queryFn: () => api.fetchCustomersPage(params),
    placeholderData: (previousData) => previousData,
  });
}

export function useCustomer(id: string | undefined) {
  return useQuery({
    queryKey: customerKeys.detail(id ?? ''),
    queryFn: () => api.fetchCustomer(id as string),
    enabled: !!id,
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createCustomer,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: customerKeys.all }),
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: api.CustomerInput }) =>
      api.updateCustomer(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: customerKeys.all }),
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.deleteCustomer,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: customerKeys.all }),
  });
}
