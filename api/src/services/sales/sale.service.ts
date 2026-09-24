import db from "../../config/database";
import {
    CreateSaleInput,
    UpdateSaleInput,
} from "../../types/sales/sale.type";

/* ============================================================
   HELPERS
============================================================ */

function calculateSaleTotals(
    items: {
        quantity: number;
        unit_price: number;
    }[],
    discountPercent: number,
    paidAmount: number
) {
    const subtotal = items.reduce(
        (sum, item) =>
            sum +
            item.quantity *
                item.unit_price,
        0
    );

    const discountAmount =
        subtotal *
        (discountPercent / 100);

    const totalAmount =
        subtotal - discountAmount;

    const balanceAmount =
        totalAmount - paidAmount;

    return {
        subtotal,
        discountAmount,
        totalAmount,
        balanceAmount,
    };
}

/**
 * Only completed sales affect stock.
 */
function isSaleStockActive(
    status: string | null | undefined
) {
    return (
        String(status ?? "").toLowerCase() ===
        "completed"
    );
}

/**
 * Keep stock values within products.current_stock
 * precision of DECIMAL(12,3).
 */
function roundStock(value: number) {
    return Number(value.toFixed(3));
}

/**
 * Aggregate quantities by product.
 *
 * Example:
 *
 * product 5 +10
 * product 5 +5
 *
 * becomes:
 *
 * product 5 +15
 */
function aggregateQuantities(
    items: {
        product_id: number;
        quantity: number | string;
    }[]
) {
    const quantities =
        new Map<number, number>();

    for (const item of items) {
        const productId =
            Number(item.product_id);

        const quantity =
            Number(item.quantity);

        const current =
            quantities.get(productId) ?? 0;

        quantities.set(
            productId,
            roundStock(
                current + quantity
            )
        );
    }

    return quantities;
}

/**
 * Apply stock changes for a sale.
 *
 * Negative quantity = stock OUT
 * Positive quantity = stock IN
 *
 * Example:
 *
 * Sale +5:
 * quantity = -5
 *
 * Sale edited from 10 → 5:
 * delta = +5
 *
 * Sale edited from 5 → 10:
 * delta = -5
 */
async function applySaleStockChanges(
    trx: any,
    saleId: number,
    quantities: Map<number, number>,
    userId: number | undefined | null,
    reason: string
) {
    for (const [
        productId,
        quantityChange,
    ] of quantities.entries()) {

        if (quantityChange === 0) {
            continue;
        }

        /* ------------------------------------------
           Lock product row
        ------------------------------------------ */

        const product =
            await trx("products")
                .where(
                    "id",
                    productId
                )
                .where(
                    "is_active",
                    true
                )
                .forUpdate()
                .first();

        if (!product) {
            throw new Error(
                `Product ${productId} not found`
            );
        }

        const currentStock =
            Number(
                product.current_stock ?? 0
            );

        const newStock =
            roundStock(
                currentStock +
                    quantityChange
            );

        /* ------------------------------------------
           Prevent negative stock
        ------------------------------------------ */

        if (newStock < 0) {
            throw new Error(
                `Insufficient stock for product ${productId}. Available stock: ${currentStock}, required change: ${quantityChange}`
            );
        }

        /* ------------------------------------------
           Update current stock
        ------------------------------------------ */

        await trx("products")
            .where(
                "id",
                productId
            )
            .update({
                current_stock:
                    String(newStock),

                updated_at:
                    trx.fn.now(),
            });

        /* ------------------------------------------
           Create stock movement
        ------------------------------------------ */

        await trx("stock_movements")
            .insert({
                product_id:
                    productId,

                movement_type:
                    "sale",

                quantity:
                    quantityChange,

                stock_after:
                    newStock,

                sale_id:
                    saleId,

                purchase_id:
                    null,

                created_by:
                    userId ?? null,

                reason,
            });
    }
}

/* ============================================================
   NEXT INVOICE NUMBER
============================================================ */

