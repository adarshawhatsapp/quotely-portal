
import { supabase } from "@/integrations/supabase/client";

// Types
export interface Spare {
  id: string;
  name: string;
  price: number;
  stock: number;
  created_at: string;
}

// Get all spares
export const getSpares = async (): Promise<Spare[]> => {
  const { data, error } = await supabase
    .from('spares')
    .select('*')
    .order('name');
    
  if (error) {
    throw error;
  }
  
  return data;
};

// Get spare by ID
export const getSpareById = async (id: string): Promise<Spare> => {
  const { data, error } = await supabase
    .from('spares')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) {
    throw error;
  }
  
  return data;
};

// Create new spare
export const createSpare = async (spare: Omit<Spare, 'id' | 'created_at'>): Promise<Spare> => {
  const { data, error } = await supabase
    .from('spares')
    .insert([{
      name: spare.name,
      price: spare.price,
      stock: spare.stock
    }])
    .select()
    .single();
    
  if (error) {
    throw error;
  }
  
  return data;
};

// Update spare
export const updateSpare = async (id: string, spare: Partial<Omit<Spare, 'id' | 'created_at'>>): Promise<Spare> => {
  const { data, error } = await supabase
    .from('spares')
    .update(spare)
    .eq('id', id)
    .select()
    .single();
    
  if (error) {
    throw error;
  }
  
  return data;
};

// Delete spare
export const deleteSpare = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('spares')
    .delete()
    .eq('id', id);
    
  if (error) {
    throw error;
  }
};

// Update spare stock
export const updateSpareStock = async (id: string, quantity: number): Promise<Spare> => {
  // First, get the current stock
  const { data: currentSpare, error: fetchError } = await supabase
    .from('spares')
    .select('stock')
    .eq('id', id)
    .single();
    
  if (fetchError) {
    throw fetchError;
  }
  
  // Calculate new stock
  const newStock = currentSpare.stock + quantity;
  
  // Update stock
  const { data, error } = await supabase
    .from('spares')
    .update({ stock: newStock })
    .eq('id', id)
    .select()
    .single();
    
  if (error) {
    throw error;
  }
  
  return data;
};
