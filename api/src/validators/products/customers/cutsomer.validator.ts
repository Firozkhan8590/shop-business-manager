import { z } from "zod";

export const createCustomerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Customer name is required")
    .max(200, "Customer name must not exceed 200 characters"),

  phone: z
    .string()
    .trim()
    .max(30, "Phone number must not exceed 30 characters")
    .nullable()
    .optional(),

  address: z
    .string()
    .trim()
    .nullable()
    .optional(),

  opening_balance: z
    .number()
    .min(0, "Opening balance cannot be negative")
    .optional(),

  notes: z
    .string()
    .trim()
    .nullable()
    .optional(),
});

export const updateCustomerSchema =
  createCustomerSchema.partial();