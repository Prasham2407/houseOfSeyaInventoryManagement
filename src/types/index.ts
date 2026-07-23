export type Role = 'ADMIN' | 'STAFF';

export type SortDir = 'asc' | 'desc';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  totalSales: number;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  productCount: number;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  unitPrice: number;
  quantityInStock: number;
  reorderLevel: number;
  categoryId: string | null;
  categoryName: string | null;
  createdAt: string;
}

export type StockMovementType = 'RESTOCK' | 'SALE' | 'ADJUSTMENT';

export interface StockMovement {
  id: string;
  productId: string;
  type: StockMovementType;
  quantity: number;
  reason: string | null;
  createdAt: string;
}

export type SaleStatus = 'DRAFT' | 'ISSUED' | 'PAID' | 'CANCELLED';

export interface SaleItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface Sale {
  id: string;
  saleNumber: string;
  customerId: string;
  customerName: string;
  status: SaleStatus;
  items: SaleItem[];
  subtotal: number;
  tax: number;
  total: number;
  issuedAt: string | null;
  createdAt: string;
}

export interface DashboardSummary {
  totalProducts: number;
  lowStockCount: number;
  totalCustomers: number;
  salesThisMonth: number;
  revenueThisMonth: number;
  recentSales: Sale[];
  lowStockProducts: Product[];
}
