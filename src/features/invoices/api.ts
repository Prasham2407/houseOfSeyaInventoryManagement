import { apiClient } from '@/lib/apiClient';
import type { Invoice } from '@/types';

export interface InvoiceLineInput {
  productId: string;
  quantity: number;
}

export interface InvoiceInput {
  customerId: string;
  items: InvoiceLineInput[];
  taxRate?: number; // e.g. 0.1 for 10%
}

export async function fetchInvoices(): Promise<Invoice[]> {
  const { data } = await apiClient.get<Invoice[]>('/invoices');
  return data;
}

export async function fetchInvoice(id: string): Promise<Invoice> {
  const { data } = await apiClient.get<Invoice>(`/invoices/${id}`);
  return data;
}

export async function createInvoice(input: InvoiceInput): Promise<Invoice> {
  const { data } = await apiClient.post<Invoice>('/invoices', input);
  return data;
}

export async function issueInvoice(id: string): Promise<Invoice> {
  const { data } = await apiClient.patch<Invoice>(`/invoices/${id}/issue`);
  return data;
}

export async function markInvoicePaid(id: string): Promise<Invoice> {
  const { data } = await apiClient.patch<Invoice>(`/invoices/${id}/pay`);
  return data;
}

export async function cancelInvoice(id: string): Promise<Invoice> {
  const { data } = await apiClient.patch<Invoice>(`/invoices/${id}/cancel`);
  return data;
}
