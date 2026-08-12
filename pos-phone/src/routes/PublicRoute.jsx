import { Navigate, Outlet } from "react-router-dom";
import { getAccessToken } from "../store/profile.store";

const PublicRoute = () => {
  if (getAccessToken()) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default PublicRoute;
