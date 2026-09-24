import { z } from "zod";

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

// ==========================================
// INVENTORY LIST
// ==========================================

export const inventoryListQuerySchema = z.object({
    page: z.coerce
        .number()
        .int()
        .min(1)
        .optional(),

    limit: z.coerce
        .number()
        .int()
        .min(1)
        .max(100)
        .optional(),

    search: z
        .string()
        .trim()
        .optional(),

    out_of_stock: z
        .enum(["true", "false"])
        .transform(
            (value) => value === "true"
        )
        .optional(),
});

// ==========================================
// MOVEMENT LIST
// ==========================================

export const movementListQuerySchema = z.object({
    page: z.coerce
        .number()
        .int()
        .min(1)
        .optional(),

    limit: z.coerce
        .number()
        .int()
        .min(1)
        .max(100)
        .optional(),

    movement_type: z.enum([
        "purchase",
        "sale",
        "adjustment",
        "return",
        "opening",
    ]).optional(),

    start_date: z
        .string()
        .regex(
            dateRegex,
            "Invalid start date"
        )
        .optional(),

    end_date: z
        .string()
        .regex(
            dateRegex,
            "Invalid end date"
        )
        .optional(),
});

// ==========================================
// OPENING STOCK
// ==========================================

export const openingStockSchema = z.object({
    product_id: z.coerce
        .number()
        .int()
        .positive(),

    quantity: z
        .number()
        .positive(),

    reason: z
        .string()
        .trim()
        .max(500)
        .nullable()
        .optional(),
});

// ==========================================
// STOCK ADJUSTMENT
// ==========================================

export const stockAdjustmentSchema = z.object({
    product_id: z.coerce
        .number()
        .int()
        .positive(),

    quantity: z
        .number()
        .refine(
            (value) => value !== 0,
            "Quantity cannot be zero"
        ),

    reason: z
        .string()
        .trim()
        .min(1, "Reason is required")
        .max(500),
});

// ==========================================
// STOCK RETURN
// ==========================================

export const stockReturnSchema = z.object({
    product_id: z.coerce
        .number()
        .int()
        .positive(),

    quantity: z
        .number()
        .positive(),

    reason: z
        .string()
        .trim()
        .min(1, "Reason is required")
        .max(500),
});

export type OpeningStockDTO =
    z.infer<typeof openingStockSchema>;

export type StockAdjustmentDTO =
    z.infer<typeof stockAdjustmentSchema>;

export type StockReturnDTO =
    z.infer<typeof stockReturnSchema>;