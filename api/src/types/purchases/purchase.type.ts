export interface PurchaseItemInput {
  product_id: number;
  quantity: number;
  unit_price: number;
}

export interface CreatePurchaseInput {
  purchase_number: string;
  supplier_id?: number | null;
  purchase_date: string;
  payment_method?: string;
  discount_percent?: number;
  paid_amount?: number;
  status?: string;
  notes?: string | null;
  items: PurchaseItemInput[];
}

export interface UpdatePurchaseInput {
  purchase_number?: string;
  supplier_id?: number | null;
  purchase_date?: string;
  payment_method?: string;
  discount_percent?: number;
  paid_amount?: number;
  status?: string;
  notes?: string | null;
  items?: PurchaseItemInput[];
}

export interface Purchase {
  id: number;
  purchase_number: string;
  supplier_id: number | null;
  created_by: number | null;
  updated_by: number | null;
  purchase_date: string;
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

export interface PurchaseItem {
  id: number;
  purchase_id: number;
  product_id: number;
  quantity: string;
  unit_price: string;
  total_amount: string;
  created_at: Date;
}