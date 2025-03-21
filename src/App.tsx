
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import MainLayout from "./layouts/MainLayout";
import AdminLayout from "./layouts/AdminLayout";
import AuthLayout from "./layouts/AuthLayout";
import LoginPage from "./pages/auth/Login";
import RegisterPage from "./pages/auth/Register";
import AdminLoginPage from "./pages/admin/AdminLogin";
import AdminDashboardPage from "./pages/admin/AdminDashboard";
import AdminUsersPage from "./pages/admin/AdminUsers";
import DashboardPage from "./pages/Dashboard";
import ProductsPage from "./pages/Products";
import SparesPage from "./pages/Spares";
import QuotationsPage from "./pages/Quotations";
import CreateQuotationPage from "./pages/CreateQuotation";
import QuotationDetailPage from "./pages/QuotationDetail";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Auth Routes */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin">
              <Route index element={<AdminLoginPage />} />
              <Route element={<ProtectedRoute requiredRole="admin" />}>
                <Route element={<AdminLayout />}>
                  <Route path="dashboard" element={<AdminDashboardPage />} />
                  <Route path="users" element={<AdminUsersPage />} />
                </Route>
              </Route>
            </Route>

            {/* Main App Routes */}
            <Route element={<ProtectedRoute requiredRole="user" />}>
              <Route element={<MainLayout />}>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/spares" element={<SparesPage />} />
                <Route path="/quotations" element={<QuotationsPage />} />
                <Route path="/quotations/new" element={<CreateQuotationPage />} />
                <Route path="/quotations/:id" element={<QuotationDetailPage />} />
              </Route>
            </Route>

            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
