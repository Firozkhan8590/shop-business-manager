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

export interface Customer {
  id: number;
  name: string;
  phone: string | null;
  address: string | null;

  opening_balance: string;

  // Balance details
  opening_balance_remaining?: string;
  sales_outstanding?: string;
  general_payments?: string;
  current_balance?: string;

  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateCustomerInput {
    name: string;
    phone?: string | null;
    address?: string | null;
    opening_balance?: number;
    notes?: string | null;
}

export interface UpdateCustomerInput {
    name?: string;
    phone?: string | null;
    address?: string | null;
    opening_balance?: number;
    notes?: string | null;
}

interface CustomersResponse {
    success: boolean;
    message?: string;
    data?: Customer[];
}

interface CustomerResponse {
    success: boolean;
    message?: string;
    data?: Customer;
}

export async function getCustomers(
    search?: string
): Promise<Customer[]> {
    const url = new URL(
        `${API_URL}/api/customers`
    );

    if (search?.trim()) {
        url.searchParams.set(
            "search",
            search.trim()
        );
    }

    const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
            ...getAuthHeaders(),
        },
        cache: "no-store",
    });

    const result: CustomersResponse =
        await response.json();

    if (!response.ok || !result.success) {
        throw new Error(
            result.message ||
            "Failed to fetch customers"
        );
    }

    return result.data || [];
}

export async function getCustomer(
    id: number
): Promise<Customer> {
    const response = await fetch(
        `${API_URL}/api/customers/${id}`,
        {
            method: "GET",
            headers: {
                ...getAuthHeaders(),
            },
            cache: "no-store",
        }
    );

    const result: CustomerResponse =
        await response.json();

    if (
        !response.ok ||
        !result.success ||
        !result.data
    ) {
        throw new Error(
            result.message ||
            "Failed to fetch customer"
        );
    }

    return result.data;
}

export async function createCustomer(
    data: CreateCustomerInput
): Promise<Customer> {
    const response = await fetch(
        `${API_URL}/api/customers`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...getAuthHeaders(),
            },
            body: JSON.stringify(data),
        }
    );

    const result: CustomerResponse =
        await response.json();

    if (
        !response.ok ||
        !result.success ||
        !result.data
    ) {
        throw new Error(
            result.message ||
            "Failed to create customer"
        );
    }

    return result.data;
}

export async function updateCustomer(
    id: number,
    data: UpdateCustomerInput
): Promise<Customer> {
    const response = await fetch(
        `${API_URL}/api/customers/${id}`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                ...getAuthHeaders(),
            },
            body: JSON.stringify(data),
        }
    );

    const result: CustomerResponse =
        await response.json();

    if (
        !response.ok ||
        !result.success ||
        !result.data
    ) {
        throw new Error(
            result.message ||
            "Failed to update customer"
        );
    }

    return result.data;
}

export async function deactivateCustomer(
    id: number
): Promise<Customer> {
    const response = await fetch(
        `${API_URL}/api/customers/${id}/deactivate`,
        {
            method: "PATCH",
            headers: {
                ...getAuthHeaders(),
            },
        }
    );

    const result: CustomerResponse =
        await response.json();

    if (
        !response.ok ||
        !result.success ||
        !result.data
    ) {
        throw new Error(
            result.message ||
            "Failed to deactivate customer"
        );
    }

    return result.data;
}