export async function getNextInvoiceNumber() {
    const lastSale = await db("sales")
        .select("invoice_number")
        .where(
            "invoice_number",
            "like",
            "INV%"
        )
        .orderBy("id", "desc")
        .first();

    if (!lastSale) {
        return "INV00001";
    }

    const match =
        String(
            lastSale.invoice_number
        ).match(/^INV(\d+)$/);

    if (!match) {
        return "INV00001";
    }

    const nextNumber =
        Number(match[1]) + 1;

    return `INV${String(
        nextNumber
    ).padStart(5, "0")}`;
}

/* ============================================================
   CREATE SALE
============================================================ */

export async function createSale(
    data: CreateSaleInput,
    userId?: number
) {
    return db.transaction(async (trx) => {

        /* ---------------- Duplicate Invoice ---------------- */

        const existing =
            await trx("sales")
                .where(
                    "invoice_number",
                    data.invoice_number
                )
                .first();

        if (existing) {
            throw new Error(
                "Invoice number already exists"
            );
        }

        /* ---------------- Customer ---------------- */

        if (
            data.customer_id !==
                undefined &&
            data.customer_id !== null
        ) {
            const customer =
                await trx("customers")
                    .where(
                        "id",
                        data.customer_id
                    )
                    .first();

            if (!customer) {
                throw new Error(
                    "Customer not found"
                );
            }
        }

        /* ---------------- Products ---------------- */

        const productIds =
            data.items.map(
                (item) =>
                    item.product_id
            );

        const uniqueProductIds =
            [...new Set(productIds)];

        const products =
            await trx("products")
                .whereIn(
                    "id",
                    uniqueProductIds
                )
                .where(
                    "is_active",
                    true
                )
                .select(
                    "id",
                    "name",
                    "current_stock"
                );

        if (
            products.length !==
            uniqueProductIds.length
        ) {
            throw new Error(
                "One or more products not found"
            );
        }

        /* ---------------- Calculations ---------------- */

        const discountPercent =
            data.discount_percent ??
            0;

        const paidAmount =
            data.paid_amount ??
            0;

        const totals =
            calculateSaleTotals(
                data.items,
                discountPercent,
                paidAmount
            );

        if (
            paidAmount >
            totals.totalAmount
        ) {
            throw new Error(
                "Paid amount cannot exceed total amount"
            );
        }

        const saleStatus =
            data.status ??
            "completed";

        /* =====================================================
           STOCK CHECK
        ===================================================== */

        if (
            isSaleStockActive(
                saleStatus
            )
        ) {
            const quantities =
                aggregateQuantities(
                    data.items
                );

            for (const [
                productId,
                quantity,
            ] of quantities.entries()) {

                const product =
                    products.find(
                        (item: any) =>
                            Number(
                                item.id
                            ) ===
                            productId
                    );

                if (!product) {
                    throw new Error(
                        `Product ${productId} not found`
                    );
                }

                const currentStock =
                    Number(
                        product.current_stock ??
                            0
                    );

                if (
                    currentStock <
                    quantity
                ) {
                    throw new Error(
                        `Insufficient stock for product ${productId}. Available stock: ${currentStock}, required: ${quantity}`
                    );
                }
            }
        }

        /* ---------------- Sale ---------------- */

        const [sale] =
            await trx("sales")
                .insert({
                    invoice_number:
                        data.invoice_number,

                    customer_id:
                        data.customer_id ??
                        null,

                    created_by:
                        userId ?? null,

                    sale_date:
                        data.sale_date,

                    payment_method:
                        data.payment_method ??
                        "cash",

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
                        saleStatus,

                    notes:
                        data.notes ?? null,
                })
                .returning("*");

        /* ---------------- Sale Items ---------------- */

        await trx("sale_items").insert(
            data.items.map(
                (item) => ({
                    sale_id:
                        sale.id,

                    product_id:
                        item.product_id,

                    quantity:
                        item.quantity,

                    unit_price:
                        item.unit_price,

                    total_amount:
                        item.quantity *
                        item.unit_price,
                })
            )
        );

        /* =====================================================
           STOCK OUT
        ===================================================== */

        if (
            isSaleStockActive(
                saleStatus
            )
        ) {
            const quantities =
                aggregateQuantities(
                    data.items
                );

            /*
             * Sale removes stock.
             *
             * Example:
             * quantity = 5
             * stock change = -5
             */

            for (const [
                productId,
                quantity,
            ] of quantities.entries()) {
                quantities.set(
                    productId,
                    -quantity
                );
            }

            await applySaleStockChanges(
                trx,
                sale.id,
                quantities,
                userId,
                `Sale ${sale.invoice_number}`
            );
        }

        /* ---------------- Fetch Items ---------------- */

        const items =
            await trx("sale_items")
                .where(
                    "sale_id",
                    sale.id
                )
                .select("*");

        return {
            ...sale,
            items,
        };
    });
}

