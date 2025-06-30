// src/components/PrivateRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';

interface PrivateRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const userType = localStorage.getItem('userType');

  // Simple check for authentication and authorization
  const isAuthenticated = !!token;
  const isAuthorized = isAuthenticated && allowedRoles.includes(userType || '');

  if (!isAuthorized) {
    // Redirect to login page if not authorized
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default PrivateRoute;