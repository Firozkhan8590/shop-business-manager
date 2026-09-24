// src/lib/inventory.ts

const API_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:4000";

/* ============================================================
   TYPES
============================================================ */

export type StockMovementType =
    | "purchase"
    | "sale"
    | "adjustment"
    | "return"
    | "opening";

export interface InventoryItem {
    product_id: number;
    product_name: string;
    unit: string;
    current_stock: string;
    minimum_stock: string;
}

export interface StockMovement {
    id: number;
    product_id: number;
    product_name?: string;
    unit?: string;
    movement_type: StockMovementType;
    quantity: string;
    stock_after: string;
    sale_id: number | null;
    purchase_id: number | null;
    created_by: number | null;
    reason: string | null;
    created_at: string;
}

export interface InventoryListQuery {
    page?: number;
    limit?: number;
    search?: string;
    low_stock?: boolean;
    out_of_stock?: boolean;
}

export interface MovementListQuery {
    page?: number;
    limit?: number;
    movement_type?: StockMovementType;
    start_date?: string;
    end_date?: string;
}

export interface StockAdjustmentInput {
    product_id: number;
    quantity: number;
    reason: string;
}

export interface StockReturnInput {
    product_id: number;
    quantity: number;
    reason: string;
}

/* ============================================================
   RESPONSE TYPES
============================================================ */

export interface InventoryListResponse {
    success: boolean;
    message?: string;
    data: InventoryItem[];
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface ProductStockResponse {
    success: boolean;
    message?: string;
    data: InventoryItem;
}

export interface MovementListResponse {
    success: boolean;
    message?: string;
    data: StockMovement[];
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export interface StockActionResponse {
    success: boolean;
    message?: string;
    data?: any;
}

/* ============================================================
   AUTH HEADERS
============================================================ */

function getAuthHeaders(): HeadersInit {
    const token =
        typeof window !== "undefined"
            ? localStorage.getItem("token")
            : null;

    return {
        Authorization: `Bearer ${token}`,
    };
}

/* ============================================================
   GET INVENTORY
============================================================ */

export async function getInventory(
    query: InventoryListQuery = {}
): Promise<InventoryListResponse> {

    const params =
        new URLSearchParams();

    if (query.page !== undefined) {
        params.set(
            "page",
            String(query.page)
        );
    }

    if (query.limit !== undefined) {
        params.set(
            "limit",
            String(query.limit)
        );
    }

    if (query.search) {
        params.set(
            "search",
            query.search
        );
    }

    if (
        query.low_stock !==
        undefined
    ) {
        params.set(
            "low_stock",
            String(query.low_stock)
        );
    }

    if (
        query.out_of_stock !==
        undefined
    ) {
        params.set(
            "out_of_stock",
            String(query.out_of_stock)
        );
    }

    const queryString =
        params.toString();

    const response =
        await fetch(
            `${API_URL}/api/inventory${
                queryString
                    ? `?${queryString}`
                    : ""
            }`,
            {
                method: "GET",
                headers:
                    getAuthHeaders(),
            }
        );

    const result =
        await response.json();

    if (!response.ok || !result.success) {
        throw new Error(
            result.message ||
                "Failed to fetch inventory"
        );
    }

    return result;
}

/* ============================================================
   GET PRODUCT STOCK
============================================================ */

export async function getProductStock(
    productId: number
): Promise<ProductStockResponse> {

    const response =
        await fetch(
            `${API_URL}/api/inventory/${productId}`,
            {
                method: "GET",
                headers:
                    getAuthHeaders(),
            }
        );

    const result =
        await response.json();

    if (!response.ok || !result.success) {
        throw new Error(
            result.message ||
                "Failed to fetch product stock"
        );
    }

    return result;
}

/* ============================================================
   GET STOCK MOVEMENTS
============================================================ */

export async function getStockMovements(
    productId: number,
    query: MovementListQuery = {}
): Promise<MovementListResponse> {

    const params =
        new URLSearchParams();

    if (query.page !== undefined) {
        params.set(
            "page",
            String(query.page)
        );
    }

    if (query.limit !== undefined) {
        params.set(
            "limit",
            String(query.limit)
        );
    }

    if (query.movement_type) {
        params.set(
            "movement_type",
            query.movement_type
        );
    }

    if (query.start_date) {
        params.set(
            "start_date",
            query.start_date
        );
    }

    if (query.end_date) {
        params.set(
            "end_date",
            query.end_date
        );
    }

    const queryString =
        params.toString();

    const response =
        await fetch(
            `${API_URL}/api/inventory/${productId}/movements${
                queryString
                    ? `?${queryString}`
                    : ""
            }`,
            {
                method: "GET",
                headers:
                    getAuthHeaders(),
            }
        );

    const result =
        await response.json();

    if (!response.ok || !result.success) {
        throw new Error(
            result.message ||
                "Failed to fetch stock movements"
        );
    }

    return result;
}

/* ============================================================
   ADJUST STOCK
============================================================ */

export async function adjustStock(
    data: StockAdjustmentInput
): Promise<StockActionResponse> {

    const response =
        await fetch(
            `${API_URL}/api/inventory/adjustment`,
            {
                method: "POST",

                headers: {
                    ...getAuthHeaders(),
                    "Content-Type":
                        "application/json",
                },

                body: JSON.stringify(
                    data
                ),
            }
        );

    const result =
        await response.json();

    if (!response.ok || !result.success) {
        throw new Error(
            result.message ||
                "Failed to adjust stock"
        );
    }

    return result;
}

/* ============================================================
   ADD STOCK RETURN
============================================================ */

export async function addStockReturn(
    data: StockReturnInput
): Promise<StockActionResponse> {

    const response =
        await fetch(
            `${API_URL}/api/inventory/return`,
            {
                method: "POST",

                headers: {
                    ...getAuthHeaders(),
                    "Content-Type":
                        "application/json",
                },

                body: JSON.stringify(
                    data
                ),
            }
        );

    const result =
        await response.json();

    if (!response.ok || !result.success) {
        throw new Error(
            result.message ||
                "Failed to add stock return"
        );
    }

    return result;
}
