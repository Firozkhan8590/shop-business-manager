import db from "../../config/database";

import {
    CreateEstimateInput,
    UpdateEstimateInput,
} from "../../types/estimates/estimate.type";

// ==========================================
// CALCULATE TOTALS
// ==========================================

function calculateEstimateTotals(
    items: {
        quantity: number;
        unit_price: number;
    }[],
    discountPercent: number
) {
    const subtotal = items.reduce(
        (sum, item) =>
            sum +
            Number(item.quantity) *
                Number(item.unit_price),
        0
    );

    const discountAmount =
        (subtotal * discountPercent) / 100;

    const totalAmount =
        subtotal - discountAmount;

    return {
        subtotal: Number(
            subtotal.toFixed(2)
        ),

        totalAmount: Number(
            totalAmount.toFixed(2)
        ),
    };
}

// ==========================================
// GET NEXT ESTIMATE NUMBER
// ==========================================

export async function getNextEstimateNumber(): Promise<string> {
    const estimates = await db("estimates")
        .select("estimate_number")
        .orderBy("id", "desc");

    let highestNumber = 0;

    for (const estimate of estimates) {
        const estimateNumber = String(
            estimate.estimate_number || ""
        ).trim();

        const match =
            estimateNumber.match(/^EST(\d+)$/);

        if (!match) {
            continue;
        }

        const number = Number(match[1]);

        if (
            Number.isFinite(number) &&
            number > highestNumber
        ) {
            highestNumber = number;
        }
    }

    const nextNumber =
        highestNumber + 1;

    return `EST${String(nextNumber).padStart(5, "0")}`;
}

// ==========================================
// GET ESTIMATES
// ==========================================

export async function getEstimates(
    page = 1,
    limit = 20,
    search?: string,
    status?: string,
    customerId?: number
) {
    const offset =
        (page - 1) * limit;

    const query = db("estimates")
        .leftJoin(
            "customers",
            "estimates.customer_id",
            "customers.id"
        )
        .select(
            "estimates.*",
            "customers.name as customer_name"
        );

    // ----------------------------------------
    // SEARCH
    // ----------------------------------------

    if (search) {
        query.where(function () {
            this.where(
                "estimates.estimate_number",
                "ilike",
                `%${search}%`
            ).orWhere(
                "customers.name",
                "ilike",
                `%${search}%`
            );
        });
    }

    // ----------------------------------------
    // STATUS FILTER
    // ----------------------------------------

    if (status) {
        query.where(
            "estimates.status",
            status
        );
    }

    // ----------------------------------------
    // CUSTOMER FILTER
    // ----------------------------------------

    if (customerId) {
        query.where(
            "estimates.customer_id",
            customerId
        );
    }

    // ----------------------------------------
    // COUNT
    // ----------------------------------------

    const countResult =
        await query
            .clone()
            .clearSelect()
            .clearOrder()
            .count(
                "estimates.id as count"
            )
            .first();

    const total = Number(
        countResult?.count || 0
    );

    // ----------------------------------------
    // DATA
    // ----------------------------------------

    const data = await query
        .orderBy(
            "estimates.id",
            "desc"
        )
        .limit(limit)
        .offset(offset);

    return {
        data,

        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(
                total / limit
            ),
        },
    };
}

// ==========================================
// GET ESTIMATE BY ID
// ==========================================

export async function getEstimateById(
    id: number
) {
    const estimate =
        await db("estimates")
            .select("estimates.*")
            .where(
                "estimates.id",
                id
            )
            .first();

    if (!estimate) {
        return null;
    }

    const items =
        await db("estimate_items")
            .select(
                "id",
                "estimate_id",
                "product_id",
                "quantity",
                "unit_price",
                "total_amount",
                "created_at"
            )
            .where(
                "estimate_id",
                id
            )
            .orderBy(
                "id",
                "asc"
            );

    return {
        ...estimate,
        items,
    };
}

// ==========================================
// CREATE ESTIMATE
// ==========================================

export async function createEstimate(
    data: CreateEstimateInput,
    userId: number | null
) {
    return db.transaction(
        async (trx) => {

            // --------------------------------
            // CHECK DUPLICATE ESTIMATE NUMBER
            // --------------------------------

            const existing =
                await trx("estimates")
                    .where(
                        "estimate_number",
                        data.estimate_number
                    )
                    .first();

            if (existing) {
                throw new Error(
                    "Estimate number already exists"
                );
            }

            // --------------------------------
            // CHECK CUSTOMER
            // --------------------------------

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

            // --------------------------------
            // CHECK PRODUCTS
            // --------------------------------

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

            // --------------------------------
            // CALCULATE TOTALS
            // --------------------------------

            const discountPercent =
                data.discount_percent ?? 0;

            const totals =
                calculateEstimateTotals(
                    data.items,
                    discountPercent
                );

            // --------------------------------
            // CREATE ESTIMATE
            // --------------------------------

            const [estimate] =
                await trx("estimates")
                    .insert({
                        estimate_number:
                            data.estimate_number,

                        customer_id:
                            data.customer_id ??
                            null,

                        created_by:
                            userId,

                        updated_by:
                            userId,

                        estimate_date:
                            data.estimate_date,

                        valid_until:
                            data.valid_until ??
                            null,

                        subtotal:
                            totals.subtotal,

                        discount_percent:
                            discountPercent,

                        total_amount:
                            totals.totalAmount,

                        status:
                            data.status ??
                            "draft",

                        notes:
                            data.notes ??
                            null,
                    })
                    .returning([
                        "id",
                        "estimate_number",
                        "customer_id",
                        "created_by",
                        "updated_by",
                        "estimate_date",
                        "valid_until",
                        "subtotal",
                        "discount_percent",
                        "total_amount",
                        "status",
                        "notes",
                        "created_at",
                        "updated_at",
                    ]);

            // --------------------------------
            // CREATE ITEMS
            // --------------------------------

            const estimateItems = [];

            for (const item of data.items) {
                const itemTotal =
                    Number(item.quantity) *
                    Number(item.unit_price);

                const [estimateItem] =
                    await trx(
                        "estimate_items"
                    )
                        .insert({
                            estimate_id:
                                estimate.id,

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
                            "estimate_id",
                            "product_id",
                            "quantity",
                            "unit_price",
                            "total_amount",
                            "created_at",
                        ]);

                estimateItems.push(
                    estimateItem
                );
            }

            // IMPORTANT:
            // Estimate creation does NOT
            // modify product stock.

            return {
                ...estimate,
                items: estimateItems,
            };
        }
    );
}

