import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MarketplacePage from '../features/inventory/pages/MarketplacePage';
import ProductDetailsPage from '../features/inventory/pages/ProductDetailsPage';
import DashboardPage from '../features/inventory/pages/DashboardPage';
import ProductsPage from '../features/inventory/pages/ProductsPage';
import MyAccountPage from '../features/auth/pages/MyAccountPage';
import LoginPage from '../features/auth/pages/LoginPage';
import RegisterPage from '../features/auth/pages/RegisterPage';
import AuditLogsPage from '../features/inventory/pages/AuditLogsPage';
import UsersPage from '../features/inventory/pages/UsersPage';
import StoresPage from '../features/inventory/pages/StoresPage';
import POSPage from '../features/inventory/pages/POSPage';

export const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<MarketplacePage />} />
      <Route path="/producto/:id" element={<ProductDetailsPage />} />
      <Route path="/admin" element={<DashboardPage />} />
      <Route path="/products" element={<ProductsPage />} />
      <Route path="/my-account" element={<MyAccountPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/logs" element={<AuditLogsPage />} />
      <Route path="/users" element={<UsersPage />} />
      <Route path="/stores" element={<StoresPage />} />
      <Route path="/pos" element={<POSPage />} />
    </Routes>
  </BrowserRouter>
);