import { z } from "zod";

const saleItemSchema = z.object({
  product_id: z
    .number()
    .int()
    .positive("Product ID must be valid"),

  quantity: z
    .number()
    .finite()
    .positive("Quantity must be greater than 0"),

  unit_price: z
    .number()
    .finite()
    .min(0, "Unit price cannot be negative"),
});

export const createSaleSchema = z.object({
  invoice_number: z
    .string()
    .trim()
    .min(1, "Invoice number is required")
    .max(
      50,
      "Invoice number must not exceed 50 characters"
    ),

  customer_id: z
    .number()
    .int()
    .positive()
    .nullable()
    .optional(),

  sale_date: z
    .string()
    .trim()
    .min(1, "Sale date is required"),

  payment_method: z
    .string()
    .trim()
    .min(1, "Payment method is required")
    .max(30)
    .default("cash"),

  discount_percent: z
    .number()
    .finite()
    .min(0, "Discount cannot be negative")
    .max(
      100,
      "Discount cannot exceed 100%"
    )
    .default(0),

  paid_amount: z
    .number()
    .finite()
    .min(
      0,
      "Paid amount cannot be negative"
    )
    .default(0),

  status: z
    .string()
    .trim()
    .min(1)
    .max(30)
    .default("completed"),

  notes: z
    .string()
    .trim()
    .nullable()
    .optional(),

  items: z
    .array(saleItemSchema)
    .min(
      1,
      "At least one sale item is required"
    ),
});

export const updateSaleSchema = z.object({
  invoice_number: z
    .string()
    .trim()
    .min(1, "Invoice number is required")
    .max(50)
    .optional(),

  customer_id: z
    .number()
    .int()
    .positive()
    .nullable()
    .optional(),

  sale_date: z
    .string()
    .trim()
    .min(1)
    .optional(),

  payment_method: z
    .string()
    .trim()
    .min(1)
    .max(30)
    .optional(),

  discount_percent: z
    .number()
    .finite()
    .min(0)
    .max(100)
    .optional(),

  paid_amount: z
    .number()
    .finite()
    .min(0)
    .optional(),

  status: z
    .string()
    .trim()
    .min(1)
    .max(30)
    .optional(),

  notes: z
    .string()
    .trim()
    .nullable()
    .optional(),

  items: z
    .array(saleItemSchema)
    .min(
      1,
      "At least one sale item is required"
    )
    .optional(),
});