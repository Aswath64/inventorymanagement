import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
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

import Navbar from './components/Navbar';
import MotionWrapper from './components/motion/MotionWrapper';


// -------------------- PAGE ANIMATION VARIANTS --------------------
const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};


// -------------------- PAGE WRAPPER --------------------
const PageShell = ({ children }) => (
  <>
    <Navbar />
    <motion.main
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-[calc(100vh-80px)] bg-gradient-to-b from-white/60 to-white/20 
      dark:from-slate-900 dark:to-slate-900/80"
    >
      {children}
    </motion.main>
  </>
);


// -------------------- PRIVATE ROUTE HANDLER --------------------
const PrivateRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (requiredRole) {
    if (requiredRole === 'ADMIN' && user.role !== 'ADMIN') {
      return <Navigate to="/" />;
    }
    if (requiredRole === 'STAFF' && user.role !== 'STAFF' && user.role !== 'ADMIN') {
      return <Navigate to="/" />;
    }
    if (requiredRole === 'CUSTOMER' && user.role !== 'CUSTOMER') {
      return <Navigate to="/" />;
    }
  }

  return <PageShell>{children}</PageShell>;
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

        {/* Public Routes */}
        <Route path="/products" element={<PageShell><ProductList /></PageShell>} />
        <Route path="/products/:id" element={<PageShell><ProductDetails /></PageShell>} />

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


// -------------------- MAIN APP --------------------
function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <MotionWrapper>
            <Router>
              <AppRoutes />
            </Router>
          </MotionWrapper>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
