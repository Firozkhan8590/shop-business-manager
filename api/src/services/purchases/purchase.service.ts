import db from "../../config/database";

import {
  CreatePurchaseInput,
  UpdatePurchaseInput,
} from "../../types/purchases/purchase.type";

function calculatePurchaseTotals(
  items: {
    quantity: number;
    unit_price: number;
  }[],
  discountPercent: number,
  paidAmount: number
) {
  const subtotal = items.reduce(
    (sum, item) =>
      sum + item.quantity * item.unit_price,
    0
  );

  const discountAmount =
    (subtotal * discountPercent) / 100;

  const totalAmount =
    subtotal - discountAmount;

  const balanceAmount =
    totalAmount - paidAmount;

  return {
    subtotal: Number(subtotal.toFixed(2)),
    totalAmount: Number(totalAmount.toFixed(2)),
    balanceAmount: Number(
      balanceAmount.toFixed(2)
    ),
  };
}

/* ==========================================
   LIST PURCHASES
========================================== */

export async function getPurchases(
  date?: string
) {
  const query = db("purchases")
    .select(
      "id",
      "purchase_number",
      "supplier_id",
      "created_by",
      "updated_by",
      "purchase_date",
      "payment_method",
      "subtotal",
      "discount_percent",
      "total_amount",
      "paid_amount",
      "balance_amount",
      "status",
      "notes",
      "created_at",
      "updated_at"
    );

  if (date) {
    query.where(
      "purchase_date",
      date
    );
  }

  return query
    .orderBy(
      "purchase_date",
      "desc"
    )
    .orderBy(
      "id",
      "desc"
    );
}

/* ==========================================
   GET PURCHASE
========================================== */

export async function getPurchaseById(
  id: number
) {
  const purchase = await db("purchases")
    .select(
      "id",
      "purchase_number",
      "supplier_id",
      "created_by",
      "updated_by",
      "purchase_date",
      "payment_method",
      "subtotal",
      "discount_percent",
      "total_amount",
      "paid_amount",
      "balance_amount",
      "status",
      "notes",
      "created_at",
      "updated_at"
    )
    .where("id", id)
    .first();

  if (!purchase) {
    return null;
  }

  const items = await db("purchase_items")
    .select(
      "id",
      "purchase_id",
      "product_id",
      "quantity",
      "unit_price",
      "total_amount",
      "created_at"
    )
    .where("purchase_id", id)
    .orderBy("id", "asc");

  return {
    ...purchase,
    items,
  };
}

/* ==========================================
   CREATE PURCHASE
========================================== */

export async function createPurchase(
  data: CreatePurchaseInput,
  userId: number | null
) {
  return db.transaction(async (trx) => {
    // Check duplicate purchase number
    const existingPurchase = await trx(
      "purchases"
    )
      .where(
        "purchase_number",
        data.purchase_number
      )
      .first();

    if (existingPurchase) {
      throw new Error(
        "Purchase number already exists"
      );
    }

    // Check supplier if provided
    if (data.supplier_id !== undefined &&
        data.supplier_id !== null) {
      const supplier = await trx("suppliers")
        .where("id", data.supplier_id)
        .first();

      if (!supplier) {
        throw new Error(
          "Supplier not found"
        );
      }
    }

    // Check products
    for (const item of data.items) {
      const product = await trx("products")
        .where("id", item.product_id)
        .first();

      if (!product) {
        throw new Error(
          `Product ${item.product_id} not found`
        );
      }
    }

    const discountPercent =
      data.discount_percent ?? 0;

    const paidAmount =
      data.paid_amount ?? 0;

    const totals =
      calculatePurchaseTotals(
        data.items,
        discountPercent,
        paidAmount
      );

    if (paidAmount > totals.totalAmount) {
      throw new Error(
        "Paid amount cannot be greater than total amount"
      );
    }

    const [purchase] = await trx("purchases")
      .insert({
        purchase_number:
          data.purchase_number,

        supplier_id:
          data.supplier_id ?? null,

        created_by: userId,

        updated_by: userId,

        purchase_date:
          data.purchase_date,

        payment_method:
          data.payment_method ?? "cash",

        subtotal:
          totals.subtotal,

        discount_percent:
          discountPercent,

        total_amount:
          totals.totalAmount,

        paid_amount:
          paidAmount,

        balance_amount:
          totals.balanceAmount,

        status:
          data.status ?? "completed",

        notes:
          data.notes ?? null,
      })
      .returning([
        "id",
        "purchase_number",
        "supplier_id",
        "created_by",
        "updated_by",
        "purchase_date",
        "payment_method",
        "subtotal",
        "discount_percent",
        "total_amount",
        "paid_amount",
        "balance_amount",
        "status",
        "notes",
        "created_at",
        "updated_at",
      ]);

    const purchaseItems = [];

    for (const item of data.items) {
      const itemTotal =
        item.quantity *
        item.unit_price;

      const [purchaseItem] =
        await trx("purchase_items")
          .insert({
            purchase_id:
              purchase.id,

            product_id:
              item.product_id,

            quantity:
              item.quantity,

            unit_price:
              item.unit_price,

            total_amount:
              Number(
                itemTotal.toFixed(2)
              ),
          })
          .returning([
            "id",
            "purchase_id",
            "product_id",
            "quantity",
            "unit_price",
            "total_amount",
            "created_at",
          ]);

      purchaseItems.push(
        purchaseItem
      );
    }

    return {
      ...purchase,
      items: purchaseItems,
    };
  });
}

