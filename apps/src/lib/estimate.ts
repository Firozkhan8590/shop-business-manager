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

/* =========================
   TYPES
========================= */

export type EstimateStatus =
    | "draft"
    | "sent"
    | "accepted"
    | "rejected"
    | "expired"
    | "converted";

export interface EstimateItem {
    id: number;
    estimate_id: number;
    product_id: number;
    quantity: string;
    unit_price: string;
    total_amount: string;
    created_at: string;
}

export interface Estimate {
    id: number;
    estimate_number: string;

    customer_id: number | null;

    created_by: number | null;
    updated_by: number | null;

    estimate_date: string;
    valid_until: string | null;

    subtotal: string;
    discount_percent: string;
    total_amount: string;

    status: EstimateStatus;

    notes: string | null;

    created_at: string;
    updated_at: string;

    // Customer details if returned by backend
    customer_name?: string | null;
    customer_phone?: string | null;
}

export interface EstimateDetails extends Estimate {
    items: EstimateItem[];
}

export interface EstimateItemInput {
    product_id: number;
    quantity: number;
    unit_price: number;
}

export interface CreateEstimateInput {
    estimate_number: string;
    customer_id?: number | null;
    estimate_date: string;
    valid_until?: string | null;
    discount_percent?: number;
    status?: EstimateStatus;
    notes?: string | null;
    items: EstimateItemInput[];
}

export interface UpdateEstimateInput {
    estimate_number?: string;
    customer_id?: number | null;
    estimate_date?: string;
    valid_until?: string | null;
    discount_percent?: number;
    status?: EstimateStatus;
    notes?: string | null;
    items?: EstimateItemInput[];
}

/* =========================
   RESPONSE TYPES
========================= */

interface EstimatesResponse {
    success: boolean;
    message?: string;
    data?: Estimate[];
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

interface EstimateResponse {
    success: boolean;
    message?: string;
    data?: Estimate;
}

interface EstimateDetailsResponse {
    success: boolean;
    message?: string;
    data?: EstimateDetails;
}

interface NextEstimateNumberResponse {
    success: boolean;
    message?: string;
    data?: string;
}

/* =========================
   GET NEXT ESTIMATE NUMBER
========================= */

export async function getNextEstimateNumber(): Promise<string> {
    const response = await fetch(
        `${API_URL}/api/estimates/next-number`,
        {
            method: "GET",
            headers: {
                ...getAuthHeaders(),
            },
            cache: "no-store",
        }
    );

    const result: {
        success: boolean;
        message?: string;
        data?: {
            estimate_number?: string;
        };
    } = await response.json();

    if (
        !response.ok ||
        !result.success ||
        !result.data?.estimate_number
    ) {
        throw new Error(
            result.message ||
            "Failed to get next estimate number"
        );
    }

    return result.data.estimate_number;
}

/* =========================
   GET ESTIMATES
========================= */

export async function getEstimates(
    page: number = 1,
    limit: number = 10,
    search?: string,
    status?: EstimateStatus,
    customerId?: number
): Promise<EstimatesResponse> {
    const url = new URL(
        `${API_URL}/api/estimates`
    );

    url.searchParams.set(
        "page",
        page.toString()
    );

    url.searchParams.set(
        "limit",
        limit.toString()
    );

    if (search?.trim()) {
        url.searchParams.set(
            "search",
            search.trim()
        );
    }

    if (status) {
        url.searchParams.set(
            "status",
            status
        );
    }

    if (customerId) {
        url.searchParams.set(
            "customer_id",
            customerId.toString()
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

    const result: EstimatesResponse =
        await response.json();

    if (
        !response.ok ||
        !result.success
    ) {
        throw new Error(
            result.message ||
            "Failed to fetch estimates"
        );
    }

    return result;
}

/* =========================
   GET ESTIMATE DETAILS
========================= */

export async function getEstimate(
    id: number
): Promise<EstimateDetails> {
    const response = await fetch(
        `${API_URL}/api/estimates/${id}`,
        {
            method: "GET",
            headers: {
                ...getAuthHeaders(),
            },
            cache: "no-store",
        }
    );

    const result: EstimateDetailsResponse =
        await response.json();

    if (
        !response.ok ||
        !result.success ||
        !result.data
    ) {
        throw new Error(
            result.message ||
            "Failed to fetch estimate"
        );
    }

    return result.data;
}

/* =========================
   CREATE ESTIMATE
========================= */

export async function createEstimate(
    data: CreateEstimateInput
): Promise<Estimate> {
    const response = await fetch(
        `${API_URL}/api/estimates`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...getAuthHeaders(),
            },
            body: JSON.stringify(data),
        }
    );

    const result: EstimateResponse =
        await response.json();

    if (
        !response.ok ||
        !result.success ||
        !result.data
    ) {
        throw new Error(
            result.message ||
            "Failed to create estimate"
        );
    }

    return result.data;
}

/* =========================
   UPDATE ESTIMATE
========================= */

export async function updateEstimate(
    id: number,
    data: UpdateEstimateInput
): Promise<Estimate> {
    const response = await fetch(
        `${API_URL}/api/estimates/${id}`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                ...getAuthHeaders(),
            },
            body: JSON.stringify(data),
        }
    );

    const result: EstimateResponse =
        await response.json();

    if (
        !response.ok ||
        !result.success ||
        !result.data
    ) {
        throw new Error(
            result.message ||
            "Failed to update estimate"
        );
    }

    return result.data;
}

/* =========================
   DELETE ESTIMATE
========================= */

export async function deleteEstimate(
    id: number
): Promise<void> {
    const response = await fetch(
        `${API_URL}/api/estimates/${id}`,
        {
            method: "DELETE",
            headers: {
                ...getAuthHeaders(),
            },
        }
    );

    const result: {
        success: boolean;
        message?: string;
    } = await response.json();

    if (
        !response.ok ||
        !result.success
    ) {
        throw new Error(
            result.message ||
            "Failed to delete estimate"
        );
    }
}