import db from "../../config/database";

import {
  SalesReportFilters,
  SalesReportData,
  SalesReportItem,
  PurchaseReportFilters,
  PurchaseReportData,
  PurchaseReportItem,
  CustomerPaymentReportSummary,
  CustomerPaymentReportItem,
  CustomerPaymentsReportFilters,
  CustomerPaymentsReportData,
  SupplierPaymentReportSummary,
  SupplierPaymentReportItem,
  SupplierPaymentsReportFilters,
  SupplierPaymentsReportData,
  OutstandingReportSummary,
  SupplierOutstandingReportItem,
  CustomerOutstandingReportItem,
  OutstandingReportData,
  ProductSalesReportSummary,
  ProductSalesReportItem,
  ProductSalesReportFilters,
  ProductSalesReportData,
  ProductPurchasesReportSummary,
  ProductPurchasesReportItem,
  ProductPurchasesReportData,
  ProductPurchasesReportFilters,
  StockMovementsReportSummary,
  StockMovementReportItem,
  StockMovementsReportData,
  StockMovementsReportFilters,
  ProfitReportFilters,
  ProfitReportData,
} from "../../types/reports/report.type";

/* ============================================================
   HELPERS
============================================================ */

function formatNumber(value: unknown): number {
  return Number(Number(value ?? 0).toFixed(2));
}

/* ============================================================
   SALES REPORT
============================================================ */

export async function getSalesReport(
  filters: SalesReportFilters
): Promise<SalesReportData> {
  const query = db("sales as s")
    .leftJoin(
      "customers as c",
      "s.customer_id",
      "c.id"
    )
    .where(
      "s.status",
      "completed"
    );

  /* ---------------- DATE FILTER ---------------- */

  if (filters.from) {
    query.where(
      "s.sale_date",
      ">=",
      filters.from
    );
  }

  if (filters.to) {
    query.where(
      "s.sale_date",
      "<=",
      filters.to
    );
  }

  /* ---------------- FETCH SALES ---------------- */

  const rows = await query
    .select(
      "s.id",
      "s.invoice_number",
      "c.name as customer_name",
      db.raw("TO_CHAR(s.sale_date, 'YYYY-MM-DD') as sale_date"),
      "s.payment_method",
      "s.subtotal",
      "s.discount_percent",
      "s.total_amount",
      "s.paid_amount",
      "s.balance_amount",
      "s.status"
    )
    .orderBy(
      "s.sale_date",
      "desc"
    )
    .orderBy(
      "s.id",
      "desc"
    );

  /* ---------------- FORMAT SALES ---------------- */

  const sales: SalesReportItem[] =
    rows.map((sale: any) => {
      const subtotal =
        Number(sale.subtotal ?? 0);

      const discountPercent =
        Number(
          sale.discount_percent ?? 0
        );

      const discountAmount =
        subtotal *
        (discountPercent / 100);

      return {
        id: Number(sale.id),

        invoiceNumber:
          String(sale.invoice_number),

        customerName:
          sale.customer_name ?? null,

        saleDate:
          String(sale.sale_date),

        paymentMethod:
          String(sale.payment_method),

        subtotal:
          formatNumber(subtotal),

        discountPercent:
          formatNumber(discountPercent),

        discountAmount:
          formatNumber(discountAmount),

        totalAmount:
          formatNumber(
            sale.total_amount
          ),

        paidAmount:
          formatNumber(
            sale.paid_amount
          ),

        balanceAmount:
          formatNumber(
            sale.balance_amount
          ),

        status:
          String(sale.status),
      };
    });

  /* ---------------- SUMMARY ---------------- */

  const summary =
    sales.reduce(
      (result, sale) => {
        result.totalInvoices += 1;

        result.subtotal +=
          sale.subtotal;

        result.discountAmount +=
          sale.discountAmount;

        result.totalSales +=
          sale.totalAmount;

        result.paidAmount +=
          sale.paidAmount;

        result.balanceAmount +=
          sale.balanceAmount;

        return result;
      },
      {
        totalInvoices: 0,
        subtotal: 0,
        discountAmount: 0,
        totalSales: 0,
        paidAmount: 0,
        balanceAmount: 0,
      }
    );

  return {
    summary: {
      totalInvoices:
        summary.totalInvoices,

      subtotal:
        formatNumber(
          summary.subtotal
        ),

      discountAmount:
        formatNumber(
          summary.discountAmount
        ),

      totalSales:
        formatNumber(
          summary.totalSales
        ),

      paidAmount:
        formatNumber(
          summary.paidAmount
        ),

      balanceAmount:
        formatNumber(
          summary.balanceAmount
        ),
    },

    sales,
  };
}