/* ============================================================
   LIST SALES
============================================================ */

export async function listSales(
    date?: string
) {
    const query =
        db("sales as s")
            .leftJoin(
                "customers as c",
                "s.customer_id",
                "c.id"
            )
            .select(
                "s.*",
                "c.name as customer_name"
            );

    /* ---------------- Date Filter ---------------- */

    if (date) {
        query.where(
            "s.sale_date",
            date
        );
    }

    return query.orderBy(
        "s.id",
        "desc"
    );
}

/* ============================================================
   GET SALE
============================================================ */

export async function getSaleById(
    id: number
) {
    const sale =
        await db("sales as s")
            .leftJoin(
                "customers as c",
                "s.customer_id",
                "c.id"
            )
            .where(
                "s.id",
                id
            )
            .select(
                "s.*",
                "c.name as customer_name"
            )
            .first();

    if (!sale) {
        throw new Error(
            "Sale not found"
        );
    }

    const items =
        await db("sale_items")
            .where(
                "sale_id",
                id
            )
            .select("*");

    return {
        ...sale,
        items,
    };
}

/* ============================================================
   UPDATE SALE
============================================================ */

export async function updateSale(
    id: number,
    data: UpdateSaleInput,
    userId?: number
) {
    await db.transaction(async (trx) => {

        /* ---------------- Existing Sale ---------------- */

        const existing =
            await trx("sales")
                .where(
                    "id",
                    id
                )
                .first();

        if (!existing) {
            throw new Error(
                "Sale not found"
            );
        }

        /* ---------------- Existing Items ---------------- */

        const oldItems =
            await trx("sale_items")
                .where(
                    "sale_id",
                    id
                )
                .select(
                    "product_id",
                    "quantity",
                    "unit_price"
                );

        /* ---------------- Duplicate Invoice ---------------- */

        if (data.invoice_number) {
            const duplicate =
                await trx("sales")
                    .where(
                        "invoice_number",
                        data.invoice_number
                    )
                    .whereNot(
                        "id",
                        id
                    )
                    .first();

            if (duplicate) {
                throw new Error(
                    "Invoice number already exists"
                );
            }
        }

        /* ---------------- Customer ---------------- */

        if (
            data.customer_id !==
                undefined &&
            data.customer_id !== null
        ) {
            const customer =
                await trx("customers")
                    .where(
                        "id",
                        data.customer_id
                    )
                    .first();

            if (!customer) {
                throw new Error(
                    "Customer not found"
                );
            }
        }

        /* ---------------- New Items ---------------- */

        const newItems =
            data.items ??
            oldItems;

        /* ---------------- Products ---------------- */

        if (data.items) {

            const productIds =
                data.items.map(
                    (item) =>
                        item.product_id
                );

            const uniqueProductIds =
                [
                    ...new Set(
                        productIds
                    ),
                ];

            const products =
                await trx("products")
                    .whereIn(
                        "id",
                        uniqueProductIds
                    )
                    .where(
                        "is_active",
                        true
                    )
                    .select(
                        "id"
                    );

            if (
                products.length !==
                uniqueProductIds.length
            ) {
                throw new Error(
                    "One or more products not found"
                );
            }
        }

        /* ---------------- Totals ---------------- */

        const discountPercent =
            data.discount_percent !==
            undefined
                ? data.discount_percent
                : Number(
                      existing.discount_percent
                  );

        const paidAmount =
            data.paid_amount !==
            undefined
                ? data.paid_amount
                : Number(
                      existing.paid_amount
                  );

        const totals =
            calculateSaleTotals(
                newItems,
                discountPercent,
                paidAmount
            );

        if (
            paidAmount >
            totals.totalAmount
        ) {
            throw new Error(
                "Paid amount cannot exceed total amount"
            );
        }

        const newStatus =
            data.status ??
            existing.status;

        /* =====================================================
           CALCULATE STOCK DELTA
        ===================================================== */

        const oldStockActive =
            isSaleStockActive(
                existing.status
            );

        const newStockActive =
            isSaleStockActive(
                newStatus
            );

        const oldQuantities =
            aggregateQuantities(
                oldItems
            );

        const newQuantities =
            aggregateQuantities(
                newItems
            );

        const stockChanges =
            new Map<number, number>();

        const allProductIds =
            new Set<number>([
                ...oldQuantities.keys(),
                ...newQuantities.keys(),
            ]);

        for (const productId of allProductIds) {

            const oldQuantity =
                oldStockActive
                    ? (
                          oldQuantities.get(
                              productId
                          ) ?? 0
                      )
                    : 0;

            const newQuantity =
                newStockActive
                    ? (
                          newQuantities.get(
                              productId
                          ) ?? 0
                      )
                    : 0;

            /*
             * Sale stock logic:
             *
             * Old sale 10
             * New sale 15
             *
             * Delta = 15 - 10 = +5
             * Stock must decrease by 5
             *
             * Therefore:
             *
             * stockChange = -(new - old)
             */

            const stockChange =
                roundStock(
                    -(
                        newQuantity -
                        oldQuantity
                    )
                );

            if (
                stockChange !== 0
            ) {
                stockChanges.set(
                    productId,
                    stockChange
                );
            }
        }

        /* =====================================================
           CHECK STOCK BEFORE UPDATING
        ===================================================== */

        for (const [
            productId,
            stockChange,
        ] of stockChanges.entries()) {

            const product =
                await trx("products")
                    .where(
                        "id",
                        productId
                    )
                    .where(
                        "is_active",
                        true
                    )
                    .forUpdate()
                    .first();

            if (!product) {
                throw new Error(
                    `Product ${productId} not found`
                );
            }

            const currentStock =
                Number(
                    product.current_stock ??
                        0
                );

            const newStock =
                roundStock(
                    currentStock +
                        stockChange
                );

            if (
                newStock < 0
            ) {
                throw new Error(
                    `Insufficient stock for product ${productId}. Available stock: ${currentStock}`
                );
            }
        }

        /* =====================================================
           UPDATE SALE HEADER
        ===================================================== */

        await trx("sales")
            .where(
                "id",
                id
            )
            .update({
                invoice_number:
                    data.invoice_number ??
                    existing.invoice_number,

                customer_id:
                    data.customer_id !==
                    undefined
                        ? data.customer_id
                        : existing.customer_id,

                updated_by:
                    userId ?? null,

                sale_date:
                    data.sale_date ??
                    existing.sale_date,

                payment_method:
                    data.payment_method ??
                    existing.payment_method,

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
                    newStatus,

                notes:
                    data.notes !==
                    undefined
                        ? data.notes
                        : existing.notes,

                updated_at:
                    trx.fn.now(),
            });

        /* =====================================================
           REPLACE SALE ITEMS
        ===================================================== */

        if (data.items) {

            await trx("sale_items")
                .where(
                    "sale_id",
                    id
                )
                .del();

            await trx("sale_items")
                .insert(
                    data.items.map(
                        (item) => ({
                            sale_id:
                                id,

                            product_id:
                                item.product_id,

                            quantity:
                                item.quantity,

                            unit_price:
                                item.unit_price,

                            total_amount:
                                item.quantity *
                                item.unit_price,
                        })
                    )
                );
        }

        /* =====================================================
           APPLY STOCK CHANGES
        ===================================================== */

        if (
            stockChanges.size > 0
        ) {

            await applySaleStockChanges(
                trx,
                id,
                stockChanges,
                userId,
                `Updated sale ${
                    data.invoice_number ??
                    existing.invoice_number
                }`
            );
        }
    });

    /* ---------------- Fetch After Commit ---------------- */

    return getSaleById(id);
}