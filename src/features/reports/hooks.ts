import { useQuery } from '@tanstack/react-query';
import * as api from './api';

export const reportKeys = {
  sales: (params: { from?: string; to?: string; status?: string }) => ['reports', 'sales', params] as const,
  purchases: (params: { from?: string; to?: string; status?: string }) => ['reports', 'purchases', params] as const,
  inventory: ['reports', 'inventory'] as const,
};

export function useSalesReport(params: { from?: string; to?: string; status?: string }) {
  return useQuery({
    queryKey: reportKeys.sales(params),
    queryFn: () => api.fetchSalesReport(params),
  });
}

export function usePurchasesReport(params: { from?: string; to?: string; status?: string }) {
  return useQuery({
    queryKey: reportKeys.purchases(params),
    queryFn: () => api.fetchPurchasesReport(params),
  });
}

export function useInventoryReport() {
  return useQuery({
    queryKey: reportKeys.inventory,
    queryFn: api.fetchInventoryReport,
  });
}
