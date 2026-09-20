import { z } from "zod";

export const createSupplierSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Supplier name is required")
    .max(200, "Supplier name must not exceed 200 characters"),

  phone: z
    .string()
    .trim()
    .max(30, "Phone must not exceed 30 characters")
    .optional()
    .nullable(),

  address: z
    .string()
    .trim()
    .optional()
    .nullable(),

  opening_balance: z
    .number()
    .finite()
    .default(0),

  notes: z
    .string()
    .trim()
    .optional()
    .nullable(),

  is_active: z
    .boolean()
    .default(true),
});

export const updateSupplierSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Supplier name is required")
    .max(200, "Supplier name must not exceed 200 characters")
    .optional(),

  phone: z
    .string()
    .trim()
    .max(30, "Phone must not exceed 30 characters")
    .optional()
    .nullable(),

  address: z
    .string()
    .trim()
    .optional()
    .nullable(),

  opening_balance: z
    .number()
    .finite()
    .optional(),

  notes: z
    .string()
    .trim()
    .optional()
    .nullable(),

  is_active: z
    .boolean()
    .optional(),
});