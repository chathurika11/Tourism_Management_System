import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const roleMatches = (userRole, allowedRoles) => {
  if (!allowedRoles || allowedRoles.length === 0) return true;
  return allowedRoles.map((role) => role.toLowerCase()).includes((userRole || '').toLowerCase());
};

const PrivateRoute = ({ children, adminOnly = false, roles = [] }) => {
  const { user, loading, isMainAdmin } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-cta"></div>
      </div>
    );
  }

  // If no user, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.mustChangePassword && location.pathname !== '/change-password') {
    return <Navigate to="/change-password" replace />;
  }

  // If admin only route and user is not ADMIN, redirect to access denied
  if (adminOnly && !isMainAdmin) {
    return <Navigate to="/access-denied" replace />;
  }

  if (!adminOnly && !roleMatches(user.role, roles)) {
    return <Navigate to="/access-denied" replace />;
  }

  // Render the protected component
  return children;
};

export default PrivateRoute;
