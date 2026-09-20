
const API_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:4000";

function getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem("token");

    return token
        ? {
            Authorization: `Bearer ${token}`,
        }
        : {};
}

// ==========================================
// TYPES
// ==========================================

export interface PurchaseItem {
    id: number;
    purchase_id: number;
    product_id: number;
    quantity: string;
    unit_price: string;
    total_amount: string;
    created_at: string;
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
    created_at: string;
    updated_at: string;
}

export interface PurchaseDetails
    extends Purchase {
    items: PurchaseItem[];
}

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

// ==========================================
// RESPONSE TYPES
// ==========================================

interface PurchasesResponse {
    success: boolean;
    message?: string;
    data?: Purchase[];
}

interface PurchaseResponse {
    success: boolean;
    message?: string;
    data?: PurchaseDetails;
}

// ==========================================
// GET PURCHASES
// ==========================================

export async function getPurchases(
    date?: string
): Promise<Purchase[]> {
    const url = new URL(
        `${API_URL}/api/purchases`
    );

    if (date) {
        url.searchParams.set(
            "date",
            date
        );
    }

    const response = await fetch(
        url.toString(),
        {
            method: "GET",
            headers: {
                ...getAuthHeaders(),
            },
            cache: "no-store",
        }
    );

    const result: PurchasesResponse =
        await response.json();

    if (
        !response.ok ||
        !result.success
    ) {
        throw new Error(
            result.message ||
            "Failed to fetch purchases"
        );
    }

    return result.data || [];
}
// ==========================================
// GET PURCHASE BY ID
// ==========================================

export async function getPurchase(
    id: number
): Promise<PurchaseDetails> {
    const response = await fetch(
        `${API_URL}/api/purchases/${id}`,
        {
            method: "GET",
            headers: {
                ...getAuthHeaders(),
            },
            cache: "no-store",
        }
    );

    const result: PurchaseResponse =
        await response.json();

    if (
        !response.ok ||
        !result.success ||
        !result.data
    ) {
        throw new Error(
            result.message ||
            "Failed to fetch purchase"
        );
    }

    return result.data;
}

// ==========================================
// CREATE PURCHASE
// ==========================================

export async function createPurchase(
    data: CreatePurchaseInput
): Promise<PurchaseDetails> {
    const response = await fetch(
        `${API_URL}/api/purchases`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...getAuthHeaders(),
            },
            body: JSON.stringify(data),
        }
    );

    const result: PurchaseResponse =
        await response.json();

    if (
        !response.ok ||
        !result.success ||
        !result.data
    ) {
        throw new Error(
            result.message ||
            "Failed to create purchase"
        );
    }

    return result.data;
}

// ==========================================
// UPDATE PURCHASE
// ==========================================

export async function updatePurchase(
    id: number,
    data: UpdatePurchaseInput
): Promise<PurchaseDetails> {
    const response = await fetch(
        `${API_URL}/api/purchases/${id}`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                ...getAuthHeaders(),
            },
            body: JSON.stringify(data),
        }
    );

    const result: PurchaseResponse =
        await response.json();

    if (
        !response.ok ||
        !result.success ||
        !result.data
    ) {
        throw new Error(
            result.message ||
            "Failed to update purchase"
        );
    }

    return result.data;
}

export async function getNextPurchaseNumber(): Promise<string> {
  const response = await fetch(
    `${API_URL}/api/purchases/next-number`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(
      result.message || "Failed to generate purchase number"
    );
  }

  return result.data.purchase_number;
}