// ==========================================
// UPDATE ESTIMATE
// ==========================================

export async function updateEstimate(
    id: number,
    data: UpdateEstimateInput,
    userId: number | null
) {
    return db.transaction(
        async (trx) => {

            // --------------------------------
            // GET EXISTING ESTIMATE
            // --------------------------------

            const existing =
                await trx("estimates")
                    .where("id", id)
                    .first();

            if (!existing) {
                throw new Error(
                    "Estimate not found"
                );
            }

            // --------------------------------
            // CHECK DUPLICATE NUMBER
            // --------------------------------

            if (
                data.estimate_number !==
                undefined
            ) {
                const duplicate =
                    await trx("estimates")
                        .where(
                            "estimate_number",
                            data.estimate_number
                        )
                        .whereNot(
                            "id",
                            id
                        )
                        .first();

                if (duplicate) {
                    throw new Error(
                        "Estimate number already exists"
                    );
                }
            }

            // --------------------------------
            // CHECK CUSTOMER
            // --------------------------------

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

            // --------------------------------
            // DISCOUNT
            // --------------------------------

            const discountPercent =
                data.discount_percent !==
                undefined
                    ? data.discount_percent
                    : Number(
                          existing.discount_percent
                      );

            // --------------------------------
            // CURRENT SUBTOTAL
            // --------------------------------

            let subtotal =
                Number(
                    existing.subtotal
                );

            let items;

            // --------------------------------
            // UPDATE ITEMS
            // --------------------------------

            if (data.items) {

                // Check products
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

                // Recalculate subtotal
                const totals =
                    calculateEstimateTotals(
                        data.items,
                        discountPercent
                    );

                subtotal =
                    totals.subtotal;

                // Delete old items
                await trx(
                    "estimate_items"
                )
                    .where(
                        "estimate_id",
                        id
                    )
                    .delete();

                items = [];

                // Insert new items
                for (
                    const item of data.items
                ) {
                    const itemTotal =
                        Number(
                            item.quantity
                        ) *
                        Number(
                            item.unit_price
                        );

                    const [
                        estimateItem,
                    ] = await trx(
                        "estimate_items"
                    )
                        .insert({
                            estimate_id: id,

                            product_id:
                                item.product_id,

                            quantity:
                                item.quantity,

                            unit_price:
                                item.unit_price,

                            total_amount:
                                Number(
                                    itemTotal.toFixed(
                                        2
                                    )
                                ),
                        })
                        .returning([
                            "id",
                            "estimate_id",
                            "product_id",
                            "quantity",
                            "unit_price",
                            "total_amount",
                            "created_at",
                        ]);

                    items.push(
                        estimateItem
                    );
                }
            }

            // --------------------------------
            // CALCULATE FINAL TOTAL
            // --------------------------------

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

            // --------------------------------
            // UPDATE ESTIMATE
            // --------------------------------

            const [estimate] =
                await trx("estimates")
                    .where(
                        "id",
                        id
                    )
                    .update({
                        ...(data.estimate_number !==
                            undefined && {
                            estimate_number:
                                data.estimate_number,
                        }),

                        ...(data.customer_id !==
                            undefined && {
                            customer_id:
                                data.customer_id,
                        }),

                        ...(data.estimate_date !==
                            undefined && {
                            estimate_date:
                                data.estimate_date,
                        }),

                        ...(data.valid_until !==
                            undefined && {
                            valid_until:
                                data.valid_until,
                        }),

                        subtotal,

                        discount_percent:
                            discountPercent,

                        total_amount:
                            totalAmount,

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
                        "estimate_number",
                        "customer_id",
                        "created_by",
                        "updated_by",
                        "estimate_date",
                        "valid_until",
                        "subtotal",
                        "discount_percent",
                        "total_amount",
                        "status",
                        "notes",
                        "created_at",
                        "updated_at",
                    ]);

            // --------------------------------
            // GET ITEMS IF NOT UPDATED
            // --------------------------------

            if (!items) {
                items =
                    await trx(
                        "estimate_items"
                    )
                        .where(
                            "estimate_id",
                            id
                        )
                        .orderBy(
                            "id",
                            "asc"
                        );
            }

            return {
                ...estimate,
                items,
            };
        }
    );
}

// ==========================================
// DELETE ESTIMATE
// ==========================================

export async function deleteEstimate(
    id: number
) {
    const deleted =
        await db("estimates")
            .where(
                "id",
                id
            )
            .delete();

    if (!deleted) {
        throw new Error(
            "Estimate not found"
        );
    }

    return true;
}