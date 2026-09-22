import { z } from "zod";

export const createExpenseSchema = z.object({
  category: z
    .string()
    .trim()
    .min(1, "Category is required")
    .max(100, "Category must not exceed 100 characters"),

  description: z
    .string()
    .trim()
    .min(1, "Description is required")
    .max(255, "Description must not exceed 255 characters"),

  amount: z
    .number()
    .positive("Amount must be greater than 0"),

  expense_date: z
    .string()
    .regex(
      /^\d{4}-\d{2}-\d{2}$/,
      "Expense date must be in YYYY-MM-DD format"
    ),

  payment_method: z
    .string()
    .trim()
    .min(1, "Payment method is required")
    .max(30, "Payment method must not exceed 30 characters")
    .optional(),

  notes: z
    .string()
    .trim()
    .max(1000, "Notes must not exceed 1000 characters")
    .nullable()
    .optional(),
});

export const updateExpenseSchema = z.object({
  category: z
    .string()
    .trim()
    .min(1, "Category is required")
    .max(100, "Category must not exceed 100 characters")
    .optional(),

  description: z
    .string()
    .trim()
    .min(1, "Description is required")
    .max(255, "Description must not exceed 255 characters")
    .optional(),

  amount: z
    .number()
    .positive("Amount must be greater than 0")
    .optional(),

  expense_date: z
    .string()
    .regex(
      /^\d{4}-\d{2}-\d{2}$/,
      "Expense date must be in YYYY-MM-DD format"
    )
    .optional(),

  payment_method: z
    .string()
    .trim()
    .min(1, "Payment method is required")
    .max(30, "Payment method must not exceed 30 characters")
    .optional(),

  notes: z
    .string()
    .trim()
    .max(1000, "Notes must not exceed 1000 characters")
    .nullable()
    .optional(),
});

export const expenseListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),

  limit: z.coerce.number().int().min(1).max(100).default(20),

  search: z.string().trim().optional(),

  category: z.string().trim().optional(),

  payment_method: z.string().trim().optional(),

  start_date: z
    .string()
    .regex(
      /^\d{4}-\d{2}-\d{2}$/,
      "Start date must be in YYYY-MM-DD format"
    )
    .optional(),

  end_date: z
    .string()
    .regex(
      /^\d{4}-\d{2}-\d{2}$/,
      "End date must be in YYYY-MM-DD format"
    )
    .optional(),
});

export type CreateExpenseDTO = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseDTO = z.infer<typeof updateExpenseSchema>;
export type ExpenseListQueryDTO = z.infer<typeof expenseListQuerySchema>;