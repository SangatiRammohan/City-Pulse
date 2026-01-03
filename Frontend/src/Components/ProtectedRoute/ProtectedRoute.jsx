import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authAPI } from '../../services/api';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const isAuthenticated = authAPI.isAuthenticated();

  if (!isAuthenticated) {
    // Redirect to signin with return URL
    return <Navigate to="/signin" state={{ from: location, returnTo: location.pathname }} replace />;
  }

  return children;
};

export default ProtectedRoute;