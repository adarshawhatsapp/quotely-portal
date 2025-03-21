
import { supabase } from "@/integrations/supabase/client";

// Types for quotation items
export interface QuoteItem {
  id: string;
  name: string;
  modelNumber: string;
  quantity: number;
  price: number;
  discountedPrice: number;
  customization: string;
  total: number;
}

// Types for quotation
export interface Quotation {
  id: string;
  quote_number: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string | null;
  customer_address: string | null;
  items: QuoteItem[];
  subtotal: number;
  gst: number;
  total: number;
  status: 'Pending' | 'Approved' | 'Rejected';
  user_id: string;
  created_at: string;
}

// Types for customer info
export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
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
    .single();
    
  if (error) {
    throw error;
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
      items: items,
      subtotal: subtotal,
      gst: gst,
      total: total,
      user_id: userId
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
