
import { useState, useEffect, ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { 
  LayoutDashboard, 
  Package, 
  Wrench, 
  FileText, 
  FilePlus, 
  LogOut, 
  Menu, 
  X,
  User,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useIsMobile } from "@/hooks/use-mobile";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  // Update sidebar state when screen size changes
  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  const navigation = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Products", path: "/products", icon: Package },
    { name: "Spares", path: "/spares", icon: Wrench },
    { name: "Quotations", path: "/quotations", icon: FileText },
    { name: "Create Quote", path: "/quotations/new", icon: FilePlus },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile sidebar backdrop */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-10 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={`fixed lg:sticky top-0 left-0 h-screen bg-white border-r shadow-sm z-20
        transition-all duration-300 transform ${sidebarOpen ? "translate-x-0 w-64" : "-translate-x-full lg:translate-x-0 lg:w-20"}`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b">
            <h1 className={`font-semibold transition-all duration-300 ${sidebarOpen ? "text-xl" : "text-center text-base"}`}>
              {sidebarOpen ? "Magnific Quotes" : "MQ"}
            </h1>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 py-6 overflow-y-auto">
            <ul className="space-y-1 px-3">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    className={`flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 group
                    ${isActive(item.path) 
                      ? "bg-primary/10 text-primary font-medium" 
                      : "text-gray-600 hover:bg-gray-100"}
                    `}
                  >
                    <item.icon className={`h-5 w-5 flex-shrink-0 ${isActive(item.path) ? "text-primary" : ""}`} />
                    <span className={`ml-3 transition-opacity duration-200 ${sidebarOpen ? "opacity-100" : "opacity-0 hidden lg:block"}`}>
                      {item.name}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          
          {/* Logout button */}
          <div className="p-4 border-t">
            <button
              onClick={logout}
              className={`flex items-center px-3 py-2.5 rounded-lg text-gray-600 hover:bg-gray-100 w-full transition-all duration-200
              ${sidebarOpen ? "" : "justify-center"}`}
            >
              <LogOut className="h-5 w-5 flex-shrink-0" />
              <span className={`ml-3 transition-opacity duration-200 ${sidebarOpen ? "opacity-100" : "opacity-0 hidden lg:block"}`}>
                Logout
              </span>
            </button>
          </div>
        </div>
      </aside>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 border-b bg-white flex items-center px-4 sticky top-0 z-10">
          <div className="flex w-full items-center justify-between">
            {/* Mobile sidebar toggle */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none lg:hidden"
            >
              {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            
            {/* Page title - extracted from current route */}
            <div className="hidden sm:block lg:ml-16">
              <h1 className="text-xl font-medium text-gray-800">
                {navigation.find(item => isActive(item.path))?.name || "Magnific Quotes"}
              </h1>
            </div>
            
            {/* User dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <User className="h-4 w-4" />
                  </div>
                  <span className="hidden md:inline-block font-medium">{user?.name}</span>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-red-500">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        
        {/* Page content */}
        <main className="flex-1 overflow-x-hidden p-6 bg-gray-50/50">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
