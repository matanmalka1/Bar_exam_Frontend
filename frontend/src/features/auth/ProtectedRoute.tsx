import { Navigate, Outlet, useLocation } from "react-router-dom";
import PageLoading from "../../components/PageLoading";
import { useAuth } from "./useAuth";

const ProtectedRoute = () => {
  const { status } = useAuth();
  const location = useLocation();

  if (status === "loading") return <PageLoading />;
  if (status === "unauthenticated") {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return <Outlet />;
};

export default ProtectedRoute;
