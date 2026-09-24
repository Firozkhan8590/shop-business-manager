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
    movement_type: StockMovementType;
    quantity: string;
    stock_after: string;
    sale_id: number | null;
    purchase_id: number | null;
    created_by: number | null;
    reason: string | null;
    created_at: string;
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