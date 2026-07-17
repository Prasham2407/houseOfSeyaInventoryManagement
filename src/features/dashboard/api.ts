import { fetchCustomers } from '@/features/customers/api';
import { fetchProducts } from '@/features/inventory/api';
import { fetchInvoices } from '@/features/invoices/api';
import type { DashboardSummary } from '@/types';

export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  const [customers, products, invoices] = await Promise.all([
    fetchCustomers(),
    fetchProducts(),
    fetchInvoices(),
  ]);

  const now = new Date();
  const invoicesThisMonth = invoices.filter((inv) => {
    const created = new Date(inv.createdAt);
    return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
  });

  const revenueThisMonth = invoicesThisMonth
    .filter((inv) => inv.status === 'PAID' || inv.status === 'ISSUED')
    .reduce((sum, inv) => sum + inv.total, 0);

  const lowStockProducts = products
    .filter((p) => p.quantityInStock <= p.reorderLevel)
    .sort((a, b) => a.quantityInStock - b.quantityInStock);

  const recentInvoices = [...invoices]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5);

  const summary: DashboardSummary = {
    totalProducts: products.length,
    lowStockCount: lowStockProducts.length,
    totalCustomers: customers.length,
    invoicesThisMonth: invoicesThisMonth.length,
    revenueThisMonth,
    recentInvoices,
    lowStockProducts: lowStockProducts.slice(0, 5),
  };

  return summary;
}