/* ============================================================
   PURCHASE REPORT
============================================================ */

export async function getPurchasesReport(
  filters: PurchaseReportFilters
): Promise<PurchaseReportData> {
  const query = db("purchases as p")
    .leftJoin(
      "suppliers as s",
      "p.supplier_id",
      "s.id"
    )
    .where(
      "p.status",
      "completed"
    );

  if (filters.from) {
    query.where(
      "p.purchase_date",
      ">=",
      filters.from
    );
  }

  if (filters.to) {
    query.where(
      "p.purchase_date",
      "<=",
      filters.to
    );
  }

  const rows = await query
    .select(
      "p.id",
      "p.purchase_number",
      "s.name as supplier_name",

      // PostgreSQL DATE -> YYYY-MM-DD
      db.raw(
        "TO_CHAR(p.purchase_date, 'YYYY-MM-DD') as purchase_date"
      ),

      "p.payment_method",
      "p.subtotal",
      "p.discount_percent",
      "p.total_amount",
      "p.paid_amount",
      "p.balance_amount",
      "p.status"
    )
    .orderBy(
      "p.purchase_date",
      "desc"
    )
    .orderBy(
      "p.id",
      "desc"
    );

  const purchases: PurchaseReportItem[] =
    rows.map((purchase: any) => {
      const subtotal =
        Number(purchase.subtotal ?? 0);

      const discountPercent =
        Number(
          purchase.discount_percent ?? 0
        );

      const discountAmount =
        subtotal *
        (discountPercent / 100);

      return {
        id: Number(purchase.id),

        purchaseNumber:
          String(
            purchase.purchase_number
          ),

        supplierName:
          purchase.supplier_name ?? null,

        purchaseDate:
          String(
            purchase.purchase_date
          ),

        paymentMethod:
          String(
            purchase.payment_method
          ),

        subtotal:
          formatNumber(subtotal),

        discountPercent:
          formatNumber(
            discountPercent
          ),

        discountAmount:
          formatNumber(
            discountAmount
          ),

        totalAmount:
          formatNumber(
            purchase.total_amount
          ),

        paidAmount:
          formatNumber(
            purchase.paid_amount
          ),

        balanceAmount:
          formatNumber(
            purchase.balance_amount
          ),

        status:
          String(
            purchase.status
          ),
      };
    });

  const summary =
    purchases.reduce(
      (result, purchase) => {
        result.totalInvoices += 1;

        result.subtotal +=
          purchase.subtotal;

        result.discountAmount +=
          purchase.discountAmount;

        result.totalPurchases +=
          purchase.totalAmount;

        result.paidAmount +=
          purchase.paidAmount;

        result.balanceAmount +=
          purchase.balanceAmount;

        return result;
      },
      {
        totalInvoices: 0,
        subtotal: 0,
        discountAmount: 0,
        totalPurchases: 0,
        paidAmount: 0,
        balanceAmount: 0,
      }
    );

  return {
    summary: {
      totalInvoices:
        summary.totalInvoices,

      subtotal:
        formatNumber(
          summary.subtotal
        ),

      discountAmount:
        formatNumber(
          summary.discountAmount
        ),

      totalPurchases:
        formatNumber(
          summary.totalPurchases
        ),

      paidAmount:
        formatNumber(
          summary.paidAmount
        ),

      balanceAmount:
        formatNumber(
          summary.balanceAmount
        ),
    },

    purchases,
  };
}

