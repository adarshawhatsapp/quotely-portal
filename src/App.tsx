
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
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
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <DashboardPage />
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/products" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <ProductsPage />
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/spares" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <SparesPage />
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/quotations" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <QuotationsPage />
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/quotations/:id" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <QuotationDetailPage />
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/quotations/new" 
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <CreateQuotationPage />
                  </MainLayout>
                </ProtectedRoute>
              } 
            />
            
            {/* Admin routes */}
            <Route 
              path="/admin/dashboard" 
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminLayout>
                    <AdminDashboardPage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route 
              path="/admin/users" 
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminLayout>
                    <AdminUsersPage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route 
              path="/admin/products" 
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminLayout>
                    <AdminProductsPage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route 
              path="/admin/spares" 
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminLayout>
                    <AdminSparesPage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route 
              path="/admin/quotations" 
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminLayout>
                    <AdminQuotationsPage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            <Route 
              path="/admin/customers" 
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminLayout>
                    <AdminCustomersPage />
                  </AdminLayout>
                </ProtectedRoute>
              }
            />
            
            {/* Fallback routes */}
            <Route path="/404" element={<NotFoundPage />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </Router>
        <Toaster position="top-right" richColors closeButton />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
