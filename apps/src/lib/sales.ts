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

export interface SaleItem {
    id: number;
    sale_id: number;
    product_id: number;
    quantity: string;
    unit_price: string;
    total_amount: string;
    created_at: string;
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
    created_at: string;
    updated_at: string;
    customer_name?: string | null;
}

export interface SaleDetails
    extends Sale {
    items: SaleItem[];
}

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

// ==========================================
// RESPONSE TYPES
// ==========================================

interface SalesResponse {
    success: boolean;
    message?: string;
    data?: Sale[];
}

interface SaleResponse {
    success: boolean;
    message?: string;
    data?: SaleDetails;
}

// ==========================================
// GET ALL SALES
// ==========================================

export async function getSales(
    date?: string
): Promise<Sale[]> {
    const url = new URL(
        `${API_URL}/api/sales`
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

    const result: SalesResponse =
        await response.json();

    if (
        !response.ok ||
        !result.success
    ) {
        throw new Error(
            result.message ||
            "Failed to fetch sales"
        );
    }

    return result.data || [];
}
// ==========================================
// GET SALE BY ID
// ==========================================

export async function getSale(
    id: number
): Promise<SaleDetails> {
    const response = await fetch(
        `${API_URL}/api/sales/${id}`,
        {
            method: "GET",
            headers: {
                ...getAuthHeaders(),
            },
            cache: "no-store",
        }
    );

    const result: SaleResponse =
        await response.json();

    if (
        !response.ok ||
        !result.success ||
        !result.data
    ) {
        throw new Error(
            result.message ||
            "Failed to fetch sale"
        );
    }

    return result.data;
}

// ==========================================
// CREATE SALE
// ==========================================

export async function createSale(
    data: CreateSaleInput
): Promise<SaleDetails> {
    const response = await fetch(
        `${API_URL}/api/sales`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...getAuthHeaders(),
            },
            body: JSON.stringify(data),
        }
    );

    const result: SaleResponse =
        await response.json();

    if (
        !response.ok ||
        !result.success ||
        !result.data
    ) {
        throw new Error(
            result.message ||
            "Failed to create sale"
        );
    }

    return result.data;
}

// ==========================================
// UPDATE SALE
// ==========================================

export async function updateSale(
    id: number,
    data: UpdateSaleInput
): Promise<SaleDetails> {
    const response = await fetch(
        `${API_URL}/api/sales/${id}`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                ...getAuthHeaders(),
            },
            body: JSON.stringify(data),
        }
    );

    const result: SaleResponse =
        await response.json();

    if (
        !response.ok ||
        !result.success ||
        !result.data
    ) {
        throw new Error(
            result.message ||
            "Failed to update sale"
        );
    }

    return result.data;
}

// ==========================================
// GET NEXT INVOICE NUMBER
// ==========================================

export async function getNextInvoiceNumber(): Promise<string> {
    const response = await fetch(
        `${API_URL}/api/sales/next-number`,
        {
            method: "GET",
            headers: getAuthHeaders(),
        }
    );

    const result =
        await response.json();

    if (
        !response.ok ||
        !result.success
    ) {
        throw new Error(
            result.message ||
            "Failed to generate invoice number"
        );
    }

    return result.data.invoice_number;
}