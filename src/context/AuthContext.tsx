
import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";

type Role = "admin" | "user";

interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  adminLogin: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  // Mock login function (will be replaced with API call)
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // This would be an API call in production
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock successful login for demonstration
      const mockUser: User = {
        id: "usr_" + Math.random().toString(36).substring(2, 9),
        email,
        name: email.split('@')[0],
        role: "user"
      };
      
      setUser(mockUser);
      localStorage.setItem("user", JSON.stringify(mockUser));
      toast.success("Welcome back!");
      return true;
    } catch (error) {
      toast.error("Login failed. Please check your credentials.");
      console.error("Login error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Mock admin login
  const adminLogin = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // This would be an API call in production
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock successful admin login
      const mockAdminUser: User = {
        id: "adm_" + Math.random().toString(36).substring(2, 9),
        email,
        name: "Admin",
        role: "admin"
      };
      
      setUser(mockAdminUser);
      localStorage.setItem("user", JSON.stringify(mockAdminUser));
      toast.success("Welcome, Admin!");
      return true;
    } catch (error) {
      toast.error("Admin login failed.");
      console.error("Admin login error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Mock register function
  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // This would be an API call in production
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock successful registration
      const mockUser: User = {
        id: "usr_" + Math.random().toString(36).substring(2, 9),
        email,
        name,
        role: "user"
      };
      
      setUser(mockUser);
      localStorage.setItem("user", JSON.stringify(mockUser));
      toast.success("Registration successful!");
      return true;
    } catch (error) {
      toast.error("Registration failed. Please try again.");
      console.error("Registration error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    toast.info("You have been logged out");
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, adminLogin, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
