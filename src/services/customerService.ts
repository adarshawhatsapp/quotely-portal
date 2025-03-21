
import { supabase } from "@/integrations/supabase/client";

// Types
export interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  created_at: string;
}

// Get all customers
export const getCustomers = async (): Promise<Customer[]> => {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('name');
    
  if (error) {
    throw error;
  }
  
  return data;
};

// Get customer by ID
export const getCustomerById = async (id: string): Promise<Customer> => {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) {
    throw error;
  }
  
  return data;
};

// Create new customer
export const createCustomer = async (customer: Omit<Customer, 'id' | 'created_at'>): Promise<Customer> => {
  const { data, error } = await supabase
    .from('customers')
    .insert([{
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address
    }])
    .select()
    .single();
    
  if (error) {
    throw error;
  }
  
  return data;
};

// Update customer
export const updateCustomer = async (id: string, customer: Partial<Omit<Customer, 'id' | 'created_at'>>): Promise<Customer> => {
  const { data, error } = await supabase
    .from('customers')
    .update(customer)
    .eq('id', id)
    .select()
    .single();
    
  if (error) {
    throw error;
  }
  
  return data;
};

// Delete customer
export const deleteCustomer = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('customers')
    .delete()
    .eq('id', id);
    
  if (error) {
    throw error;
  }
};

// Search customers
export const searchCustomers = async (searchQuery: string): Promise<Customer[]> => {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .or(`name.ilike.%${searchQuery}%,phone.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`)
    .order('name')
    .limit(10);
    
  if (error) {
    throw error;
  }
  
  return data;
};
