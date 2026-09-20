

/* =========================================================
   CUSTOMER PAYMENT
========================================================= */

import db from "../../config/database";
import { CreateCustomerPaymentDto, CreateSupplierPaymentDto } from "../../types/payments/payment.type";

export async function createCustomerPayment(
  data: CreateCustomerPaymentDto
) {
  return db.transaction(async (trx) => {
    /* ---------------------------------------------
       1. Validate customer
    --------------------------------------------- */

    const customer = await trx("customers")
      .where("id", data.customerId)
      .first();

    if (!customer) {
      throw new Error("Customer not found");
    }

    /* ---------------------------------------------
       2. Validate amount
    --------------------------------------------- */

    if (!data.amount || Number(data.amount) <= 0) {
      throw new Error("Payment amount must be greater than zero");
    }

    /* ---------------------------------------------
       3. Validate sale if provided
    --------------------------------------------- */

    let sale: any = null;

    if (data.saleId) {
      sale = await trx("sales")
        .where("id", data.saleId)
        .first();

      if (!sale) {
        throw new Error("Sale invoice not found");
      }

      if (Number(sale.customer_id) !== Number(data.customerId)) {
        throw new Error(
          "Selected sale does not belong to this customer"
        );
      }

      const outstanding = Number(sale.balance_amount);

      if (Number(data.amount) > outstanding) {
        throw new Error(
          `Payment amount cannot exceed outstanding balance of ${outstanding.toFixed(
            2
          )}`
        );
      }
    }

    /* ---------------------------------------------
       4. Insert payment
    --------------------------------------------- */

    const [payment] = await trx("customer_payments")
      .insert({
        customer_id: data.customerId,
        sale_id: data.saleId ?? null,
        payment_date: data.paymentDate,
        amount: data.amount,
        payment_method: data.paymentMethod,
        reference_number: data.referenceNumber ?? null,
        notes: data.notes ?? null,
      })
      .returning("*");

    /* ---------------------------------------------
       5. Update sale payment if linked
    --------------------------------------------- */

    if (sale) {
      const currentPaid = Number(sale.paid_amount);
      const totalAmount = Number(sale.total_amount);
      const paymentAmount = Number(data.amount);

      const newPaidAmount = currentPaid + paymentAmount;
      const newBalanceAmount = totalAmount - newPaidAmount;

      await trx("sales")
        .where("id", data.saleId)
        .update({
          paid_amount: newPaidAmount,
          balance_amount: Math.max(0, newBalanceAmount),
          updated_at: trx.fn.now(),
        });
    }

    return payment;
  });
}


/* =========================================================
   SUPPLIER PAYMENT
========================================================= */

export async function createSupplierPayment(
  data: CreateSupplierPaymentDto,
) {
  return db.transaction(async (trx) => {
    /* ---------------------------------------------
       1. Validate supplier
    --------------------------------------------- */

    const supplier = await trx("suppliers")
      .where("id", data.supplierId)
      .first();

    if (!supplier) {
      throw new Error("Supplier not found");
    }

    /* ---------------------------------------------
       2. Validate amount
    --------------------------------------------- */

    if (!data.amount || Number(data.amount) <= 0) {
      throw new Error("Payment amount must be greater than zero");
    }

    /* ---------------------------------------------
       3. Validate purchase if provided
    --------------------------------------------- */

    let purchase: any = null;

    if (data.purchaseId) {
      purchase = await trx("purchases")
        .where("id", data.purchaseId)
        .first();

      if (!purchase) {
        throw new Error("Purchase invoice not found");
      }

      if (
        Number(purchase.supplier_id) !==
        Number(data.supplierId)
      ) {
        throw new Error(
          "Selected purchase does not belong to this supplier"
        );
      }

      const outstanding = Number(
        purchase.balance_amount
      );

      if (Number(data.amount) > outstanding) {
        throw new Error(
          `Payment amount cannot exceed outstanding balance of ${outstanding.toFixed(
            2
          )}`
        );
      }
    }

    /* ---------------------------------------------
       4. Insert payment
    --------------------------------------------- */

    const [payment] = await trx("supplier_payments")
      .insert({
        supplier_id: data.supplierId,
        purchase_id: data.purchaseId ?? null,
        payment_date: data.paymentDate,
        amount: data.amount,
        payment_method: data.paymentMethod,
        reference_number: data.referenceNumber ?? null,
        notes: data.notes ?? null,
      })
      .returning("*");

    /* ---------------------------------------------
       5. Update purchase payment if linked
    --------------------------------------------- */

    if (purchase) {
      const currentPaid = Number(
        purchase.paid_amount
      );

      const totalAmount = Number(
        purchase.total_amount
      );

      const paymentAmount = Number(data.amount);

      const newPaidAmount =
        currentPaid + paymentAmount;

      const newBalanceAmount =
        totalAmount - newPaidAmount;

      await trx("purchases")
        .where("id", data.purchaseId)
        .update({
          paid_amount: newPaidAmount,
          balance_amount: Math.max(
            0,
            newBalanceAmount
          ),
          updated_at: trx.fn.now(),
        });
    }

    return payment;
  });
}


