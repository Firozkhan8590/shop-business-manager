export interface Expense {
  id: number;
  category: string;
  description: string;
  amount: string;
  expense_date: string;
  payment_method: string;
  created_by: number | null;
  notes: string | null;
  created_at: string;
}

export interface CreateExpenseInput {
  category: string;
  description: string;
  amount: number;
  expense_date: string;
  payment_method?: string;
  notes?: string | null;
}

export interface UpdateExpenseInput {
  category?: string;
  description?: string;
  amount?: number;
  expense_date?: string;
  payment_method?: string;
  notes?: string | null;
}

export interface ExpenseListQuery {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  payment_method?: string;
  start_date?: string;
  end_date?: string;
}