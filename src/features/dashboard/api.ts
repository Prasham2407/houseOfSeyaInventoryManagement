import { fetchCustomers } from '@/features/customers/api';
import { fetchProducts } from '@/features/inventory/api';
import { fetchSales } from '@/features/sales/api';
import type { DashboardSummary } from '@/types';

export async function fetchDashboardSummary(): Promise<DashboardSummary> {
  const [customers, products, sales] = await Promise.all([
    fetchCustomers(),
    fetchProducts(),
    fetchSales(),
  ]);

  const now = new Date();
  const salesThisMonth = sales.filter((sale) => {
    const created = new Date(sale.createdAt);
    return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
  });

  const revenueThisMonth = salesThisMonth
    .filter((sale) => sale.status === 'PAID' || sale.status === 'ISSUED')
    .reduce((sum, sale) => sum + sale.total, 0);

  const lowStockProducts = products
    .filter((p) => p.quantityInStock <= p.reorderLevel)
    .sort((a, b) => a.quantityInStock - b.quantityInStock);

  const recentSales = [...sales]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5);

  const summary: DashboardSummary = {
    totalProducts: products.length,
    lowStockCount: lowStockProducts.length,
    totalCustomers: customers.length,
    salesThisMonth: salesThisMonth.length,
    revenueThisMonth,
    recentSales,
    lowStockProducts: lowStockProducts.slice(0, 5),
  };

  return summary;
}
