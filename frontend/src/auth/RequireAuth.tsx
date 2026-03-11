import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth, type User } from "./AuthProvider";

type RequireAuthProps = {
  allowedRoles?: Array<User["role"]>;
};

export default function RequireAuth({ allowedRoles }: RequireAuthProps) {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}