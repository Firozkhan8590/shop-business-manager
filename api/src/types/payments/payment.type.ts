export type PaymentType = "customer" | "supplier";

export interface CreateCustomerPaymentDto {
  customerId: number;
  saleId?: number | null;
  paymentDate: string;
  amount: number;
  paymentMethod: string;
  referenceNumber?: string | null;
  notes?: string | null;
}

export interface CreateSupplierPaymentDto {
  supplierId: number;
  purchaseId?: number | null;
  paymentDate: string;
  amount: number;
  paymentMethod: string;
  referenceNumber?: string | null;
  notes?: string | null;
}

export interface CreatePaymentDto {
  paymentType: PaymentType;

  customerId?: number;
  saleId?: number | null;

  supplierId?: number;
  purchaseId?: number | null;

  paymentDate: string;
  amount: number;
  paymentMethod: string;
  referenceNumber?: string | null;
  notes?: string | null;
}