/* ================================
   CUSTOMER PAYMENTS REPORT
================================ */

export const getCustomerPaymentsReport = async (
  filters: CustomerPaymentsReportFilters
): Promise<CustomerPaymentsReportData> => {
  const query = db("customer_payments as cp")
    .leftJoin("customers as c", "cp.customer_id", "c.id")
    .leftJoin("sales as s", "cp.sale_id", "s.id")
    .select(
      "cp.id",
      "c.name as customer_name",
      "s.invoice_number",
      db.raw(
        "TO_CHAR(cp.payment_date, 'YYYY-MM-DD') as payment_date"
      ),
      "cp.amount",
      "cp.payment_method",
      "cp.reference_number",
      "cp.notes"
    )
    .orderBy("cp.payment_date", "desc")
    .orderBy("cp.id", "desc");

  /* ================================
     DATE FILTERS
  ================================ */

  if (filters.from) {
    query.where("cp.payment_date", ">=", filters.from);
  }

  if (filters.to) {
    query.where("cp.payment_date", "<=", filters.to);
  }

  const rows = await query;

  /* ================================
     FORMAT DATA
  ================================ */

  const payments: CustomerPaymentReportItem[] = rows.map((row) => ({
    id: Number(row.id),
    customerName: row.customer_name ?? null,
    invoiceNumber: row.invoice_number ?? null,
    paymentDate: row.payment_date,
    amount: Number(row.amount || 0),
    paymentMethod: row.payment_method,
    referenceNumber: row.reference_number ?? null,
    notes: row.notes ?? null,
  }));

  /* ================================
     SUMMARY
  ================================ */

  const summary: CustomerPaymentReportSummary = {
    totalTransactions: payments.length,
    totalPayments: Number(
      payments.reduce((sum, payment) => sum + payment.amount, 0).toFixed(2)
    ),
  };

  return {
    summary,
    payments,
  };
};

/* ================================
   SUPPLIER PAYMENTS REPORT
================================ */

export const getSupplierPaymentsReport = async (
  filters: SupplierPaymentsReportFilters
): Promise<SupplierPaymentsReportData> => {
  const query = db("supplier_payments as sp")
    .leftJoin("suppliers as s", "sp.supplier_id", "s.id")
    .leftJoin("purchases as p", "sp.purchase_id", "p.id")
    .select(
      "sp.id",
      "s.name as supplier_name",
      "p.purchase_number",
      db.raw(
        "TO_CHAR(sp.payment_date, 'YYYY-MM-DD') as payment_date"
      ),
      "sp.amount",
      "sp.payment_method",
      "sp.reference_number",
      "sp.notes"
    )
    .orderBy("sp.payment_date", "desc")
    .orderBy("sp.id", "desc");

  /* ================================
     DATE FILTERS
  ================================ */

  if (filters.from) {
    query.where("sp.payment_date", ">=", filters.from);
  }

  if (filters.to) {
    query.where("sp.payment_date", "<=", filters.to);
  }

  const rows = await query;

  /* ================================
     FORMAT DATA
  ================================ */

  const payments: SupplierPaymentReportItem[] = rows.map((row) => ({
    id: Number(row.id),
    supplierName: row.supplier_name ?? null,
    purchaseNumber: row.purchase_number ?? null,
    paymentDate: row.payment_date,
    amount: Number(row.amount || 0),
    paymentMethod: row.payment_method,
    referenceNumber: row.reference_number ?? null,
    notes: row.notes ?? null,
  }));

  /* ================================
     SUMMARY
  ================================ */

  const summary: SupplierPaymentReportSummary = {
    totalTransactions: payments.length,
    totalPayments: Number(
      payments
        .reduce((sum, payment) => sum + payment.amount, 0)
        .toFixed(2)
    ),
  };

  return {
    summary,
    payments,
  };
};

