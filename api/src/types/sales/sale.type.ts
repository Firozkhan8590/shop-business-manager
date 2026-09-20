export interface SaleItemInput {
  product_id: number;
  quantity: number;
  unit_price: number;
}

export interface CreateSaleInput {
  invoice_number: string;
  customer_id?: number | null;
  sale_date: string;
  payment_method?: string;
  discount_percent?: number;
  paid_amount?: number;
  status?: string;
  notes?: string | null;
  items: SaleItemInput[];
}

export interface UpdateSaleInput {
  invoice_number?: string;
  customer_id?: number | null;
  sale_date?: string;
  payment_method?: string;
  discount_percent?: number;
  paid_amount?: number;
  status?: string;
  notes?: string | null;
  items?: SaleItemInput[];
}

export interface Sale {
  id: number;
  invoice_number: string;
  customer_id: number | null;
  created_by: number | null;
  updated_by: number | null;
  sale_date: string;
  payment_method: string;
  subtotal: string;
  discount_percent: string;
  total_amount: string;
  paid_amount: string;
  balance_amount: string;
  status: string;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface SaleItem {
  id: number;
  sale_id: number;
  product_id: number;
  quantity: string;
  unit_price: string;
  total_amount: string;
  created_at: Date;
}