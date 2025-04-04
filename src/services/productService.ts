
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
    console.error("Error fetching products:", error);
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
    console.error("Error fetching product:", error);
    throw error;
  }
  
  return {
    ...data,
    customizations: data.customizations || []
  };
};

// Create new product
export const createProduct = async (product: Omit<Product, 'id' | 'created_at'>): Promise<Product> => {
  console.log("Creating product with data:", JSON.stringify(product, null, 2));
  
  // Make sure customizations is an array
  let customizationsArray: string[] = [];
  
  if (Array.isArray(product.customizations)) {
    customizationsArray = product.customizations;
  } else if (product.customizations && typeof product.customizations === 'string') {
    // Explicitly assert the type to string to avoid 'never' type inference
    const customizationsStr = product.customizations as string;
    try {
      customizationsArray = customizationsStr.split(',').map(item => item.trim()).filter(Boolean);
    } catch (error) {
      console.error("Error processing customizations:", error);
      customizationsArray = [];
    }
  }
        
  try {
    console.log("Sending product data to Supabase:", {
      name: product.name,
      model_number: product.model_number,
      category: product.category,
      price: product.price,
      discounted_price: product.discounted_price,
      image: product.image,
      description: product.description,
      customizations: customizationsArray
    });

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
    
    console.log("Product created successfully:", data);
    
    if (!data) {
      throw new Error("No data returned after creating product");
    }
    
    return {
      ...data,
      customizations: data.customizations || []
    };
  } catch (error) {
    console.error("Product creation failed:", error);
    throw error;
  }
};

// Update product
export const updateProduct = async (id: string, product: Partial<Omit<Product, 'id' | 'created_at'>>): Promise<Product> => {
  console.log("Updating product:", id, JSON.stringify(product, null, 2));
  
  // Handle customizations - ensure it's an array
  let updatedProduct = { ...product };
  
  if (product.customizations !== undefined) {
    let customizationsArray: string[] = [];
    
    if (Array.isArray(product.customizations)) {
      customizationsArray = product.customizations;
    } else if (product.customizations && typeof product.customizations === 'string') {
      // Explicitly assert the type to string to avoid 'never' type inference
      const customizationsStr = product.customizations as string;
      try {
        customizationsArray = customizationsStr.split(',').map(item => item.trim()).filter(Boolean);
      } catch (error) {
        console.error("Error processing customizations:", error);
        customizationsArray = [];
      }
    }
    
    updatedProduct.customizations = customizationsArray;
  }
  
  try {
    console.log("Sending updated product data to Supabase:", updatedProduct);
    
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
    
    console.log("Product updated successfully:", data);
    
    if (!data) {
      throw new Error("No data returned after updating product");
    }
    
    return {
      ...data,
      customizations: data.customizations || []
    };
  } catch (error) {
    console.error("Product update failed:", error);
    throw error;
  }
};

// Delete product
export const deleteProduct = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error("Error deleting product:", error);
      throw error;
    }
    
    console.log("Product deleted successfully:", id);
  } catch (error) {
    console.error("Product deletion failed:", error);
    throw error;
  }
};

// Upload image to Supabase Storage
export const uploadProductImage = async (file: File): Promise<string> => {
  if (!file) throw new Error("No file provided");
  
  console.log("Starting image upload:", file.name, "Size:", file.size, "Type:", file.type);
  
  try {
    // Generate a unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `products/${fileName}`;
    
    console.log("Generated file path:", filePath);
    
    // Check storage bucket exists and is accessible
    const { data: bucketData, error: bucketError } = await supabase.storage
      .getBucket('products');
      
    if (bucketError) {
      console.error("Error checking storage bucket:", bucketError);
      throw new Error(`Storage bucket 'products' may not exist: ${bucketError.message}`);
    }
    console.log("Storage bucket verified:", bucketData);
    
    // Upload to Supabase Storage with progress tracking
    console.log("Uploading file to Supabase Storage...");
    const { error: uploadError, data } = await supabase.storage
      .from('products')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });
    
    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      throw uploadError;
    }
    
    console.log("Upload successful:", data);
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('products')
      .getPublicUrl(filePath);
    
    console.log("Generated public URL:", publicUrl);
    
    return publicUrl;
  } catch (error: any) {
    console.error("Image upload error:", error);
    throw new Error(`Image upload failed: ${error.message}`);
  }
};
