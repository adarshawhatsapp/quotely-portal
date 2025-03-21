
import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  requiredRole?: "admin" | "user";
}

const ProtectedRoute = ({ requiredRole }: ProtectedRouteProps) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // Log the route access attempt
    if (!user && !isLoading) {
      console.log(`Unauthorized access attempt to: ${location.pathname}`);
    }
  }, [user, isLoading, location.pathname]);

  if (isLoading) {
    // Show loading state
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 text-primary animate-spin" />
          <p className="text-lg font-medium text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Check if user is authenticated
  if (!user) {
    // Redirect to login, preserving the intended destination
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check for role-based access
  if (requiredRole && user.role !== requiredRole) {
    // Redirect based on role
    if (user.role === "admin" && requiredRole === "user") {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (user.role === "user" && requiredRole === "admin") {
      return <Navigate to="/dashboard" replace />;
    }
  }

  // If all checks pass, render the protected route
  return <Outlet />;
};

export default ProtectedRoute;
