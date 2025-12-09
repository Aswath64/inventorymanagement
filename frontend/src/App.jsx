import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';

import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';

import CustomerDashboard from './pages/customer/Dashboard';
import ProductList from './pages/customer/ProductList';
import ProductDetails from './pages/customer/ProductDetails';
import Cart from './pages/customer/Cart';
import Wishlist from './pages/customer/Wishlist';
import Orders from './pages/customer/Orders';

import ProfileSettings from './pages/shared/ProfileSettings';

import AdminDashboard from './pages/admin/Dashboard';
import CategoryManagement from './pages/admin/CategoryManagement';
import ProductManagement from './pages/admin/ProductManagement';
import OrderManagement from './pages/admin/OrderManagement';
import Reports from './pages/admin/Reports';
import UserManagement from './pages/admin/UserManagement';

import StaffDashboard from './pages/staff/Dashboard';
import StaffOrderManagement from './pages/staff/OrderManagement';
import StaffReports from './pages/staff/Reports';

import MotionWrapper from './components/motion/MotionWrapper';
import DashboardLayout from './layouts/DashboardLayout';

// -------------------- PRIVATE ROUTE HANDLER --------------------
const PrivateRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
        <div className="w-12 h-12 border-4 border-brand-primary/20 border-t-brand-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  const getHomeRoute = (role) => {
    switch (role) {
      case 'ADMIN': return '/admin/dashboard';
      case 'STAFF': return '/staff/dashboard';
      case 'CUSTOMER': return '/';
      default: return '/login';
    }
  };

  if (requiredRole) {
    if (requiredRole === 'ADMIN' && user.role !== 'ADMIN') {
      return <Navigate to={getHomeRoute(user.role)} replace />;
    }
    if (requiredRole === 'STAFF' && user.role !== 'STAFF' && user.role !== 'ADMIN') {
      return <Navigate to={getHomeRoute(user.role)} replace />;
    }
    if (requiredRole === 'CUSTOMER' && user.role !== 'CUSTOMER') {
      return <Navigate to={getHomeRoute(user.role)} replace />;
    }
  }

  return <DashboardLayout>{children}</DashboardLayout>;
};


// -------------------- APP ROUTES --------------------
function AppRoutes() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>

        {/* Auth Routes */}
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
        <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" />} />
        <Route path="/forgot-password" element={!isAuthenticated ? <ForgotPassword /> : <Navigate to="/" />} />

        {/* Public Routes (wrapped in DashboardLayout via manual usage if needed, or consistent wrapper) */}
        {/* Note: Public routes like Products also use DashboardLayout via PrivateRoute check?? 
            Wait, ProductList is listed as Public in original App.jsx but passed into PageShell.
            Here we should wrap them if they are public. 
        */}
        <Route path="/products" element={<DashboardLayout><ProductList /></DashboardLayout>} />
        <Route path="/products/:id" element={<DashboardLayout><ProductDetails /></DashboardLayout>} />

        {/* Customer Routes */}
        <Route
          path="/"
          element={
            <PrivateRoute requiredRole="CUSTOMER">
              <CustomerDashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/cart"
          element={
            <PrivateRoute requiredRole="CUSTOMER">
              <Cart />
            </PrivateRoute>
          }
        />

        <Route
          path="/wishlist"
          element={
            <PrivateRoute requiredRole="CUSTOMER">
              <Wishlist />
            </PrivateRoute>
          }
        />

        <Route
          path="/orders"
          element={
            <PrivateRoute requiredRole="CUSTOMER">
              <Orders />
            </PrivateRoute>
          }
        />

        {/* Shared Settings */}
        <Route
          path="/settings"
          element={
            <PrivateRoute>
              <ProfileSettings />
            </PrivateRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <PrivateRoute requiredRole="ADMIN">
              <AdminDashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/admin/categories"
          element={
            <PrivateRoute requiredRole="ADMIN">
              <CategoryManagement />
            </PrivateRoute>
          }
        />

        <Route
          path="/admin/products"
          element={
            <PrivateRoute requiredRole="ADMIN">
              <ProductManagement />
            </PrivateRoute>
          }
        />

        <Route
          path="/admin/orders"
          element={
            <PrivateRoute requiredRole="ADMIN">
              <OrderManagement />
            </PrivateRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <PrivateRoute requiredRole="ADMIN">
              <UserManagement />
            </PrivateRoute>
          }
        />

        <Route
          path="/admin/reports"
          element={
            <PrivateRoute requiredRole="ADMIN">
              <Reports />
            </PrivateRoute>
          }
        />

        {/* Staff Routes */}
        <Route
          path="/staff/dashboard"
          element={
            <PrivateRoute requiredRole="STAFF">
              <StaffDashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/staff/orders"
          element={
            <PrivateRoute requiredRole="STAFF">
              <StaffOrderManagement />
            </PrivateRoute>
          }
        />

        <Route
          path="/staff/reports"
          element={
            <PrivateRoute requiredRole="STAFF">
              <StaffReports />
            </PrivateRoute>
          }
        />

      </Routes>
    </AnimatePresence>
  );
}


import { MascotProvider } from './context/MascotContext';
import FloatingBoxy from './components/Mascot/FloatingBoxy';

// -------------------- MAIN APP --------------------
function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MascotProvider>
          <ToastProvider>
            <MotionWrapper>
              <Router>
                <FloatingBoxy />
                <AppRoutes />
              </Router>
            </MotionWrapper>
          </ToastProvider>
        </MascotProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
