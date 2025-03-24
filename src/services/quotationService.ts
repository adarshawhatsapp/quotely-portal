import { supabase } from "@/integrations/supabase/client";
import { companyDetails as defaultCompanyDetails } from "@/utils/quotationUtils";

// Types for quotation items
export interface QuoteItem {
  id: string;
  name: string;
  modelNumber?: string;
  area?: string;
  quantity: number;
  price: number;
  discountedPrice: number;
  total: number;
  image?: string | null;
  type: 'product' | 'spare';
  customization?: string | null;
  description?: string | null;
  parentProductId?: string | null; // For spare parts that are attached to a product
}

// Types for quotation
export interface Quotation {
  id: string;
  quote_number: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string | null;
  customer_address: string | null;
  customer_id: string | null;
  items: QuoteItem[];
  subtotal: number;
  gst: number;
  total: number;
  status: 'Pending' | 'Approved' | 'Rejected';
  user_id: string;
  created_at: string;
  company_details: CompanyDetails;
}

// Types for customer info
export interface CustomerInfo {
  id?: string | null;
  name: string;
  email: string;
  phone: string;
  address: string;
}

// Types for company details
export interface CompanyDetails {
  name: string;
  logo?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  bank_name: string;
  account_no: string;
  ifsc_code: string;
}

// Get all quotations
export const getQuotations = async (): Promise<Quotation[]> => {
  console.log("Fetching all quotations");
  
  const { data, error } = await supabase
    .from('quotations')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error("Error fetching quotations:", error);
    throw error;
  }
  
  return data;
};

// Get quotation by ID
export const getQuotationById = async (id: string): Promise<Quotation> => {
  console.log("Fetching quotation by ID:", id);
  
  const { data, error } = await supabase
    .from('quotations')
    .select('*')
    .eq('id', id)
    .maybeSingle();
    
  if (error) {
    console.error("Error fetching quotation by ID:", error);
    throw error;
  }
  
  if (!data) {
    throw new Error("Quotation not found");
  }
  
  return data;
};

// Create new quotation
export const createQuotation = async (
  items: QuoteItem[],
  customerInfo: CustomerInfo,
  subtotal: number,
  gst: number,
  total: number
): Promise<Quotation> => {
  console.log("Creating quotation:", { items, customerInfo, subtotal, gst, total });
  
  const { data: userData, error: userError } = await supabase.auth.getUser();
  
  if (userError) {
    console.error("Error getting user:", userError);
    throw userError;
  }
  
  const userId = userData.user.id;
  
  // Ensure that no null values are submitted to Supabase for required fields
  // Clean the items to ensure they match our database schema
  const cleanItems = items.map(item => ({
    id: item.id,
    name: item.name,
    modelNumber: item.modelNumber || null,
    area: item.area || null,
    quantity: item.quantity,
    price: item.price,
    discountedPrice: item.discountedPrice,
    customization: item.customization || null,
    description: item.description || null,
    total: item.total,
    image: item.image || null,
    type: item.type,
    parentProductId: item.parentProductId || null
  }));
  
  const { data, error } = await supabase
    .from('quotations')
    .insert([{
      customer_name: customerInfo.name,
      customer_email: customerInfo.email || null,
      customer_phone: customerInfo.phone || null,
      customer_address: customerInfo.address || null,
      customer_id: customerInfo.id || null,
      items: cleanItems,
      subtotal: subtotal,
      gst: gst,
      total: total,
      user_id: userId,
      company_details: defaultCompanyDetails
    }])
    .select()
    .single();
    
  if (error) {
    console.error("Error creating quotation:", error);
    throw error;
  }
  
  return data;
};

// Update quotation
export const updateQuotation = async (
  id: string,
  items: QuoteItem[],
  customerInfo: CustomerInfo,
  subtotal: number,
  gst: number,
  total: number
): Promise<Quotation> => {
  console.log("Updating quotation:", { id, items, customerInfo, subtotal, gst, total });
  
  // Clean the items to ensure they match our database schema
  const cleanItems = items.map(item => ({
    id: item.id,
    name: item.name,
    modelNumber: item.modelNumber || null,
    area: item.area || null,
    quantity: item.quantity,
    price: item.price,
    discountedPrice: item.discountedPrice,
    customization: item.customization || null,
    description: item.description || null,
    total: item.total,
    image: item.image || null,
    type: item.type,
    parentProductId: item.parentProductId || null
  }));
  
  const { data, error } = await supabase
    .from('quotations')
    .update({
      customer_name: customerInfo.name,
      customer_email: customerInfo.email || null,
      customer_phone: customerInfo.phone || null,
      customer_address: customerInfo.address || null,
      customer_id: customerInfo.id || null,
      items: cleanItems,
      subtotal: subtotal,
      gst: gst,
      total: total
    })
    .eq('id', id)
    .select()
    .single();
    
  if (error) {
    console.error("Error updating quotation:", error);
    throw error;
  }
  
  return data;
};

// Update quotation status
export const updateQuotationStatus = async (id: string, status: 'Pending' | 'Approved' | 'Rejected'): Promise<Quotation> => {
  console.log("Updating quotation status:", id, status);
  
  const { data, error } = await supabase
    .from('quotations')
    .update({ status })
    .eq('id', id)
    .select()
    .single();
    
  if (error) {
    console.error("Error updating quotation status:", error);
    throw error;
  }
  
  return data;
};

// Delete quotation
export const deleteQuotation = async (id: string): Promise<void> => {
  console.log("Deleting quotation:", id);
  
  const { error } = await supabase
    .from('quotations')
    .delete()
    .eq('id', id);
    
  if (error) {
    console.error("Error deleting quotation:", error);
    throw error;
  }
};

// Get company details 
export const getCompanyDetails = async (): Promise<CompanyDetails> => {
  // In the future, this could be fetched from a settings table
  return defaultCompanyDetails;
};

// Calculate GST for a given subtotal
export const calculateGST = (subtotal: number): number => {
  return subtotal * 0.18; // 18% GST
};

// Calculate total from subtotal and GST
export const calculateTotal = (subtotal: number, gst: number): number => {
  return subtotal + gst;
};
