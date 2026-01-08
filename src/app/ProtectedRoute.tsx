import { Navigate, Outlet } from "react-router-dom";
import { getSessionUser } from "../shared/storage/authStore";

export function ProtectedRoute() {
  const user = getSessionUser();
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}
