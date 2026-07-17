import { apiClient } from '@/lib/apiClient';
import type { Category, Product, StockMovement } from '@/types';

export interface ProductInput {
  sku: string;
  name: string;
  description?: string;
  unitPrice: number;
  quantityInStock: number;
  reorderLevel: number;
  categoryId?: string;
}

export interface CategoryInput {
  name: string;
}

export async function fetchProducts(): Promise<Product[]> {
  const { data } = await apiClient.get<Product[]>('/inventory/products');
  return data;
}

export async function fetchProduct(id: string): Promise<Product> {
  const { data } = await apiClient.get<Product>(`/inventory/products/${id}`);
  return data;
}

export async function createProduct(input: ProductInput): Promise<Product> {
  const { data } = await apiClient.post<Product>('/inventory/products', input);
  return data;
}

export async function updateProduct(id: string, input: ProductInput): Promise<Product> {
  const { data } = await apiClient.patch<Product>(`/inventory/products/${id}`, input);
  return data;
}

export async function deleteProduct(id: string): Promise<void> {
  await apiClient.delete(`/inventory/products/${id}`);
}

export async function restockProduct(id: string, quantity: number, reason?: string): Promise<Product> {
  const { data } = await apiClient.post<Product>(`/inventory/products/${id}/restock`, { quantity, reason });
  return data;
}

export async function fetchStockMovements(productId: string): Promise<StockMovement[]> {
  const { data } = await apiClient.get<StockMovement[]>(`/inventory/products/${productId}/movements`);
  return data;
}

export async function fetchCategories(): Promise<Category[]> {
  const { data } = await apiClient.get<Category[]>('/inventory/categories');
  return data;
}

export async function createCategory(input: CategoryInput): Promise<Category> {
  const { data } = await apiClient.post<Category>('/inventory/categories', input);
  return data;
}

export async function deleteCategory(id: string): Promise<void> {
  await apiClient.delete(`/inventory/categories/${id}`);
}
