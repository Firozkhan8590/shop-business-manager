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

/* ============================================================
   SUPPLIER
============================================================ */

export interface Supplier {
    id: number;

    name: string;
    phone: string | null;
    address: string | null;

    /* Original opening balance */
    opening_balance: string;

    /* Balance details */
    purchases_outstanding?: string;
    general_payments?: string;
    opening_balance_remaining?: string;
    current_balance?: string;

    notes: string | null;
    is_active: boolean;

    created_at: string;
    updated_at: string;
}

/* ============================================================
   CREATE SUPPLIER INPUT
============================================================ */

export interface CreateSupplierInput {
    name: string;
    phone?: string | null;
    address?: string | null;

    opening_balance?: number;

    notes?: string | null;
    is_active?: boolean;
}

/* ============================================================
   UPDATE SUPPLIER INPUT
============================================================ */

export interface UpdateSupplierInput {
    name?: string;
    phone?: string | null;
    address?: string | null;

    opening_balance?: number;

    notes?: string | null;
    is_active?: boolean;
}

/* ============================================================
   API RESPONSE TYPES
============================================================ */

interface SuppliersResponse {
    success: boolean;
    message?: string;
    data?: Supplier[];
}

interface SupplierResponse {
    success: boolean;
    message?: string;
    data?: Supplier;
}

/* ============================================================
   GET SUPPLIERS
============================================================ */

export async function getSuppliers(
    search?: string
): Promise<Supplier[]> {
    const url = new URL(
        `${API_URL}/api/suppliers`
    );

    if (search?.trim()) {
        url.searchParams.set(
            "search",
            search.trim()
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

    const result: SuppliersResponse =
        await response.json();

    if (
        !response.ok ||
        !result.success
    ) {
        throw new Error(
            result.message ||
                "Failed to fetch suppliers"
        );
    }

    return result.data || [];
}

/* ============================================================
   GET SUPPLIER BY ID
============================================================ */

export async function getSupplier(
    id: number
): Promise<Supplier> {
    const response = await fetch(
        `${API_URL}/api/suppliers/${id}`,
        {
            method: "GET",

            headers: {
                ...getAuthHeaders(),
            },

            cache: "no-store",
        }
    );

    const result: SupplierResponse =
        await response.json();

    if (
        !response.ok ||
        !result.success ||
        !result.data
    ) {
        throw new Error(
            result.message ||
                "Failed to fetch supplier"
        );
    }

    return result.data;
}

/* ============================================================
   CREATE SUPPLIER
============================================================ */

export async function createSupplier(
    data: CreateSupplierInput
): Promise<Supplier> {
    const response = await fetch(
        `${API_URL}/api/suppliers`,
        {
            method: "POST",

            headers: {
                "Content-Type":
                    "application/json",

                ...getAuthHeaders(),
            },

            body: JSON.stringify(data),
        }
    );

    const result: SupplierResponse =
        await response.json();

    if (
        !response.ok ||
        !result.success ||
        !result.data
    ) {
        throw new Error(
            result.message ||
                "Failed to create supplier"
        );
    }

    return result.data;
}

/* ============================================================
   UPDATE SUPPLIER
============================================================ */

export async function updateSupplier(
    id: number,
    data: UpdateSupplierInput
): Promise<Supplier> {
    const response = await fetch(
        `${API_URL}/api/suppliers/${id}`,
        {
            method: "PUT",

            headers: {
                "Content-Type":
                    "application/json",

                ...getAuthHeaders(),
            },

            body: JSON.stringify(data),
        }
    );

    const result: SupplierResponse =
        await response.json();

    if (
        !response.ok ||
        !result.success ||
        !result.data
    ) {
        throw new Error(
            result.message ||
                "Failed to update supplier"
        );
    }

    return result.data;
}

/* ============================================================
   DEACTIVATE SUPPLIER
============================================================ */

export async function deactivateSupplier(
    id: number
): Promise<Supplier> {
    const response = await fetch(
        `${API_URL}/api/suppliers/${id}/deactivate`,
        {
            method: "PATCH",

            headers: {
                ...getAuthHeaders(),
            },
        }
    );

    const result: SupplierResponse =
        await response.json();

    if (
        !response.ok ||
        !result.success ||
        !result.data
    ) {
        throw new Error(
            result.message ||
                "Failed to deactivate supplier"
        );
    }

    return result.data;
}