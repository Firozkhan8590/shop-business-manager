import db from "../../config/database";

import {
  CreateCustomerInput,
  UpdateCustomerInput,
} from "../../types/customers/customer.type";


/* =========================================================
   CUSTOMER SELECT FIELDS
========================================================= */

function customerSelect() {
  return [
    "c.id",
    "c.name",
    "c.phone",
    "c.address",
    "c.opening_balance",
    "c.notes",
    "c.is_active",
    "c.created_at",
    "c.updated_at",

    /* ---------------------------------------------
       Total outstanding from sales
       Sale-linked payments are already reflected
       inside sales.balance_amount
    --------------------------------------------- */

    db.raw(`
      COALESCE(
        (
          SELECT SUM(s.balance_amount)
          FROM sales s
          WHERE s.customer_id = c.id
          AND s.status <> 'cancelled'
        ),
        0
      ) AS sales_outstanding
    `),

    /* ---------------------------------------------
       General customer payments

       Only payments without sale_id are counted
       here because sale-linked payments are already
       reflected in sales.balance_amount.
    --------------------------------------------- */

    db.raw(`
      COALESCE(
        (
          SELECT SUM(cp.amount)
          FROM customer_payments cp
          WHERE cp.customer_id = c.id
          AND cp.sale_id IS NULL
        ),
        0
      ) AS general_payments
    `),

     db.raw(`
      GREATEST(
        c.opening_balance -
        COALESCE(
          (
            SELECT SUM(cp.amount)
            FROM customer_payments cp
            WHERE cp.customer_id = c.id
            AND cp.sale_id IS NULL
          ),
          0
        ),
        0
      ) AS opening_balance_remaining
    `),

    /* ---------------------------------------------
       CURRENT BALANCE

       Opening Balance
       + Sales Outstanding
       - General Payments
    --------------------------------------------- */

    db.raw(`
      (
        c.opening_balance
        +
        COALESCE(
          (
            SELECT SUM(s.balance_amount)
            FROM sales s
            WHERE s.customer_id = c.id
            AND s.status <> 'cancelled'
          ),
          0
        )
        -
        COALESCE(
          (
            SELECT SUM(cp.amount)
            FROM customer_payments cp
            WHERE cp.customer_id = c.id
            AND cp.sale_id IS NULL
          ),
          0
        )
      ) AS current_balance
    `),
  ];
}


/* =========================================================
   GET CUSTOMERS
========================================================= */

export async function getCustomers(
  search?: string
) {
  const query = db("customers as c")
    .select(customerSelect())
    .where("c.is_active", true)
    .orderBy("c.name", "asc");

  if (search?.trim()) {
    const searchTerm =
      `%${search.trim()}%`;

    query.where(function () {
      this.whereILike(
        "c.name",
        searchTerm
      ).orWhereILike(
        "c.phone",
        searchTerm
      );
    });
  }

  return query;
}


/* =========================================================
   GET CUSTOMER BY ID
========================================================= */

export async function getCustomerById(
  id: number
) {
  return db("customers as c")
    .select(customerSelect())
    .where("c.id", id)
    .first();
}


/* =========================================================
   CREATE CUSTOMER
========================================================= */

export async function createCustomer(
  data: CreateCustomerInput
) {
  const [customer] =
    await db("customers")
      .insert({
        name: data.name,
        phone: data.phone ?? null,
        address: data.address ?? null,
        opening_balance:
          data.opening_balance ?? 0,
        notes: data.notes ?? null,
        is_active: true,
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

  return customer;
}


/* =========================================================
   UPDATE CUSTOMER
========================================================= */

export async function updateCustomer(
  id: number,
  data: UpdateCustomerInput
) {
  const [customer] =
    await db("customers")
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

  return customer;
}


/* =========================================================
   DEACTIVATE CUSTOMER
========================================================= */

export async function deactivateCustomer(
  id: number
) {
  const [customer] =
    await db("customers")
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

  return customer;
}