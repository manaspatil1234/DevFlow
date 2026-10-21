
import { Navigate, Outlet } from "react-router-dom";

function isTokenValid(token) {
  if (!token) return false;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));

    return Boolean(payload.exp && payload.exp * 1000 > Date.now());
  } catch {
    return false;
  }
}

export default function ProtectedRoute() {
  const token = localStorage.getItem("token");

  if (!isTokenValid(token)) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
