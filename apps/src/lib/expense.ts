const API_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:4000";

function getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem("token");

    return token
        ? {
            Authorization: `Bearer ${token}`,
        }
        : {};
}

// ==========================================
// EXPENSE TYPES
// ==========================================

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

// ==========================================
// EXPENSE SUMMARY
// Backend is the source of truth
// ==========================================

export interface ExpenseSummary {
    totalAmount: number;
    todayAmount: number;
    monthAmount: number;
    transactionCount: number;
}

// ==========================================
// API RESPONSE TYPES
// ==========================================

interface ExpensesResponse {
    success: boolean;
    message?: string;

    data?: Expense[];

    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };

    summary?: ExpenseSummary;
}

interface ExpenseResponse {
    success: boolean;
    message?: string;
    data?: Expense;
}

// ==========================================
// GET EXPENSES
// ==========================================

export async function getExpenses(
    query: ExpenseListQuery = {}
): Promise<ExpensesResponse> {

    const url = new URL(
        `${API_URL}/api/expenses`
    );

    if (query.page !== undefined) {
        url.searchParams.set(
            "page",
            String(query.page)
        );
    }

    if (query.limit !== undefined) {
        url.searchParams.set(
            "limit",
            String(query.limit)
        );
    }

    if (query.search?.trim()) {
        url.searchParams.set(
            "search",
            query.search.trim()
        );
    }

    if (query.category?.trim()) {
        url.searchParams.set(
            "category",
            query.category.trim()
        );
    }

    if (query.payment_method?.trim()) {
        url.searchParams.set(
            "payment_method",
            query.payment_method.trim()
        );
    }

    if (query.start_date) {
        url.searchParams.set(
            "start_date",
            query.start_date
        );
    }

    if (query.end_date) {
        url.searchParams.set(
            "end_date",
            query.end_date
        );
    }

    const response = await fetch(
        url.toString(),
        {
            method: "GET",

            headers: {
                ...getAuthHeaders(),
            },

            cache: "no-store",
        }
    );

    const result: ExpensesResponse =
        await response.json();

    if (
        !response.ok ||
        !result.success
    ) {
        throw new Error(
            result.message ||
            "Failed to fetch expenses"
        );
    }

    return result;
}

// ==========================================
// GET SINGLE EXPENSE
// ==========================================

export async function getExpense(
    id: number
): Promise<Expense> {

    const response = await fetch(
        `${API_URL}/api/expenses/${id}`,
        {
            method: "GET",

            headers: {
                ...getAuthHeaders(),
            },

            cache: "no-store",
        }
    );

    const result: ExpenseResponse =
        await response.json();

    if (
        !response.ok ||
        !result.success ||
        !result.data
    ) {
        throw new Error(
            result.message ||
            "Failed to fetch expense"
        );
    }

    return result.data;
}

// ==========================================
// CREATE EXPENSE
// ==========================================

export async function createExpense(
    data: CreateExpenseInput
): Promise<Expense> {

    const response = await fetch(
        `${API_URL}/api/expenses`,
        {
            method: "POST",

            headers: {
                "Content-Type":
                    "application/json",

                ...getAuthHeaders(),
            },

            body: JSON.stringify(data),
        }
    );

    const result: ExpenseResponse =
        await response.json();

    if (
        !response.ok ||
        !result.success ||
        !result.data
    ) {
        throw new Error(
            result.message ||
            "Failed to create expense"
        );
    }

    return result.data;
}

// ==========================================
// UPDATE EXPENSE
// ==========================================

export async function updateExpense(
    id: number,
    data: UpdateExpenseInput
): Promise<Expense> {

    const response = await fetch(
        `${API_URL}/api/expenses/${id}`,
        {
            method: "PUT",

            headers: {
                "Content-Type":
                    "application/json",

                ...getAuthHeaders(),
            },

            body: JSON.stringify(data),
        }
    );

    const result: ExpenseResponse =
        await response.json();

    if (
        !response.ok ||
        !result.success ||
        !result.data
    ) {
        throw new Error(
            result.message ||
            "Failed to update expense"
        );
    }

    return result.data;
}

// ==========================================
// DELETE EXPENSE
// ==========================================

export async function deleteExpense(
    id: number
): Promise<void> {

    const response = await fetch(
        `${API_URL}/api/expenses/${id}`,
        {
            method: "DELETE",

            headers: {
                ...getAuthHeaders(),
            },
        }
    );

    const result: ExpenseResponse =
        await response.json();

    if (
        !response.ok ||
        !result.success
    ) {
        throw new Error(
            result.message ||
            "Failed to delete expense"
        );
    }
}