/* ================================
   OUTSTANDING REPORT
================================ */

export const getOutstandingReport = async (): Promise<OutstandingReportData> => {
  /* =================================
     CUSTOMER OUTSTANDING
  ================================= */

  const customers = await db("customers as c")
    .select(
      "c.id",
      "c.name",
      "c.phone",
      "c.opening_balance"
    )
    .where("c.is_active", true)
    .orderBy("c.name", "asc");

  const customerOutstanding: CustomerOutstandingReportItem[] = [];

  for (const customer of customers) {
    /* ================================
       OUTSTANDING SALES

       sales.balance_amount already
       reflects invoice-linked payments.
    ================================= */

    const salesResult = await db("sales")
      .where("customer_id", customer.id)
      .where("status", "completed")
      .sum({
        outstanding: "balance_amount",
      })
      .first();

    /* ================================
       GENERAL PAYMENTS

       Only payments without sale_id
       are deducted here.

       Invoice-linked payments are already
       reflected in sales.balance_amount.
    ================================= */

    const paymentsResult = await db("customer_payments")
      .where("customer_id", customer.id)
      .whereNull("sale_id")
      .sum({
        payments: "amount",
      })
      .first();

    const openingBalance = Number(customer.opening_balance || 0);

    const outstandingSales = Number(
      salesResult?.outstanding || 0
    );

    const generalPayments = Number(
      paymentsResult?.payments || 0
    );

    const currentBalance = Number(
      (
        openingBalance +
        outstandingSales -
        generalPayments
      ).toFixed(2)
    );

    customerOutstanding.push({
      id: Number(customer.id),
      name: customer.name,
      phone: customer.phone ?? null,
      openingBalance,
      outstandingSales,
      generalPayments,
      currentBalance,
    });
  }

  /* =================================
     SUPPLIER OUTSTANDING
  ================================= */

  const suppliers = await db("suppliers as s")
    .select(
      "s.id",
      "s.name",
      "s.phone",
      "s.opening_balance"
    )
    .where("s.is_active", true)
    .orderBy("s.name", "asc");

  const supplierOutstanding: SupplierOutstandingReportItem[] = [];

  for (const supplier of suppliers) {
    /* ================================
       OUTSTANDING PURCHASES
    ================================= */

    const purchasesResult = await db("purchases")
      .where("supplier_id", supplier.id)
      .where("status", "completed")
      .sum({
        outstanding: "balance_amount",
      })
      .first();

    /* ================================
       GENERAL PAYMENTS

       Only payments without purchase_id
       are deducted here.
    ================================= */

    const paymentsResult = await db("supplier_payments")
      .where("supplier_id", supplier.id)
      .whereNull("purchase_id")
      .sum({
        payments: "amount",
      })
      .first();

    const openingBalance = Number(
      supplier.opening_balance || 0
    );

    const outstandingPurchases = Number(
      purchasesResult?.outstanding || 0
    );

    const generalPayments = Number(
      paymentsResult?.payments || 0
    );

    const currentBalance = Number(
      (
        openingBalance +
        outstandingPurchases -
        generalPayments
      ).toFixed(2)
    );

    supplierOutstanding.push({
      id: Number(supplier.id),
      name: supplier.name,
      phone: supplier.phone ?? null,
      openingBalance,
      outstandingPurchases,
      generalPayments,
      currentBalance,
    });
  }

  /* =================================
     SUMMARY
  ================================= */

  const totalCustomerOutstanding = Number(
    customerOutstanding
      .reduce(
        (sum, customer) =>
          sum + customer.currentBalance,
        0
      )
      .toFixed(2)
  );

  const totalSupplierOutstanding = Number(
    supplierOutstanding
      .reduce(
        (sum, supplier) =>
          sum + supplier.currentBalance,
        0
      )
      .toFixed(2)
  );

  const netOutstanding = Number(
    (
      totalCustomerOutstanding -
      totalSupplierOutstanding
    ).toFixed(2)
  );

  const summary: OutstandingReportSummary = {
    totalCustomerOutstanding,
    totalSupplierOutstanding,
    netOutstanding,
  };

  return {
    summary,
    customers: customerOutstanding,
    suppliers: supplierOutstanding,
  };
};

