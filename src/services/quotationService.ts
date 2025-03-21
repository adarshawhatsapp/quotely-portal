
import { supabase } from "@/integrations/supabase/client";

// Types for quotation items
export interface QuoteItem {
  id: string;
  name: string;
  modelNumber: string;
  area: string;
  quantity: number;
  price: number;
  discountedPrice: number;
  customization: string;
  total: number;
  image?: string | null;
  type: 'product' | 'spare';
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
  bank_name: string;
  account_no: string;
  ifsc_code: string;
}

// Get all quotations
export const getQuotations = async (): Promise<Quotation[]> => {
  const { data, error } = await supabase
    .from('quotations')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) {
    throw error;
  }
  
  return data;
};

// Get quotation by ID
export const getQuotationById = async (id: string): Promise<Quotation> => {
  const { data, error } = await supabase
    .from('quotations')
    .select('*')
    .eq('id', id)
    .maybeSingle();
    
  if (error) {
    throw error;
  }
  
  if (!data) {
    throw new Error("Quotation not found");
  }
  
  return data;
};

// Company details for all quotations
const defaultCompanyDetails: CompanyDetails = {
  name: "Magnific Designer Fans & Lights",
  bank_name: "HDFC Bank",
  account_no: "543210000012345",
  ifsc_code: "HDFC0000123"
};

// Create new quotation
export const createQuotation = async (
  items: QuoteItem[],
  customerInfo: CustomerInfo,
  subtotal: number,
  gst: number,
  total: number
): Promise<Quotation> => {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  
  if (userError) {
    throw userError;
  }
  
  const userId = userData.user.id;
  
  const { data, error } = await supabase
    .from('quotations')
    .insert([{
      customer_name: customerInfo.name,
      customer_email: customerInfo.email,
      customer_phone: customerInfo.phone,
      customer_address: customerInfo.address,
      customer_id: customerInfo.id || null,
      items: items,
      subtotal: subtotal,
      gst: gst,
      total: total,
      user_id: userId,
      company_details: defaultCompanyDetails
    }])
    .select()
    .single();
    
  if (error) {
    throw error;
  }
  
  return data;
};

// Update quotation status
export const updateQuotationStatus = async (id: string, status: 'Pending' | 'Approved' | 'Rejected'): Promise<Quotation> => {
  const { data, error } = await supabase
    .from('quotations')
    .update({ status })
    .eq('id', id)
    .select()
    .single();
    
  if (error) {
    throw error;
  }
  
  return data;
};

// Delete quotation
export const deleteQuotation = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('quotations')
    .delete()
    .eq('id', id);
    
  if (error) {
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
