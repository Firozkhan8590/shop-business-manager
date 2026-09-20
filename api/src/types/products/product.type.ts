export interface Product {
  id: number;
  category_id: number | null;
  name: string;
  sku: string | null;
  barcode: string | null;
  unit: string;
  purchase_price: string;
  selling_price: string;
  current_stock: string;
  minimum_stock: string;
  image: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateProductInput {
  category_id?: number | null;
  name: string;
  sku?: string | null;
  barcode?: string | null;
  unit?: string;
  purchase_price?: number;
  selling_price?: number;
  current_stock?: number;
  minimum_stock?: number;
  image?: string | null;
}

export interface UpdateProductInput {
  category_id?: number | null;
  name?: string;
  sku?: string | null;
  barcode?: string | null;
  unit?: string;
  purchase_price?: number;
  selling_price?: number;
  current_stock?: number;
  minimum_stock?: number;
  image?: string | null;
}