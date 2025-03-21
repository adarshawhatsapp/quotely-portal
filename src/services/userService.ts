
import { supabase } from "@/integrations/supabase/client";

// Types
export interface UserProfile {
  id: string;
  name: string;
  role: 'admin' | 'user';
  created_at: string;
}

// Get all profiles (admin only)
export const getAllProfiles = async (): Promise<UserProfile[]> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at');
    
  if (error) {
    throw error;
  }
  
  return data;
};

// Get profile by ID (admin or own profile)
export const getProfileById = async (id: string): Promise<UserProfile> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) {
    throw error;
  }
  
  return data;
};

// Update profile
export const updateProfile = async (id: string, profile: Partial<Omit<UserProfile, 'id' | 'created_at'>>): Promise<UserProfile> => {
  const { data, error } = await supabase
    .from('profiles')
    .update(profile)
    .eq('id', id)
    .select()
    .single();
    
  if (error) {
    throw error;
  }
  
  return data;
};

// Update user to admin
export const promoteToAdmin = async (id: string): Promise<UserProfile> => {
  const { data, error } = await supabase
    .from('profiles')
    .update({ role: 'admin' })
    .eq('id', id)
    .select()
    .single();
    
  if (error) {
    throw error;
  }
  
  return data;
};

// Update admin to user
export const demoteToUser = async (id: string): Promise<UserProfile> => {
  const { data, error } = await supabase
    .from('profiles')
    .update({ role: 'user' })
    .eq('id', id)
    .select()
    .single();
    
  if (error) {
    throw error;
  }
  
  return data;
};
