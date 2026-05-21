import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { getDefaultRouteForRole, getStoredUser, hasAuthSession } from './storage';

const ProtectedRoute = ({ allowRoles }) => {
  const location = useLocation();
  const user = getStoredUser();

  if (!hasAuthSession() || !user) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  if (allowRoles?.length && !allowRoles.includes(user.role)) {
    return <Navigate to={getDefaultRouteForRole(user.role)} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
