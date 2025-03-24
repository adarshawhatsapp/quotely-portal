
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
    console.error("Error fetching spares:", error);
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
    .maybeSingle();
    
  if (error) {
    console.error("Error fetching spare by ID:", error);
    throw error;
  }
  
  if (!data) {
    throw new Error(`Spare with ID ${id} not found`);
  }
  
  return data;
};

// Create new spare
export const createSpare = async (spare: Omit<Spare, 'id' | 'created_at'>): Promise<Spare> => {
  console.log("Creating spare:", spare);
  
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
    console.error("Error creating spare:", error);
    throw error;
  }
  
  return data;
};

// Update spare
export const updateSpare = async (id: string, spare: Partial<Omit<Spare, 'id' | 'created_at'>>): Promise<Spare> => {
  console.log("Updating spare:", id, spare);
  
  const { data, error } = await supabase
    .from('spares')
    .update(spare)
    .eq('id', id)
    .select()
    .single();
    
  if (error) {
    console.error("Error updating spare:", error);
    throw error;
  }
  
  return data;
};

// Delete spare
export const deleteSpare = async (id: string): Promise<void> => {
  console.log("Deleting spare:", id);
  
  const { error } = await supabase
    .from('spares')
    .delete()
    .eq('id', id);
    
  if (error) {
    console.error("Error deleting spare:", error);
    throw error;
  }
};

// Update spare stock
export const updateSpareStock = async (id: string, quantity: number): Promise<Spare> => {
  console.log("Updating spare stock:", id, quantity);
  
  // First, get the current stock
  const { data: currentSpare, error: fetchError } = await supabase
    .from('spares')
    .select('stock')
    .eq('id', id)
    .maybeSingle();
    
  if (fetchError) {
    console.error("Error fetching current spare stock:", fetchError);
    throw fetchError;
  }
  
  if (!currentSpare) {
    throw new Error(`Spare with ID ${id} not found`);
  }
  
  // Calculate new stock
  const newStock = currentSpare.stock + quantity;
  
  if (newStock < 0) {
    throw new Error("Cannot reduce stock below zero");
  }
  
  // Update stock
  const { data, error } = await supabase
    .from('spares')
    .update({ stock: newStock })
    .eq('id', id)
    .select()
    .single();
    
  if (error) {
    console.error("Error updating spare stock:", error);
    throw error;
  }
  
  return data;
};
