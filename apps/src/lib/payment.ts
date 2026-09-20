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


/* =========================================================
   TYPES
========================================================= */

export type PaymentType =
  | "customer"
  | "supplier";

export interface CustomerPayment {
  id: number;
  payment_type: "customer";
  customer_id: number;
  customer_name: string | null;
  sale_id: number | null;
  invoice_no: string | null;
  payment_date: string;
  amount: string;
  payment_method: string;
  reference_number: string | null;
  notes: string | null;
  created_at: string;
}

export interface SupplierPayment {
  id: number;
  payment_type: "supplier";
  supplier_id: number;
  supplier_name: string | null;
  purchase_id: number | null;
  purchase_number: string | null;
  payment_date: string;
  amount: string;
  payment_method: string;
  reference_number: string | null;
  notes: string | null;
  created_at: string;
}

export type Payment =
  | CustomerPayment
  | SupplierPayment;


/* =========================================================
   CREATE CUSTOMER PAYMENT
========================================================= */

export interface CreateCustomerPaymentInput {
  customerId: number;
  saleId?: number | null;
  paymentDate: string;
  amount: number;
  paymentMethod: string;
  referenceNumber?: string | null;
  notes?: string | null;
}


/* =========================================================
   CREATE SUPPLIER PAYMENT
========================================================= */

export interface CreateSupplierPaymentInput {
  supplierId: number;
  purchaseId?: number | null;
  paymentDate: string;
  amount: number;
  paymentMethod: string;
  referenceNumber?: string | null;
  notes?: string | null;
}


/* =========================================================
   RESPONSE TYPES
========================================================= */

interface PaymentsResponse {
  success: boolean;
  message?: string;
  data?: Payment[];
}

interface PaymentResponse {
  success: boolean;
  message?: string;
  data?: CustomerPayment | SupplierPayment;
}


/* =========================================================
   GET ALL PAYMENTS
========================================================= */

export async function getPayments(
  date?: string
): Promise<Payment[]> {
  const url = new URL(
    `${API_URL}/api/payments`
  );

  if (date) {
    url.searchParams.set(
      "date",
      date
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

  const result: PaymentsResponse =
    await response.json();

  if (
    !response.ok ||
    !result.success
  ) {
    throw new Error(
      result.message ||
        "Failed to fetch payments"
    );
  }

  return result.data || [];
}


/* =========================================================
   GET CUSTOMER PAYMENTS
========================================================= */

export async function getCustomerPayments(
  date?: string
): Promise<CustomerPayment[]> {
  const url = new URL(
    `${API_URL}/api/payments/customer`
  );

  if (date) {
    url.searchParams.set(
      "date",
      date
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

  const result: PaymentsResponse =
    await response.json();

  if (
    !response.ok ||
    !result.success
  ) {
    throw new Error(
      result.message ||
        "Failed to fetch customer payments"
    );
  }

  return (result.data ||
    []) as CustomerPayment[];
}


/* =========================================================
   GET SUPPLIER PAYMENTS
========================================================= */

export async function getSupplierPayments(
  date?: string
): Promise<SupplierPayment[]> {
  const url = new URL(
    `${API_URL}/api/payments/supplier`
  );

  if (date) {
    url.searchParams.set(
      "date",
      date
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

  const result: PaymentsResponse =
    await response.json();

  if (
    !response.ok ||
    !result.success
  ) {
    throw new Error(
      result.message ||
        "Failed to fetch supplier payments"
    );
  }

  return (result.data ||
    []) as SupplierPayment[];
}


/* =========================================================
   CREATE CUSTOMER PAYMENT
========================================================= */

export async function createCustomerPayment(
  data: CreateCustomerPaymentInput
): Promise<CustomerPayment> {
  const response = await fetch(
    `${API_URL}/api/payments/customer`,
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

  const result: PaymentResponse =
    await response.json();

  if (
    !response.ok ||
    !result.success ||
    !result.data
  ) {
    throw new Error(
      result.message ||
        "Failed to create customer payment"
    );
  }

  return result.data as CustomerPayment;
}


/* =========================================================
   CREATE SUPPLIER PAYMENT
========================================================= */

export async function createSupplierPayment(
  data: CreateSupplierPaymentInput
): Promise<SupplierPayment> {
  const response = await fetch(
    `${API_URL}/api/payments/supplier`,
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

  const result: PaymentResponse =
    await response.json();

  if (
    !response.ok ||
    !result.success ||
    !result.data
  ) {
    throw new Error(
      result.message ||
        "Failed to create supplier payment"
    );
  }

  return result.data as SupplierPayment;
}