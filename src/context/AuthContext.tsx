
import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";

type Role = "admin" | "user";

interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: Role;
}

interface AuthContextType {
  user: UserProfile | null;
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
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize auth state from Supabase session
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check active session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          await setUserFromSession(session);
        }
        
        // Listen for auth changes
        const { data: { subscription } } = await supabase.auth.onAuthStateChange(
          async (_event, session) => {
            if (session) {
              await setUserFromSession(session);
            } else {
              setUser(null);
            }
            setIsLoading(false);
          }
        );
        
        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error("Auth initialization error:", error);
        setIsLoading(false);
      }
    };
    
    initializeAuth();
  }, []);
  
  // Helper function to set user data from session
  const setUserFromSession = async (session: Session) => {
    try {
      // Get user from session
      const supabaseUser = session.user;
      
      // Get profile data
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();
      
      if (error) throw error;
      
      // Combine auth user and profile
      const userProfile: UserProfile = {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        name: profile.name,
        role: profile.role as Role
      };
      
      setUser(userProfile);
    } catch (error) {
      console.error("Error setting user from session:", error);
      setUser(null);
    }
  };

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      // User will be set by the onAuthStateChange listener
      toast.success("Welcome back!");
      return true;
    } catch (error: any) {
      toast.error(error.message || "Login failed. Please check your credentials.");
      console.error("Login error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Admin login - same as regular login, but we verify role after login
  const adminLogin = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      // Check if user is admin
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();
        
      if (profileError) throw profileError;
      
      if (profile.role !== 'admin') {
        // Sign out if not admin
        await supabase.auth.signOut();
        toast.error("Access denied. Admin privileges required.");
        return false;
      }
      
      toast.success("Welcome, Admin!");
      return true;
    } catch (error: any) {
      toast.error(error.message || "Admin login failed.");
      console.error("Admin login error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name
          }
        }
      });
      
      if (error) throw error;
      
      // If email confirmation is enabled, we need to tell the user
      if (!data.session) {
        toast.success("Registration successful! Please check your email to confirm your account.");
        return true;
      }
      
      // User will be set by the onAuthStateChange listener
      toast.success("Registration successful!");
      return true;
    } catch (error: any) {
      toast.error(error.message || "Registration failed. Please try again.");
      console.error("Registration error:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      toast.info("You have been logged out");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed");
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, adminLogin, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
