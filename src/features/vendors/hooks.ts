import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as api from './api';

export const vendorKeys = {
  all: ['vendors'] as const,
  detail: (id: string) => ['vendors', id] as const,
  page: (params: api.FetchVendorsPageParams) => ['vendors', 'page', params] as const,
};

export function useVendors() {
  return useQuery({ queryKey: vendorKeys.all, queryFn: api.fetchVendors });
}

export function useVendorsPage(params: api.FetchVendorsPageParams) {
  return useQuery({
    queryKey: vendorKeys.page(params),
    queryFn: () => api.fetchVendorsPage(params),
    placeholderData: (previousData) => previousData,
  });
}

export function useVendor(id: string | undefined) {
  return useQuery({
    queryKey: vendorKeys.detail(id ?? ''),
    queryFn: () => api.fetchVendor(id as string),
    enabled: !!id,
  });
}

export function useCreateVendor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.createVendor,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: vendorKeys.all }),
  });
}

export function useUpdateVendor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: api.VendorInput }) =>
      api.updateVendor(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: vendorKeys.all }),
  });
}

export function useDeleteVendor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.deleteVendor,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: vendorKeys.all }),
  });
}