/* ================================
   PRODUCT SALES REPORT
================================ */

export const getProductSalesReport = async (
  filters: ProductSalesReportFilters
): Promise<ProductSalesReportData> => {
  const query = db("sale_items as si")
    .join("sales as s", "si.sale_id", "s.id")
    .join("products as p", "si.product_id", "p.id")
    .where("s.status", "completed")
    .select(
      "p.id as product_id",
      "p.name as product_name",
      "p.unit"
    )
    .sum({
      total_quantity: "si.quantity",
      total_sales: "si.total_amount",
    })
    .countDistinct({
      invoice_count: "s.id",
    })
    .groupBy(
      "p.id",
      "p.name",
      "p.unit"
    )
    .orderBy("p.name", "asc");

  /* ================================
     DATE FILTERS
  ================================ */

  if (filters.from) {
    query.where("s.sale_date", ">=", filters.from);
  }

  if (filters.to) {
    query.where("s.sale_date", "<=", filters.to);
  }

  /* ================================
     EXPLICIT RESULT TYPE
  ================================ */

  type ProductSalesRow = {
    product_id: number | string;
    product_name: string;
    unit: string;
    total_quantity: number | string | null;
    total_sales: number | string | null;
    invoice_count: number | string;
  };

  const rows = (await query) as ProductSalesRow[];

  /* ================================
     FORMAT DATA
  ================================ */

  const products: ProductSalesReportItem[] = rows.map((row) => ({
    productId: Number(row.product_id),

    productName: row.product_name,

    unit: row.unit,

    totalQuantity: Number(
      Number(row.total_quantity || 0).toFixed(3)
    ),

    totalSales: Number(
      Number(row.total_sales || 0).toFixed(2)
    ),

    invoiceCount: Number(
      row.invoice_count || 0
    ),
  }));

  /* ================================
     SUMMARY
  ================================ */

  const summary: ProductSalesReportSummary = {
    totalProducts: products.length,

    totalQuantity: Number(
      products
        .reduce(
          (sum, product) =>
            sum + product.totalQuantity,
          0
        )
        .toFixed(3)
    ),

    totalSales: Number(
      products
        .reduce(
          (sum, product) =>
            sum + product.totalSales,
          0
        )
        .toFixed(2)
    ),
  };

  return {
    summary,
    products,
  };
};

/* ================================
   PRODUCT PURCHASES REPORT
================================ */

export const getProductPurchasesReport = async (
  filters: ProductPurchasesReportFilters
): Promise<ProductPurchasesReportData> => {
  const query = db("purchase_items as pi")
    .join("purchases as pu", "pi.purchase_id", "pu.id")
    .join("products as p", "pi.product_id", "p.id")
    .where("pu.status", "completed")
    .select(
      "p.id as product_id",
      "p.name as product_name",
      "p.unit"
    )
    .sum({
      total_quantity: "pi.quantity",
      total_purchases: "pi.total_amount",
    })
    .countDistinct({
      invoice_count: "pu.id",
    })
    .groupBy(
      "p.id",
      "p.name",
      "p.unit"
    )
    .orderBy("p.name", "asc");

  /* ================================
     DATE FILTERS
  ================================ */

  if (filters.from) {
    query.where("pu.purchase_date", ">=", filters.from);
  }

  if (filters.to) {
    query.where("pu.purchase_date", "<=", filters.to);
  }

  /* ================================
     EXPLICIT RESULT TYPE
  ================================ */

  type ProductPurchasesRow = {
    product_id: number | string;
    product_name: string;
    unit: string;
    total_quantity: number | string | null;
    total_purchases: number | string | null;
    invoice_count: number | string;
  };

  const rows = (await query) as ProductPurchasesRow[];

  /* ================================
     FORMAT DATA
  ================================ */

  const products: ProductPurchasesReportItem[] = rows.map((row) => ({
    productId: Number(row.product_id),

    productName: row.product_name,

    unit: row.unit,

    totalQuantity: Number(
      Number(row.total_quantity || 0).toFixed(3)
    ),

    totalPurchases: Number(
      Number(row.total_purchases || 0).toFixed(2)
    ),

    invoiceCount: Number(
      row.invoice_count || 0
    ),
  }));

  /* ================================
     SUMMARY
  ================================ */

  const summary: ProductPurchasesReportSummary = {
    totalProducts: products.length,

    totalQuantity: Number(
      products
        .reduce(
          (sum, product) =>
            sum + product.totalQuantity,
          0
        )
        .toFixed(3)
    ),

    totalPurchases: Number(
      products
        .reduce(
          (sum, product) =>
            sum + product.totalPurchases,
          0
        )
        .toFixed(2)
    ),
  };

  return {
    summary,
    products,
  };
};