/* ==========================================
   UPDATE PURCHASE
========================================== */

export async function updatePurchase(
  id: number,
  data: UpdatePurchaseInput,
  userId: number | null
) {
  return db.transaction(async (trx) => {
    const existingPurchase =
      await trx("purchases")
        .where("id", id)
        .first();

    if (!existingPurchase) {
      throw new Error(
        "Purchase not found"
      );
    }

    // Check duplicate purchase number
    if (data.purchase_number) {
      const duplicate =
        await trx("purchases")
          .where(
            "purchase_number",
            data.purchase_number
          )
          .whereNot("id", id)
          .first();

      if (duplicate) {
        throw new Error(
          "Purchase number already exists"
        );
      }
    }

    // Supplier validation
    if (
      data.supplier_id !== undefined &&
      data.supplier_id !== null
    ) {
      const supplier =
        await trx("suppliers")
          .where(
            "id",
            data.supplier_id
          )
          .first();

      if (!supplier) {
        throw new Error(
          "Supplier not found"
        );
      }
    }

    // Determine values
    const discountPercent =
      data.discount_percent ??
      Number(
        existingPurchase.discount_percent
      );

    const paidAmount =
      data.paid_amount ??
      Number(
        existingPurchase.paid_amount
      );

    let subtotal =
      Number(existingPurchase.subtotal);

    let items = null;

    // If items are provided, replace existing items
    if (data.items) {
      for (const item of data.items) {
        const product =
          await trx("products")
            .where(
              "id",
              item.product_id
            )
            .first();

        if (!product) {
          throw new Error(
            `Product ${item.product_id} not found`
          );
        }
      }

      const totals =
        calculatePurchaseTotals(
          data.items,
          discountPercent,
          paidAmount
        );

      subtotal = totals.subtotal;

      if (
        paidAmount >
        totals.totalAmount
      ) {
        throw new Error(
          "Paid amount cannot be greater than total amount"
        );
      }

      await trx("purchase_items")
        .where(
          "purchase_id",
          id
        )
        .delete();

      items = [];

      for (const item of data.items) {
        const itemTotal =
          item.quantity *
          item.unit_price;

        const [purchaseItem] =
          await trx(
            "purchase_items"
          )
            .insert({
              purchase_id: id,
              product_id:
                item.product_id,
              quantity:
                item.quantity,
              unit_price:
                item.unit_price,
              total_amount:
                Number(
                  itemTotal.toFixed(2)
                ),
            })
            .returning([
              "id",
              "purchase_id",
              "product_id",
              "quantity",
              "unit_price",
              "total_amount",
              "created_at",
            ]);

        items.push(
          purchaseItem
        );
      }
    } else {
      const totalAmount =
        Number(
          (
            subtotal -
            (subtotal *
              discountPercent) /
              100
          ).toFixed(2)
        );

      if (
        paidAmount >
        totalAmount
      ) {
        throw new Error(
          "Paid amount cannot be greater than total amount"
        );
      }
    }

    const totalAmount =
      Number(
        (
          subtotal -
          (subtotal *
            discountPercent) /
            100
        ).toFixed(2)
      );

    const balanceAmount =
      Number(
        (
          totalAmount -
          paidAmount
        ).toFixed(2)
      );

    const [purchase] =
      await trx("purchases")
        .where("id", id)
        .update({
          ...(data.purchase_number !==
          undefined && {
            purchase_number:
              data.purchase_number,
          }),

          ...(data.supplier_id !==
          undefined && {
            supplier_id:
              data.supplier_id,
          }),

          ...(data.purchase_date !==
          undefined && {
            purchase_date:
              data.purchase_date,
          }),

          ...(data.payment_method !==
          undefined && {
            payment_method:
              data.payment_method,
          }),

          subtotal,

          discount_percent:
            discountPercent,

          total_amount:
            totalAmount,

          paid_amount:
            paidAmount,

          balance_amount:
            balanceAmount,

          ...(data.status !==
          undefined && {
            status:
              data.status,
          }),

          ...(data.notes !==
          undefined && {
            notes:
              data.notes,
          }),

          updated_by: userId,
          updated_at:
            trx.fn.now(),
        })
        .returning([
          "id",
          "purchase_number",
          "supplier_id",
          "created_by",
          "updated_by",
          "purchase_date",
          "payment_method",
          "subtotal",
          "discount_percent",
          "total_amount",
          "paid_amount",
          "balance_amount",
          "status",
          "notes",
          "created_at",
          "updated_at",
        ]);

    if (!items) {
      items =
        await trx("purchase_items")
          .where(
            "purchase_id",
            id
          )
          .orderBy("id", "asc");
    }

    return {
      ...purchase,
      items,
    };
  });
}

export async function getNextPurchaseNumber(): Promise<string> {
  const lastPurchase = await db("purchases")
    .select("purchase_number")
    .orderBy("id", "desc")
    .first();

  if (!lastPurchase) {
    return "PUR00001";
  }

  const match = lastPurchase.purchase_number.match(/^PUR(\d+)$/);

  if (!match) {
    return "PUR00001";
  }

  const nextNumber = Number(match[1]) + 1;

  return `PUR${String(nextNumber).padStart(5, "0")}`;
}