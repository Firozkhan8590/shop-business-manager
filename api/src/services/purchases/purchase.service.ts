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

    totalAmount: Number(
      totalAmount.toFixed(2)
    ),

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

    // ==========================================
    // 1. CHECK DUPLICATE PURCHASE NUMBER
    // ==========================================

    const existingPurchase =
      await trx("purchases")
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

    // ==========================================
    // 2. CHECK SUPPLIER
    // ==========================================

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

    // ==========================================
    // 3. CHECK PRODUCTS
    // ==========================================

    for (const item of data.items) {
      const product =
        await trx("products")
          .where(
            "id",
            item.product_id
          )
          .where(
            "is_active",
            true
          )
          .first();

      if (!product) {
        throw new Error(
          `Product ${item.product_id} not found`
        );
      }
    }

    // ==========================================
    // 4. CALCULATE TOTALS
    // ==========================================

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

    if (
      paidAmount >
      totals.totalAmount
    ) {
      throw new Error(
        "Paid amount cannot be greater than total amount"
      );
    }

    // ==========================================
    // 5. CREATE PURCHASE
    // ==========================================

    const [purchase] =
      await trx("purchases")
        .insert({
          purchase_number:
            data.purchase_number,

          supplier_id:
            data.supplier_id ?? null,

          created_by:
            userId,

          updated_by:
            userId,

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

    // ==========================================
    // 6. CREATE PURCHASE ITEMS
    // ==========================================

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

      // ==========================================
      // 7. UPDATE STOCK
      // ==========================================

      /*
       * Only completed purchases affect stock.
       */

      if (
        (data.status ?? "completed") ===
        "completed"
      ) {
        const product =
          await trx("products")
            .where(
              "id",
              item.product_id
            )
            .where(
              "is_active",
              true
            )
            .first();

        if (!product) {
          throw new Error(
            `Product ${item.product_id} not found`
          );
        }

        const currentStock =
          Number(
            product.current_stock || 0
          );

        const quantity =
          Number(item.quantity);

        const newStock =
          currentStock + quantity;

        // ------------------------------------------
        // Update product current stock
        // ------------------------------------------

        await trx("products")
          .where(
            "id",
            item.product_id
          )
          .update({
            current_stock:
              String(newStock),

            updated_at:
              trx.fn.now(),
          });

        // ------------------------------------------
        // Create stock movement
        // ------------------------------------------

        await trx("stock_movements")
          .insert({
            product_id:
              item.product_id,

            movement_type:
              "purchase",

            quantity:
              quantity,

            stock_after:
              newStock,

            sale_id:
              null,

            purchase_id:
              purchase.id,

            created_by:
              userId,

            reason:
              `Purchase ${purchase.purchase_number}`,
          });
      }
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

    // ==========================================
    // 1. GET EXISTING PURCHASE
    // ==========================================

    const existingPurchase =
      await trx("purchases")
        .where(
          "id",
          id
        )
        .first();

    if (!existingPurchase) {
      throw new Error(
        "Purchase not found"
      );
    }

    // ==========================================
    // 2. GET OLD PURCHASE ITEMS
    // ==========================================

    const oldItems =
      await trx("purchase_items")
        .where(
          "purchase_id",
          id
        )
        .orderBy(
          "id",
          "asc"
        );

    // ==========================================
    // 3. CHECK DUPLICATE PURCHASE NUMBER
    // ==========================================

    if (data.purchase_number) {

      const duplicate =
        await trx("purchases")
          .where(
            "purchase_number",
            data.purchase_number
          )
          .whereNot(
            "id",
            id
          )
          .first();

      if (duplicate) {
        throw new Error(
          "Purchase number already exists"
        );
      }
    }

    // ==========================================
    // 4. SUPPLIER VALIDATION
    // ==========================================

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

    // ==========================================
    // 5. DETERMINE VALUES
    // ==========================================

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
      Number(
        existingPurchase.subtotal
      );

    let items = null;

    // ==========================================
    // 6. HANDLE ITEMS
    // ==========================================

    if (data.items) {

      // ------------------------------------------
      // Validate new products
      // ------------------------------------------

      for (const item of data.items) {

        const product =
          await trx("products")
            .where(
              "id",
              item.product_id
            )
            .where(
              "is_active",
              true
            )
            .first();

        if (!product) {
          throw new Error(
            `Product ${item.product_id} not found`
          );
        }
      }

      // ------------------------------------------
      // Calculate new totals
      // ------------------------------------------

      const totals =
        calculatePurchaseTotals(
          data.items,
          discountPercent,
          paidAmount
        );

      subtotal =
        totals.subtotal;

      if (
        paidAmount >
        totals.totalAmount
      ) {
        throw new Error(
          "Paid amount cannot be greater than total amount"
        );
      }

      // ==========================================
      // REVERSE OLD STOCK
      // ==========================================

      if (
        existingPurchase.status ===
        "completed"
      ) {

        for (const oldItem of oldItems) {

          const oldQuantity =
            Number(
              oldItem.quantity
            );

          const product =
            await trx("products")
              .where(
                "id",
                oldItem.product_id
              )
              .where(
                "is_active",
                true
              )
              .first();

          if (!product) {
            throw new Error(
              `Product ${oldItem.product_id} not found`
            );
          }

          const currentStock =
            Number(
              product.current_stock || 0
            );

          const newStock =
            currentStock -
            oldQuantity;

          if (newStock < 0) {
            throw new Error(
              `Cannot update purchase. Stock for product ${oldItem.product_id} would become negative.`
            );
          }

          // Update product stock
          await trx("products")
            .where(
              "id",
              oldItem.product_id
            )
            .update({
              current_stock:
                String(newStock),

              updated_at:
                trx.fn.now(),
            });

          // Record reversal movement
          await trx("stock_movements")
            .insert({
              product_id:
                oldItem.product_id,

              movement_type:
                "adjustment",

              quantity:
                -oldQuantity,

              stock_after:
                newStock,

              sale_id:
                null,

              purchase_id:
                id,

              created_by:
                userId,

              reason:
                `Reversed old quantity from purchase ${existingPurchase.purchase_number}`,
            });
        }
      }

      // ==========================================
      // DELETE OLD PURCHASE ITEMS
      // ==========================================

      await trx("purchase_items")
        .where(
          "purchase_id",
          id
        )
        .delete();

      // ==========================================
      // INSERT NEW PURCHASE ITEMS
      // ==========================================

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
              purchase_id:
                id,

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

      // ==========================================
      // APPLY NEW STOCK
      // ==========================================

      if (
        (
          data.status ??
          existingPurchase.status
        ) === "completed"
      ) {

        for (const item of data.items) {

          const product =
            await trx("products")
              .where(
                "id",
                item.product_id
              )
              .where(
                "is_active",
                true
              )
              .first();

          if (!product) {
            throw new Error(
              `Product ${item.product_id} not found`
            );
          }

          const currentStock =
            Number(
              product.current_stock || 0
            );

          const quantity =
            Number(
              item.quantity
            );

          const newStock =
            currentStock +
            quantity;

          // Update stock
          await trx("products")
            .where(
              "id",
              item.product_id
            )
            .update({
              current_stock:
                String(newStock),

              updated_at:
                trx.fn.now(),
            });

          // Create purchase movement
          await trx("stock_movements")
            .insert({
              product_id:
                item.product_id,

              movement_type:
                "purchase",

              quantity:
                quantity,

              stock_after:
                newStock,

              sale_id:
                null,

              purchase_id:
                id,

              created_by:
                userId,

              reason:
                `Updated purchase ${existingPurchase.purchase_number}`,
            });
        }
      }

    } else {

      // ==========================================
      // NO ITEM CHANGES
      // ==========================================

      const totalAmount =
        Number(
          (
            subtotal -
            (
              subtotal *
              discountPercent
            ) /
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

    // ==========================================
    // 7. FINAL TOTALS
    // ==========================================

    const totalAmount =
      Number(
        (
          subtotal -
          (
            subtotal *
            discountPercent
          ) /
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

    // ==========================================
    // 8. UPDATE PURCHASE
    // ==========================================

    const [purchase] =
      await trx("purchases")
        .where(
          "id",
          id
        )
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

          updated_by:
            userId,

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

    // ==========================================
    // 9. GET FINAL ITEMS
    // ==========================================

    if (!items) {
      items =
        await trx("purchase_items")
          .where(
            "purchase_id",
            id
          )
          .orderBy(
            "id",
            "asc"
          );
    }

    return {
      ...purchase,
      items,
    };
  });
}

/* ==========================================
   NEXT PURCHASE NUMBER
========================================== */

export async function getNextPurchaseNumber(): Promise<string> {

  const lastPurchase =
    await db("purchases")
      .select(
        "purchase_number"
      )
      .orderBy(
        "id",
        "desc"
      )
      .first();

  if (!lastPurchase) {
    return "PUR00001";
  }

  const match =
    lastPurchase.purchase_number.match(
      /^PUR(\d+)$/
    );

  if (!match) {
    return "PUR00001";
  }

  const nextNumber =
    Number(match[1]) + 1;

  return `PUR${String(
    nextNumber
  ).padStart(5, "0")}`;
}