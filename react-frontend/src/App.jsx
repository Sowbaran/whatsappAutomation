import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Orders from './pages/Orders';
import OrderDetails from './pages/OrderDetails';
import Products from './pages/Products';
import SalesProgress from './pages/SalesProgress';
import SalesmanOrders from './pages/salesman/Orders';
import SalesmanOrderDetails from './pages/salesman/OrderDetails';
import Profile from './pages/salesman/Profile';
import SalesmanProfile from './pages/salesman/SalesmanProfile';

// Context
import { AppProvider, useAppContext } from './context/AppContext';
import ProtectedRoute from './components/ProtectedRoute';

// Custom hook for auth redirection
const useAuthRedirect = (requiredRole = null) => {
  const { isAuth, user, loading } = useAppContext();
  const location = useLocation();

  if (loading) {
    return { loading: true };
  }

  if (!isAuth) {
    return { redirect: '/login', state: { from: location } };
  }

  if (requiredRole && user?.role !== requiredRole) {
    return { redirect: user?.role === 'salesman' ? '/salesman/orders' : '/' };
  }

  return { isAuth: true, user };
};

// Auth Wrapper Component
const AuthWrapper = ({ children, requiredRole = null }) => {
  const auth = useAuthRedirect(requiredRole);
  
  if (auth.loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }
  
  if (auth.redirect) {
    return <Navigate to={auth.redirect} state={auth.state} replace />;
  }
  
  return children;
};

// Main App Component
function AppContent() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={
          <AuthWrapper>
            <Login />
          </AuthWrapper>
        } />
        
        <Route path="/salesman/login" element={
          <AuthWrapper>
            <Login isSalesman={true} />
          </AuthWrapper>
        } />

        {/* Admin Routes */}
        <Route element={
          <AuthWrapper requiredRole="admin">
            <MainLayout />
          </AuthWrapper>
        }>
          <Route path="/" element={<Dashboard />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:id" element={<OrderDetails />} />
          <Route path="/products" element={<Products />} />
          <Route path="/sales-progress" element={<SalesProgress />} />
        </Route>

        {/* Salesman Routes */}
        <Route element={
          <AuthWrapper requiredRole="salesman">
            <MainLayout isSalesman={true} />
          </AuthWrapper>
        }>
          <Route path="/salesman/orders" element={<SalesmanOrders />} />
          <Route path="/salesman/orders/:id" element={<SalesmanOrderDetails />} />
          <Route path="/salesman/profile" element={<SalesmanProfile />} />
        </Route>

        {/* 404 Route */}
        <Route path="*" element={
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
              <p className="text-xl text-gray-600">Page not found</p>
            </div>
          </div>
        } />
      </Routes>
    </div>
  );
}

// App Wrapper with Providers
function App() {
  return (
    <AppProvider>
      <Router>
        <AppContent />
      </Router>
    </AppProvider>
  );
}

export default App;
