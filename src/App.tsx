
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/ui/theme-provider";
import ProtectedRoute from "@/components/ProtectedRoute";

// Layouts
import MainLayout from "@/layouts/MainLayout";
import AuthLayout from "@/layouts/AuthLayout";
import AdminLayout from "@/layouts/AdminLayout";

// Pages
import IndexPage from "@/pages/Index";
import DashboardPage from "@/pages/Dashboard";
import ProductsPage from "@/pages/Products";
import SparesPage from "@/pages/Spares";
import QuotationsPage from "@/pages/Quotations";
import QuotationDetailPage from "@/pages/QuotationDetail";
import CreateQuotationPage from "@/pages/CreateQuotation";
import NotFoundPage from "@/pages/NotFound";

// Auth Pages
import LoginPage from "@/pages/auth/Login";
import RegisterPage from "@/pages/auth/Register";

// Admin Pages
import AdminLoginPage from "@/pages/admin/AdminLogin";
import AdminDashboardPage from "@/pages/admin/AdminDashboard";
import AdminUsersPage from "@/pages/admin/AdminUsers";
import AdminProductsPage from "@/pages/admin/AdminProducts";
import AdminSparesPage from "@/pages/admin/AdminSpares";
import AdminQuotationsPage from "@/pages/admin/AdminQuotations";
import AdminCustomersPage from "@/pages/admin/AdminCustomers";

// Auth Provider
import { AuthProvider } from "@/context/AuthContext";

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="theme">
        <AuthProvider>
          <Router>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<IndexPage />} />
              
              {/* Auth routes */}
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/admin/login" element={<AdminLoginPage />} />
              </Route>
              
              {/* Protected routes */}
              <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/spares" element={<SparesPage />} />
                <Route path="/quotations" element={<QuotationsPage />} />
                <Route path="/quotations/:id" element={<QuotationDetailPage />} />
                <Route path="/quotations/new" element={<CreateQuotationPage />} />
              </Route>
              
              {/* Admin routes */}
              <Route element={<ProtectedRoute allowedRoles={["admin"]}><AdminLayout /></ProtectedRoute>}>
                <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                <Route path="/admin/users" element={<AdminUsersPage />} />
                <Route path="/admin/products" element={<AdminProductsPage />} />
                <Route path="/admin/spares" element={<AdminSparesPage />} />
                <Route path="/admin/quotations" element={<AdminQuotationsPage />} />
                <Route path="/admin/customers" element={<AdminCustomersPage />} />
              </Route>
              
              {/* Fallback routes */}
              <Route path="/404" element={<NotFoundPage />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </Router>
          <Toaster position="top-right" richColors closeButton />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
