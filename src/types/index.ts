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
  subcategoryCount: number;
}

export interface Subcategory {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string;
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
  subcategoryId: string | null;
  subcategoryName: string | null;
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
  totalVendors: number;
  salesThisMonth: number;
  revenueThisMonth: number;
  purchasesThisMonth: number;
  pendingPOs: number;
  recentSales: Sale[];
  recentPurchases: Purchase[];
  lowStockProducts: Product[];
}

export interface Vendor {
  id: string;
  companyName: string;
  contactPerson: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  totalOrders: number;
  lastOrderedDate: string | null;
  lastOrderedProduct: string | null;
  lastOrderedQty: number | null;
  createdAt: string;
}

export type PurchaseStatus = 'DRAFT' | 'ORDERED' | 'PARTIALLY_RECEIVED' | 'RECEIVED' | 'CANCELLED';

export interface PurchaseItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  receivedQuantity: number;
  unitCost: number;
  lineTotal: number;
}

export interface Purchase {
  id: string;
  purchaseNumber: string;
  vendorId: string;
  vendorName: string;
  status: PurchaseStatus;
  items: PurchaseItem[];
  subtotal: number;
  total: number;
  orderedAt: string | null;
  receivedAt: string | null;
  createdAt: string;
}

export interface SalesReport {
  totalCount: number;
  totalRevenue: number;
  totalTax: number;
  statusBreakdown: { status: SaleStatus; count: number }[];
  topProducts: { product: string; sku: string; quantity: number; revenue: number }[];
  sales: { id: string; saleNumber: string; customerName: string; status: SaleStatus; total: number; createdAt: string }[];
}

export interface PurchasesReport {
  totalCount: number;
  totalCost: number;
  statusBreakdown: { status: PurchaseStatus; count: number }[];
  topProducts: { product: string; sku: string; quantity: number; cost: number }[];
  purchases: { id: string; purchaseNumber: string; vendorName: string; status: PurchaseStatus; total: number; createdAt: string }[];
}

export interface InventoryReport {
  totalProducts: number;
  totalStockValue: number;
  lowStockCount: number;
  lowStockProducts: { id: string; name: string; sku: string; quantityInStock: number; reorderLevel: number }[];
  categoryBreakdown: { category: string; productCount: number; stockValue: number }[];
  recentMovements: { id: string; productName: string; sku: string; type: StockMovementType; quantity: number; reason: string | null; createdAt: string }[];
}
