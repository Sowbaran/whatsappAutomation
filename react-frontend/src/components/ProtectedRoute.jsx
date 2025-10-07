import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const ProtectedRoute = ({ children, roles = [] }) => {
  const { isAuth, user, loading } = useAppContext();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (!isAuth) {
    // Redirect to login page if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has required role
  if (roles.length > 0 && !roles.includes(user.role)) {
    // Redirect to unauthorized page or home based on user role
    return user.role === 'salesman' 
      ? <Navigate to="/salesman/orders" replace /> 
      : <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
