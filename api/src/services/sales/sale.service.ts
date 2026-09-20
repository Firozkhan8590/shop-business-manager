import db from "../../config/database";
import { CreateSaleInput, UpdateSaleInput } from "../../types/sales/sale.type";


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

        const existing = await trx("sales")
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
            data.customer_id !== undefined &&
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
                (item) => item.product_id
            );

        const products =
            await trx("products")
                .whereIn(
                    "id",
                    productIds
                )
                .select("id");

        if (
            products.length !==
            productIds.length
        ) {
            throw new Error(
                "One or more products not found"
            );
        }

        /* ---------------- Calculations ---------------- */

        const discountPercent =
            data.discount_percent ?? 0;

        const paidAmount =
            data.paid_amount ?? 0;

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
                        data.status ??
                        "completed",

                    notes:
                        data.notes ?? null,
                })
                .returning("*");

        /* ---------------- Sale Items ---------------- */

        await trx("sale_items").insert(
            data.items.map((item) => ({
                sale_id: sale.id,

                product_id:
                    item.product_id,

                quantity:
                    item.quantity,

                unit_price:
                    item.unit_price,

                total_amount:
                    item.quantity *
                    item.unit_price,
            }))
        );

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
    const query = db("sales as s")
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
                .where("id", id)
                .first();

        if (!existing) {
            throw new Error("Sale not found");
        }

        /* ---------------- Duplicate Invoice ---------------- */

        if (data.invoice_number) {
            const duplicate =
                await trx("sales")
                    .where(
                        "invoice_number",
                        data.invoice_number
                    )
                    .whereNot("id", id)
                    .first();

            if (duplicate) {
                throw new Error(
                    "Invoice number already exists"
                );
            }
        }

        /* ---------------- Customer ---------------- */

        if (
            data.customer_id !== undefined &&
            data.customer_id !== null
        ) {
            const customer =
                await trx("customers")
                    .where("id", data.customer_id)
                    .first();

            if (!customer) {
                throw new Error(
                    "Customer not found"
                );
            }
        }

        /* ---------------- Products ---------------- */

        if (data.items) {
            const productIds =
                data.items.map(
                    (item) => item.product_id
                );

            const products =
                await trx("products")
                    .whereIn(
                        "id",
                        productIds
                    )
                    .select("id");

            if (
                products.length !==
                productIds.length
            ) {
                throw new Error(
                    "One or more products not found"
                );
            }
        }

        /* ---------------- Existing Items ---------------- */

        const items =
            data.items ??
            (await trx("sale_items")
                .where("sale_id", id)
                .select(
                    "quantity",
                    "unit_price"
                ));

        const discountPercent =
            data.discount_percent !== undefined
                ? data.discount_percent
                : Number(
                    existing.discount_percent
                );

        const paidAmount =
            data.paid_amount !== undefined
                ? data.paid_amount
                : Number(
                    existing.paid_amount
                );

        const totals =
            calculateSaleTotals(
                items ?? [],
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

        /* ---------------- Update Header ---------------- */

        await trx("sales")
            .where("id", id)
            .update({
                invoice_number:
                    data.invoice_number ??
                    existing.invoice_number,

                customer_id:
                    data.customer_id !== undefined
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
                    data.status ??
                    existing.status,

                notes:
                    data.notes !== undefined
                        ? data.notes
                        : existing.notes,

                updated_at:
                    trx.fn.now(),
            });

        /* ---------------- Replace Items ---------------- */

        if (data.items) {
            await trx("sale_items")
                .where("sale_id", id)
                .del();

            await trx("sale_items")
                .insert(
                    data.items.map(
                        (item) => ({
                            sale_id: id,

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
    });

    /* ---------------- Fetch After Commit ---------------- */

    return getSaleById(id);
}