/* ================================
   STOCK MOVEMENTS REPORT
================================ */

export const getStockMovementsReport = async (
  filters: StockMovementsReportFilters
): Promise<StockMovementsReportData> => {
  const query = db("stock_movements as sm")
    .join("products as p", "sm.product_id", "p.id")
    .leftJoin("sales as s", "sm.sale_id", "s.id")
    .leftJoin("purchases as pu", "sm.purchase_id", "pu.id")
    .select(
      "sm.id",
      "sm.product_id",
      "p.name as product_name",
      "p.unit",
      "sm.movement_type",
      "sm.quantity",
      "sm.stock_after",
      "sm.sale_id",
      "sm.purchase_id",
      "s.invoice_number as sale_invoice_number",
      "pu.purchase_number",
      "sm.reason",
      "sm.created_by",
      db.raw(
        "TO_CHAR(sm.created_at, 'YYYY-MM-DD HH24:MI:SS') as created_at"
      )
    )
    .orderBy("sm.created_at", "desc")
    .orderBy("sm.id", "desc");

  /* ================================
     DATE FILTERS
  ================================ */

  if (filters.from) {
    query.whereRaw(
      "sm.created_at::date >= ?",
      [filters.from]
    );
  }

  if (filters.to) {
    query.whereRaw(
      "sm.created_at::date <= ?",
      [filters.to]
    );
  }

  /* ================================
     PRODUCT FILTER
  ================================ */

  if (filters.productId) {
    query.where("sm.product_id", filters.productId);
  }

  /* ================================
     MOVEMENT TYPE FILTER
  ================================ */

  if (filters.movementType) {
    query.where(
      "sm.movement_type",
      filters.movementType
    );
  }

  type StockMovementRow = {
    id: number | string;
    product_id: number | string;
    product_name: string;
    unit: string;
    movement_type: string;
    quantity: number | string;
    stock_after: number | string;
    sale_id: number | string | null;
    purchase_id: number | string | null;
    sale_invoice_number: string | null;
    purchase_number: string | null;
    reason: string | null;
    created_by: number | string | null;
    created_at: string;
  };

  const rows = (await query) as StockMovementRow[];

  /* ================================
     FORMAT DATA
  ================================ */

  const movements: StockMovementReportItem[] = rows.map(
    (row) => ({
      id: Number(row.id),

      productId: Number(row.product_id),

      productName: row.product_name,

      unit: row.unit,

      movementType: row.movement_type,

      quantity: Number(
        Number(row.quantity || 0).toFixed(3)
      ),

      stockAfter: Number(
        Number(row.stock_after || 0).toFixed(3)
      ),

      saleId:
        row.sale_id === null
          ? null
          : Number(row.sale_id),

      purchaseId:
        row.purchase_id === null
          ? null
          : Number(row.purchase_id),

      saleInvoiceNumber:
        row.sale_invoice_number ?? null,

      purchaseNumber:
        row.purchase_number ?? null,

      reason: row.reason ?? null,

      createdBy:
        row.created_by === null
          ? null
          : Number(row.created_by),

      createdAt: row.created_at,
    })
  );

  /* ================================
     SUMMARY
  ================================ */

  const totalIn = Number(
    movements
      .filter((movement) => movement.quantity > 0)
      .reduce(
        (sum, movement) =>
          sum + movement.quantity,
        0
      )
      .toFixed(3)
  );

  const totalOut = Number(
    movements
      .filter((movement) => movement.quantity < 0)
      .reduce(
        (sum, movement) =>
          sum + Math.abs(movement.quantity),
        0
      )
      .toFixed(3)
  );

  const netQuantity = Number(
    movements
      .reduce(
        (sum, movement) =>
          sum + movement.quantity,
        0
      )
      .toFixed(3)
  );

  const summary: StockMovementsReportSummary = {
    totalMovements: movements.length,
    totalIn,
    totalOut,
    netQuantity,
  };

  return {
    summary,
    movements,
  };
};

