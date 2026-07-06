import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar/Sidebar';
import Topbar from './components/Topbar/Topbar';
import { useAuth } from './contexts/AuthContext';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import MedicinesPage from './pages/admin/MedicinesPage';
import SuppliersPage from './pages/admin/SuppliersPage';
import UsersPage from './pages/admin/UsersPage';
import InventoryPage from './pages/admin/InventoryPage';
import ReportsPage from './pages/admin/ReportsPage';
import AdminPrescriptionsPage from './pages/admin/AdminPrescriptionsPage';
import AdminSalesPage from './pages/admin/AdminSalesPage';

// Pharmacist Pages
import PharmacistDashboard from './pages/pharmacist/PharmacistDashboard';
import PharmacistMedicinesPage from './pages/pharmacist/PharmacistMedicinesPage';
import NewSalePage from './pages/pharmacist/NewSalePage';
import PharmacistSalesPage from './pages/pharmacist/PharmacistSalesPage';
import PharmacistPrescriptionsPage from './pages/pharmacist/PharmacistPrescriptionsPage';

// Customer Pages
import CustomerDashboard from './pages/customer/CustomerDashboard';
import MedicineSearchPage from './pages/customer/MedicineSearchPage';
import CustomerPrescriptionsPage from './pages/customer/CustomerPrescriptionsPage';
import PurchaseHistoryPage from './pages/customer/PurchaseHistoryPage';

const muiTheme = createTheme({
  palette: {
    primary: { main: '#1565C0', light: '#1E88E5', dark: '#0D47A1' },
    secondary: { main: '#2E7D32', light: '#388E3C', dark: '#1B5E20' },
    background: { default: '#F5F7FA', paper: '#FFFFFF' },
  },
  typography: {
    fontFamily: "'Inter', sans-serif",
    h1: { fontWeight: 800 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 10 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: 'none',
          '&:hover': { boxShadow: '0 4px 12px rgba(0,0,0,0.15)' },
        },
      },
    },
    MuiCard: {
      styleOverrides: { root: { borderRadius: 16, boxShadow: '0 2px 12px rgba(21,101,192,0.08)' } },
    },
    MuiTextField: {
      styleOverrides: { root: { '& .MuiOutlinedInput-root': { borderRadius: 8 } } },
    },
  },
});

function AppLayout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Topbar />
        <div className="page-container">
          {children}
        </div>
      </div>
    </div>
  );
}

function AppRoutes() {
  const { user } = useAuth();

  const defaultPath = user?.role === 'ADMIN' ? '/admin/dashboard'
    : user?.role === 'PHARMACIST' ? '/pharmacist/dashboard'
    : '/customer/dashboard';

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/" element={<Navigate to={user ? defaultPath : '/login'} replace />} />

      {/* Admin Routes */}
      <Route path="/admin/*" element={
        <ProtectedRoute roles={['ADMIN']}>
          <AppLayout>
            <Routes>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="medicines" element={<MedicinesPage />} />
              <Route path="suppliers" element={<SuppliersPage />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="inventory" element={<InventoryPage />} />
              <Route path="sales" element={<AdminSalesPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="prescriptions" element={<AdminPrescriptionsPage />} />
            </Routes>
          </AppLayout>
        </ProtectedRoute>
      } />

      {/* Pharmacist Routes */}
      <Route path="/pharmacist/*" element={
        <ProtectedRoute roles={['PHARMACIST', 'ADMIN']}>
          <AppLayout>
            <Routes>
              <Route path="dashboard" element={<PharmacistDashboard />} />
              <Route path="medicines" element={<PharmacistMedicinesPage />} />
              <Route path="new-sale" element={<NewSalePage />} />
              <Route path="sales" element={<PharmacistSalesPage />} />
              <Route path="prescriptions" element={<PharmacistPrescriptionsPage />} />
            </Routes>
          </AppLayout>
        </ProtectedRoute>
      } />

      {/* Customer Routes */}
      <Route path="/customer/*" element={
        <ProtectedRoute roles={['CUSTOMER']}>
          <AppLayout>
            <Routes>
              <Route path="dashboard" element={<CustomerDashboard />} />
              <Route path="search" element={<MedicineSearchPage />} />
              <Route path="prescriptions" element={<CustomerPrescriptionsPage />} />
              <Route path="purchases" element={<PurchaseHistoryPage />} />
            </Routes>
          </AppLayout>
        </ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ThemeProvider>
  );
}
