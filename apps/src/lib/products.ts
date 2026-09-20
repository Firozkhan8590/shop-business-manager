const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem("token");

  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
}

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
  created_at: string;
  updated_at: string;
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

interface ProductsResponse {
  success: boolean;
  message?: string;
  data?: Product[];
}

interface ProductResponse {
  success: boolean;
  message?: string;
  data?: Product;
}

export async function getProducts(): Promise<Product[]> {
  const response = await fetch(`${API_URL}/api/products`, {
    method: "GET",
    headers: {
      ...getAuthHeaders(),
    },
    cache: "no-store",
  });

  const result: ProductsResponse = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Failed to fetch products");
  }

  return result.data || [];
}

export async function getProduct(id: number): Promise<Product> {
  const response = await fetch(`${API_URL}/api/products/${id}`, {
    method: "GET",
    headers: {
      ...getAuthHeaders(),
    },
    cache: "no-store",
  });

  const result: ProductResponse = await response.json();

  if (!response.ok || !result.success || !result.data) {
    throw new Error(result.message || "Failed to fetch product");
  }

  return result.data;
}

export async function createProduct(
  data: CreateProductInput
): Promise<Product> {
  const response = await fetch(`${API_URL}/api/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(data),
  });

  const result: ProductResponse = await response.json();

  if (!response.ok || !result.success || !result.data) {
    throw new Error(result.message || "Failed to create product");
  }

  return result.data;
}

export async function updateProduct(
  id: number,
  data: UpdateProductInput
): Promise<Product> {
  const response = await fetch(`${API_URL}/api/products/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(data),
  });

  const result: ProductResponse = await response.json();

  if (!response.ok || !result.success || !result.data) {
    throw new Error(result.message || "Failed to update product");
  }

  return result.data;
}

export async function deactivateProduct(
  id: number
): Promise<Product> {
  const response = await fetch(
    `${API_URL}/api/products/${id}/deactivate`,
    {
      method: "PATCH",
      headers: {
        ...getAuthHeaders(),
      },
    }
  );

  const result: ProductResponse = await response.json();

  if (!response.ok || !result.success || !result.data) {
    throw new Error(
      result.message || "Failed to deactivate product"
    );
  }

  return result.data;
}