import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { AdminRoute } from '@/components/layout/AdminRoute';
import { LoginPage } from '@/features/auth/LoginPage';
import { ForgotPasswordPage } from '@/features/auth/ForgotPasswordPage';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { CustomersListPage } from '@/features/customers/CustomersListPage';
import { ProductsListPage } from '@/features/inventory/ProductsListPage';
import { CategoriesPage } from '@/features/inventory/CategoriesPage';
import { SalesListPage } from '@/features/sales/SalesListPage';
import { SaleFormPage } from '@/features/sales/SaleFormPage';
import { SaleDetailPage } from '@/features/sales/SaleDetailPage';
import { UsersListPage } from '@/features/users/UsersListPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<DashboardPage />} />
        <Route path="/customers" element={<CustomersListPage />} />
        <Route path="/inventory/products" element={<ProductsListPage />} />
        <Route path="/inventory/categories" element={<CategoriesPage />} />
        <Route path="/sales" element={<SalesListPage />} />
        <Route path="/sales/new" element={<SaleFormPage />} />
        <Route path="/sales/:id/edit" element={<SaleFormPage />} />
        <Route path="/sales/:id" element={<SaleDetailPage />} />
        <Route
          path="/users"
          element={
            <AdminRoute>
              <UsersListPage />
            </AdminRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
