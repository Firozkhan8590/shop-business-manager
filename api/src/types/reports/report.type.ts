/* ============================================================
   SALES REPORT TYPES
============================================================ */

export interface SalesReportFilters {
  from?: string;
  to?: string;
}

export interface SalesReportSummary {
  totalInvoices: number;
  subtotal: number;
  discountAmount: number;
  totalSales: number;
  paidAmount: number;
  balanceAmount: number;
}

export interface SalesReportItem {
  id: number;
  invoiceNumber: string;
  customerName: string | null;
  saleDate: string;
  paymentMethod: string;
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  status: string;
}

export interface SalesReportData {
  summary: SalesReportSummary;
  sales: SalesReportItem[];
}

/* ============================================================
   PURCHASE REPORT TYPES
============================================================ */

export interface PurchaseReportFilters {
  from?: string;
  to?: string;
}

export interface PurchaseReportSummary {
  totalInvoices: number;
  subtotal: number;
  discountAmount: number;
  totalPurchases: number;
  paidAmount: number;
  balanceAmount: number;
}

export interface PurchaseReportItem {
  id: number;
  purchaseNumber: string;
  supplierName: string | null;
  purchaseDate: string;
  paymentMethod: string;
  subtotal: number;
  discountPercent: number;
  discountAmount: number;
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  status: string;
}

export interface PurchaseReportData {
  summary: PurchaseReportSummary;
  purchases: PurchaseReportItem[];
}

/* ================================
   CUSTOMER PAYMENTS REPORT
================================ */

export interface CustomerPaymentsReportFilters {
  from?: string;
  to?: string;
}

export interface CustomerPaymentReportSummary {
  totalTransactions: number;
  totalPayments: number;
}

export interface CustomerPaymentReportItem {
  id: number;
  customerName: string | null;
  invoiceNumber: string | null;
  paymentDate: string;
  amount: number;
  paymentMethod: string;
  referenceNumber: string | null;
  notes: string | null;
}

export interface CustomerPaymentsReportData {
  summary: CustomerPaymentReportSummary;
  payments: CustomerPaymentReportItem[];
}

/* ================================
   SUPPLIER PAYMENTS REPORT
================================ */

export interface SupplierPaymentsReportFilters {
  from?: string;
  to?: string;
}

export interface SupplierPaymentReportSummary {
  totalTransactions: number;
  totalPayments: number;
}

export interface SupplierPaymentReportItem {
  id: number;
  supplierName: string | null;
  purchaseNumber: string | null;
  paymentDate: string;
  amount: number;
  paymentMethod: string;
  referenceNumber: string | null;
  notes: string | null;
}

export interface SupplierPaymentsReportData {
  summary: SupplierPaymentReportSummary;
  payments: SupplierPaymentReportItem[];
}

/* ================================
   OUTSTANDING REPORT
================================ */

export interface OutstandingReportFilters {
  type?: "customer" | "supplier" | "all";
}

export interface CustomerOutstandingReportItem {
  id: number;
  name: string;
  phone: string | null;
  openingBalance: number;
  outstandingSales: number;
  generalPayments: number;
  currentBalance: number;
}

export interface SupplierOutstandingReportItem {
  id: number;
  name: string;
  phone: string | null;
  openingBalance: number;
  outstandingPurchases: number;
  generalPayments: number;
  currentBalance: number;
}

export interface OutstandingReportSummary {
  totalCustomerOutstanding: number;
  totalSupplierOutstanding: number;
  netOutstanding: number;
}

export interface OutstandingReportData {
  summary: OutstandingReportSummary;
  customers: CustomerOutstandingReportItem[];
  suppliers: SupplierOutstandingReportItem[];
}

/* ================================
   PRODUCT SALES REPORT
================================ */

export interface ProductSalesReportFilters {
  from?: string;
  to?: string;
}

export interface ProductSalesReportItem {
  productId: number;
  productName: string;
  unit: string;
  totalQuantity: number;
  totalSales: number;
  invoiceCount: number;
}

export interface ProductSalesReportSummary {
  totalProducts: number;
  totalQuantity: number;
  totalSales: number;
}

export interface ProductSalesReportData {
  summary: ProductSalesReportSummary;
  products: ProductSalesReportItem[];
}

/* ================================
   PRODUCT PURCHASES REPORT
================================ */

export interface ProductPurchasesReportFilters {
  from?: string;
  to?: string;
}

export interface ProductPurchasesReportItem {
  productId: number;
  productName: string;
  unit: string;
  totalQuantity: number;
  totalPurchases: number;
  invoiceCount: number;
}

export interface ProductPurchasesReportSummary {
  totalProducts: number;
  totalQuantity: number;
  totalPurchases: number;
}

export interface ProductPurchasesReportData {
  summary: ProductPurchasesReportSummary;
  products: ProductPurchasesReportItem[];
}

/* ================================
   STOCK MOVEMENTS REPORT
================================ */

export interface StockMovementsReportFilters {
  from?: string;
  to?: string;
  productId?: number;
  movementType?: string;
}

export interface StockMovementReportItem {
  id: number;
  productId: number;
  productName: string;
  unit: string;
  movementType: string;
  quantity: number;
  stockAfter: number;
  saleId: number | null;
  purchaseId: number | null;
  saleInvoiceNumber: string | null;
  purchaseNumber: string | null;
  reason: string | null;
  createdBy: number | null;
  createdAt: string;
}

export interface StockMovementsReportSummary {
  totalMovements: number;
  totalIn: number;
  totalOut: number;
  netQuantity: number;
}

export interface StockMovementsReportData {
  summary: StockMovementsReportSummary;
  movements: StockMovementReportItem[];
}

export interface ExpenseReportFilters {
  from?: string;
  to?: string;
  category?: string;
  paymentMethod?: string;
}

export interface ExpenseReportSummary {
  totalTransactions: number;
  totalExpenses: number;
}

export interface ExpenseReportItem {
  id: number;
  category: string;
  description: string | null;
  amount: number;
  expenseDate: string;
  paymentMethod: string;
  notes: string | null;
}

export interface ExpenseReportData {
  summary: ExpenseReportSummary;
  expenses: ExpenseReportItem[];
}

/* ================================
   PROFIT REPORT
================================ */

export interface ProfitReportFilters {
  from?: string;
  to?: string;
}

export interface ProfitReportSummary {
  totalSales: number;
  estimatedCogs: number;
  grossProfit: number;
  totalExpenses: number;
  netProfit: number;
}

export interface ProfitReportData {
  summary: ProfitReportSummary;
}