import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useRole } from '../contexts/RoleContext';
import LoadingSpinner from './LoadingSpinner';

/**
 * ProtectedRoute Component - Route protection with role-based access
 * Ensures only authenticated users with appropriate roles can access routes
 */

const ProtectedRoute = ({ 
  children, 
  requiredRoles = [], 
  requiredPermissions = [],
  fallbackPath = '/login' 
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  const { hasAnyRole, hasAnyPermission } = useRole();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <Navigate 
        to={fallbackPath} 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // Check role requirements
  if (requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
    return (
      <Navigate 
        to="/unauthorized" 
        state={{ 
          from: location,
          reason: 'insufficient_role',
          required: requiredRoles
        }} 
        replace 
      />
    );
  }

  // Check permission requirements
  if (requiredPermissions.length > 0 && !hasAnyPermission(requiredPermissions)) {
    return (
      <Navigate 
        to="/unauthorized" 
        state={{ 
          from: location,
          reason: 'insufficient_permissions',
          required: requiredPermissions
        }} 
        replace 
      />
    );
  }

  // User is authenticated and has required permissions
  return children;
};

export default ProtectedRoute;
