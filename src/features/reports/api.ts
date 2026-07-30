import { apiClient } from '@/lib/apiClient';
import type { InventoryReport, PurchasesReport, SalesReport } from '@/types';

export async function fetchSalesReport(params?: { from?: string; to?: string; status?: string }): Promise<SalesReport> {
  const { data } = await apiClient.get<SalesReport>('/reports/sales', { params });
  return data;
}

export async function fetchPurchasesReport(params?: { from?: string; to?: string; status?: string }): Promise<PurchasesReport> {
  const { data } = await apiClient.get<PurchasesReport>('/reports/purchases', { params });
  return data;
}

export async function fetchInventoryReport(): Promise<InventoryReport> {
  const { data } = await apiClient.get<InventoryReport>('/reports/inventory');
  return data;
}
