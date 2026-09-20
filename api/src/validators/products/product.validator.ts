import { z } from "zod";

export const createProductSchema = z.object({
  category_id: z.number().int().positive().nullable().optional(),

  name: z
    .string()
    .trim()
    .min(1, "Product name is required")
    .max(200, "Product name must not exceed 200 characters"),

  sku: z
    .string()
    .trim()
    .max(100, "SKU must not exceed 100 characters")
    .nullable()
    .optional(),

  barcode: z
    .string()
    .trim()
    .max(100, "Barcode must not exceed 100 characters")
    .nullable()
    .optional(),

  unit: z
    .string()
    .trim()
    .min(1, "Unit is required")
    .max(30, "Unit must not exceed 30 characters")
    .optional(),

  purchase_price: z
    .number()
    .min(0, "Purchase price cannot be negative")
    .optional(),

  selling_price: z
    .number()
    .min(0, "Selling price cannot be negative")
    .optional(),

  current_stock: z
    .number()
    .min(0, "Current stock cannot be negative")
    .optional(),

  minimum_stock: z
    .number()
    .min(0, "Minimum stock cannot be negative")
    .optional(),

  image: z
    .string()
    .trim()
    .max(500, "Image path must not exceed 500 characters")
    .nullable()
    .optional(),
});

export const updateProductSchema = createProductSchema.partial();