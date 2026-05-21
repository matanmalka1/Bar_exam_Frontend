import { Navigate, Outlet, useLocation } from "react-router-dom";
import AppLoader from "../../components/loader";
import { useAuth } from "./useAuth";

const ProtectedRoute = () => {
  const { status } = useAuth();
  const location = useLocation();

  if (status === "loading") {
    return <AppLoader variant="page" label="טוען נתונים..." />;
  }
  if (status === "unauthenticated") {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <Outlet />;
};

export default ProtectedRoute;
