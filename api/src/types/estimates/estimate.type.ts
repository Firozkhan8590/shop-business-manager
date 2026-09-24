export type EstimateStatus =
    | "draft"
    | "sent"
    | "accepted"
    | "rejected"
    | "expired"
    | "converted";

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
}

export interface EstimateDetails extends Estimate {
    items: EstimateItem[];
}