/* =========================================================
   CUSTOMER PAYMENT LIST
========================================================= */

export async function getCustomerPayments(
  date?: string
) {
  const query = db("customer_payments as cp")
    .leftJoin(
      "customers as c",
      "cp.customer_id",
      "c.id"
    )
    .leftJoin(
      "sales as s",
      "cp.sale_id",
      "s.id"
    )
    .select(
      "cp.id",
      "cp.customer_id",
      "cp.sale_id",
      "cp.payment_date",
      "cp.amount",
      "cp.payment_method",
      "cp.reference_number",
      "cp.notes",
      "cp.created_at",
      "c.name as customer_name",
      "s.invoice_number as invoice_no"
    );

  if (date) {
    query.where("cp.payment_date", date);
  }

  return query
    .orderBy("cp.payment_date", "desc")
    .orderBy("cp.id", "desc");
}


/* =========================================================
   SUPPLIER PAYMENT LIST
========================================================= */

export async function getSupplierPayments(
  date?: string
) {
  const query = db("supplier_payments as sp")
    .leftJoin(
      "suppliers as s",
      "sp.supplier_id",
      "s.id"
    )
    .leftJoin(
      "purchases as p",
      "sp.purchase_id",
      "p.id"
    )
    .select(
      "sp.id",
      "sp.supplier_id",
      "sp.purchase_id",
      "sp.payment_date",
      "sp.amount",
      "sp.payment_method",
      "sp.reference_number",
      "sp.notes",
      "sp.created_at",
      "s.name as supplier_name",
      "p.purchase_number"
    );

  if (date) {
    query.where("sp.payment_date", date);
  }

  return query
    .orderBy("sp.payment_date", "desc")
    .orderBy("sp.id", "desc");
}


/* =========================================================
   ALL PAYMENTS
========================================================= */

export async function getAllPayments(
  date?: string
) {
  const customerPayments =
    await getCustomerPayments(date);

  const supplierPayments =
    await getSupplierPayments(date);

  const customers = customerPayments.map(
    (payment: any) => ({
      id: payment.id,
      payment_type: "customer",
      customer_id: payment.customer_id,
      customer_name: payment.customer_name,
      sale_id: payment.sale_id,
      invoice_no: payment.invoice_no ?? null,
      payment_date: payment.payment_date,
      amount: payment.amount,
      payment_method: payment.payment_method,
      reference_number:
        payment.reference_number,
      notes: payment.notes,
      created_at: payment.created_at,
    })
  );

  const suppliers = supplierPayments.map(
    (payment: any) => ({
      id: payment.id,
      payment_type: "supplier",
      supplier_id: payment.supplier_id,
      supplier_name: payment.supplier_name,
      purchase_id: payment.purchase_id,
      purchase_number:
        payment.purchase_number ?? null,
      payment_date: payment.payment_date,
      amount: payment.amount,
      payment_method: payment.payment_method,
      reference_number:
        payment.reference_number,
      notes: payment.notes,
      created_at: payment.created_at,
    })
  );

  return [...customers, ...suppliers].sort(
    (a, b) =>
      new Date(b.payment_date).getTime() -
      new Date(a.payment_date).getTime()
  );
}