
import { supabase } from "@/integrations/supabase/client";

// Types
export interface Product {
  id: string;
  name: string;
  model_number: string;
  category: string;
  price: number;
  discounted_price: number | null;
  image: string | null;
  description: string | null;
  customizations: string[];
  created_at: string;
}

// Get all products
export const getProducts = async (): Promise<Product[]> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('name');
    
  if (error) {
    throw error;
  }
  
  // Transform customizations from JSONB to string[]
  return data.map(product => ({
    ...product,
    customizations: product.customizations || []
  }));
};

// Get product by ID
export const getProductById = async (id: string): Promise<Product> => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) {
    throw error;
  }
  
  return {
    ...data,
    customizations: data.customizations || []
  };
};

// Create new product
export const createProduct = async (product: Omit<Product, 'id' | 'created_at'>): Promise<Product> => {
  const { data, error } = await supabase
    .from('products')
    .insert([{
      name: product.name,
      model_number: product.model_number,
      category: product.category,
      price: product.price,
      discounted_price: product.discounted_price || product.price,
      image: product.image,
      description: product.description,
      customizations: product.customizations
    }])
    .select()
    .single();
    
  if (error) {
    throw error;
  }
  
  return {
    ...data,
    customizations: data.customizations || []
  };
};

// Update product
export const updateProduct = async (id: string, product: Partial<Omit<Product, 'id' | 'created_at'>>): Promise<Product> => {
  const { data, error } = await supabase
    .from('products')
    .update(product)
    .eq('id', id)
    .select()
    .single();
    
  if (error) {
    throw error;
  }
  
  return {
    ...data,
    customizations: data.customizations || []
  };
};

// Delete product
export const deleteProduct = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);
    
  if (error) {
    throw error;
  }
};