/* ================================
   PROFIT REPORT
================================ */

export const getProfitReport = async (
  filters: ProfitReportFilters
): Promise<ProfitReportData> => {
  /* =================================
     SALES REVENUE
  ================================= */

  const salesQuery = db("sale_items as si")
    .join("sales as s", "si.sale_id", "s.id")
    .where("s.status", "completed");

  if (filters.from) {
    salesQuery.where(
      "s.sale_date",
      ">=",
      filters.from
    );
  }

  if (filters.to) {
    salesQuery.where(
      "s.sale_date",
      "<=",
      filters.to
    );
  }

  const salesResult = await salesQuery
    .sum({
      totalSales: "si.total_amount",
    })
    .first();

  const totalSales = Number(
    salesResult?.totalSales || 0
  );


  /* =================================
     ESTIMATED COGS

     Historical purchase price is not
     stored inside sale_items.

     Therefore:
     quantity × current product purchase_price
  ================================= */

  const cogsQuery = db("sale_items as si")
    .join("sales as s", "si.sale_id", "s.id")
    .join(
      "products as p",
      "si.product_id",
      "p.id"
    )
    .where("s.status", "completed");

  if (filters.from) {
    cogsQuery.where(
      "s.sale_date",
      ">=",
      filters.from
    );
  }

  if (filters.to) {
    cogsQuery.where(
      "s.sale_date",
      "<=",
      filters.to
    );
  }

  const cogsResult = await cogsQuery
    .sum({
      estimatedCogs: db.raw(
        "si.quantity * p.purchase_price"
      ),
    })
    .first();

  const estimatedCogs = Number(
    cogsResult?.estimatedCogs || 0
  );


  /* =================================
     GROSS PROFIT
  ================================= */

  const grossProfit =
    totalSales - estimatedCogs;


  /* =================================
     EXPENSES
  ================================= */

  const expenseQuery = db("expenses");

  if (filters.from) {
    expenseQuery.where(
      "expense_date",
      ">=",
      filters.from
    );
  }

  if (filters.to) {
    expenseQuery.where(
      "expense_date",
      "<=",
      filters.to
    );
  }

  const expenseResult = await expenseQuery
    .sum({
      totalExpenses: "amount",
    })
    .first();

  const totalExpenses = Number(
    expenseResult?.totalExpenses || 0
  );


  /* =================================
     NET PROFIT
  ================================= */

  const netProfit =
    grossProfit - totalExpenses;


  /* =================================
     RETURN REPORT
  ================================= */

  return {
    summary: {
      totalSales: formatNumber(
        totalSales
      ),

      estimatedCogs: formatNumber(
        estimatedCogs
      ),

      grossProfit: formatNumber(
        grossProfit
      ),

      totalExpenses: formatNumber(
        totalExpenses
      ),

      netProfit: formatNumber(
        netProfit
      ),
    },
  };
};