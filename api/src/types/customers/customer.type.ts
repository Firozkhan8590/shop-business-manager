export interface Customer {
  id: number;
  name: string;
  phone: string | null;
  address: string | null;
  opening_balance: string;
  notes: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateCustomerInput {
  name: string;
  phone?: string | null;
  address?: string | null;
  opening_balance?: number;
  notes?: string | null;
}

export interface UpdateCustomerInput {
  name?: string;
  phone?: string | null;
  address?: string | null;
  opening_balance?: number;
  notes?: string | null;
}