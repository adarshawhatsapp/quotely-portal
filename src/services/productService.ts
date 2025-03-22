
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
  // Make sure customizations is an array
  let customizationsArray: string[] = [];
  
  if (Array.isArray(product.customizations)) {
    customizationsArray = product.customizations;
  } else if (product.customizations && typeof product.customizations === 'string') {
    // Explicitly assert the type to string to avoid 'never' type inference
    const customizationsStr = product.customizations as string;
    customizationsArray = customizationsStr.split(',').map(item => item.trim()).filter(Boolean);
  }
        
  const { data, error } = await supabase
    .from('products')
    .insert([{
      name: product.name,
      model_number: product.model_number,
      category: product.category,
      price: product.price,
      discounted_price: product.discounted_price || null,
      image: product.image,
      description: product.description,
      customizations: customizationsArray
    }])
    .select()
    .single();
    
  if (error) {
    console.error("Error creating product:", error);
    throw error;
  }
  
  if (!data) {
    throw new Error("No data returned after creating product");
  }
  
  return {
    ...data,
    customizations: data.customizations || []
  };
};

// Update product
export const updateProduct = async (id: string, product: Partial<Omit<Product, 'id' | 'created_at'>>): Promise<Product> => {
  // Handle customizations - ensure it's an array
  let updatedProduct = { ...product };
  
  if (product.customizations !== undefined) {
    let customizationsArray: string[] = [];
    
    if (Array.isArray(product.customizations)) {
      customizationsArray = product.customizations;
    } else if (product.customizations && typeof product.customizations === 'string') {
      // Explicitly assert the type to string to avoid 'never' type inference
      const customizationsStr = product.customizations as string;
      customizationsArray = customizationsStr.split(',').map(item => item.trim()).filter(Boolean);
    }
    
    updatedProduct.customizations = customizationsArray;
  }
  
  const { data, error } = await supabase
    .from('products')
    .update(updatedProduct)
    .eq('id', id)
    .select()
    .single();
    
  if (error) {
    console.error("Error updating product:", error);
    throw error;
  }
  
  if (!data) {
    throw new Error("No data returned after updating product");
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

// Upload image to Supabase Storage
export const uploadProductImage = async (file: File): Promise<string> => {
  if (!file) throw new Error("No file provided");
  
  try {
    // Generate a unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `products/${fileName}`;
    
    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('products')
      .upload(filePath, file);
    
    if (uploadError) throw uploadError;
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('products')
      .getPublicUrl(filePath);
    
    return publicUrl;
  } catch (error: any) {
    console.error("Image upload error:", error);
    throw new Error(`Image upload failed: ${error.message}`);
  }
};
