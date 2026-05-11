import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext'; 

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { role, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-900"></div>
      </div>
    );
  }

  
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

 
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />; 
  }

  return children;
};

export default ProtectedRoute;