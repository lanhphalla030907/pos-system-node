import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getAccessToken } from "../store/profile.store";

const ProtectedRoute = () => {
  const location = useLocation();

  if (!getAccessToken()) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
