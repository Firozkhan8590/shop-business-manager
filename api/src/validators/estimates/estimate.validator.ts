import { z } from "zod";

// ==========================================
// DATE VALIDATION
// ==========================================

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

// ==========================================
// ESTIMATE ITEM
// ==========================================

const estimateItemSchema = z.object({
    product_id: z.coerce
        .number()
        .int()
        .positive(),

    quantity: z.coerce
        .number()
        .positive(),

    unit_price: z.coerce
        .number()
        .min(0),
});

// ==========================================
// CREATE ESTIMATE
// ==========================================

export const createEstimateSchema = z.object({
    estimate_number: z
        .string()
        .trim()
        .min(1, "Estimate number is required")
        .max(50),

    customer_id: z
        .coerce
        .number()
        .int()
        .positive()
        .nullable()
        .optional(),

    estimate_date: z
        .string()
        .regex(
            dateRegex,
            "Invalid estimate date"
        ),

    valid_until: z
        .string()
        .regex(
            dateRegex,
            "Invalid valid until date"
        )
        .nullable()
        .optional(),

    discount_percent: z
        .coerce
        .number()
        .min(
            0,
            "Discount cannot be negative"
        )
        .max(
            100,
            "Discount cannot exceed 100%"
        )
        .optional(),

    status: z
        .enum([
            "draft",
            "sent",
            "accepted",
            "rejected",
            "expired",
            "converted",
        ])
        .optional(),

    notes: z
        .string()
        .trim()
        .max(
            2000,
            "Notes cannot exceed 2000 characters"
        )
        .nullable()
        .optional(),

    items: z
        .array(estimateItemSchema)
        .min(
            1,
            "At least one item is required"
        ),
});

// ==========================================
// UPDATE ESTIMATE
// ==========================================

export const updateEstimateSchema =
    createEstimateSchema.partial();

// ==========================================
// LIST ESTIMATES
// ==========================================

export const estimateListQuerySchema =
    z.object({
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

        status: z
            .enum([
                "draft",
                "sent",
                "accepted",
                "rejected",
                "expired",
                "converted",
            ])
            .optional(),

        customer_id: z.coerce
            .number()
            .int()
            .positive()
            .optional(),
    });