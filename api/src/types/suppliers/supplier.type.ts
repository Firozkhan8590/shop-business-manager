export interface Supplier {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
  opening_balance: string;
  notes: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateSupplierInput {
  name: string;
  phone?: string | null;
  address?: string | null;
  opening_balance?: number;
  notes?: string | null;
  is_active?: boolean;
}

export interface UpdateSupplierInput {
  name?: string;
  phone?: string | null;
  address?: string | null;
  opening_balance?: number;
  notes?: string | null;
  is_active?: boolean;
}