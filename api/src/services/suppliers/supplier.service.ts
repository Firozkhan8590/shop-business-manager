import db from "../../config/database";
import {
  CreateSupplierInput,
  UpdateSupplierInput,
} from "../../types/suppliers/supplier.type";

/* ============================================================
   SUPPLIER SELECT
============================================================ */

function supplierSelect() {
  return [
    "s.id",
    "s.name",
    "s.phone",
    "s.address",
    "s.opening_balance",
    "s.notes",
    "s.is_active",
    "s.created_at",
    "s.updated_at",

    /* ========================================================
       PURCHASE OUTSTANDING

       Sum of all unpaid purchase balances for this supplier.

       Purchase-linked supplier payments already reduce
       purchase.balance_amount, so we do not subtract those
       payments again here.
    ======================================================== */

    db.raw(`
      COALESCE(
        (
          SELECT SUM(p.balance_amount)
          FROM purchases p
          WHERE p.supplier_id = s.id
          AND p.status <> 'cancelled'
        ),
        0
      ) AS purchases_outstanding
    `),

    /* ========================================================
       GENERAL SUPPLIER PAYMENTS

       Payments that are NOT linked to a particular purchase.

       purchase_id IS NULL means this is a general supplier
       payment.
    ======================================================== */

    db.raw(`
      COALESCE(
        (
          SELECT SUM(sp.amount)
          FROM supplier_payments sp
          WHERE sp.supplier_id = s.id
          AND sp.purchase_id IS NULL
        ),
        0
      ) AS general_payments
    `),

    /* ========================================================
       OPENING BALANCE REMAINING

       Original opening balance remains unchanged in the
       suppliers table.

       This calculates how much of that opening balance is
       still remaining after general supplier payments.

       Example:
       Opening Balance = 10,000
       General Payment = 2,000
       Remaining       = 8,000
    ======================================================== */

    db.raw(`
      GREATEST(
        s.opening_balance -
        COALESCE(
          (
            SELECT SUM(sp.amount)
            FROM supplier_payments sp
            WHERE sp.supplier_id = s.id
            AND sp.purchase_id IS NULL
          ),
          0
        ),
        0
      ) AS opening_balance_remaining
    `),

    /* ========================================================
       CURRENT BALANCE

       Opening Balance
       + Purchase Outstanding
       - General Payments

       Purchase-linked payments are already included in
       purchase.balance_amount, so they are NOT subtracted
       separately.
    ======================================================== */

    db.raw(`
      (
        s.opening_balance
        +
        COALESCE(
          (
            SELECT SUM(p.balance_amount)
            FROM purchases p
            WHERE p.supplier_id = s.id
            AND p.status <> 'cancelled'
          ),
          0
        )
        -
        COALESCE(
          (
            SELECT SUM(sp.amount)
            FROM supplier_payments sp
            WHERE sp.supplier_id = s.id
            AND sp.purchase_id IS NULL
          ),
          0
        )
      ) AS current_balance
    `),
  ];
}

/* ============================================================
   GET SUPPLIERS
============================================================ */

export async function getSuppliers(search?: string) {
  const query = db("suppliers as s")
    .select(supplierSelect())
    .where("s.is_active", true)
    .orderBy("s.name", "asc");

  if (search?.trim()) {
    const searchTerm = `%${search.trim()}%`;

    query.where(function () {
      this.whereILike(
        "s.name",
        searchTerm
      ).orWhereILike(
        "s.phone",
        searchTerm
      );
    });
  }

  return query;
}

/* ============================================================
   GET SUPPLIER BY ID
============================================================ */

export async function getSupplierById(id: number) {
  return db("suppliers as s")
    .select(supplierSelect())
    .where("s.id", id)
    .first();
}

/* ============================================================
   CREATE SUPPLIER
============================================================ */

export async function createSupplier(
  data: CreateSupplierInput
) {
  const [supplier] = await db("suppliers")
    .insert({
      name: data.name,
      phone: data.phone ?? null,
      address: data.address ?? null,
      opening_balance:
        data.opening_balance ?? 0,
      notes: data.notes ?? null,
      is_active:
        data.is_active ?? true,
    })
    .returning([
      "id",
      "name",
      "phone",
      "address",
      "opening_balance",
      "notes",
      "is_active",
      "created_at",
      "updated_at",
    ]);

  return supplier;
}

/* ============================================================
   UPDATE SUPPLIER
============================================================ */

export async function updateSupplier(
  id: number,
  data: UpdateSupplierInput
) {
  const [supplier] = await db("suppliers")
    .where("id", id)
    .update({
      ...data,
      updated_at: db.fn.now(),
    })
    .returning([
      "id",
      "name",
      "phone",
      "address",
      "opening_balance",
      "notes",
      "is_active",
      "created_at",
      "updated_at",
    ]);

  return supplier;
}

/* ============================================================
   DEACTIVATE SUPPLIER
============================================================ */

export async function deactivateSupplier(
  id: number
) {
  const [supplier] = await db("suppliers")
    .where("id", id)
    .update({
      is_active: false,
      updated_at: db.fn.now(),
    })
    .returning([
      "id",
      "name",
      "phone",
      "address",
      "opening_balance",
      "notes",
      "is_active",
      "created_at",
      "updated_at",
    ]);

  return supplier;
}