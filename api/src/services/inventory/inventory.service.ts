import db from "../../config/database";
import { InventoryListQuery, MovementListQuery, StockAdjustmentInput, StockReturnInput } from "../../types/inventory/inventory.type";


class InventoryService {

    // ==========================================
    // GET INVENTORY
    // ==========================================

    async getInventory(
        query: InventoryListQuery
    ) {
        const page = query.page || 1;
        const limit = query.limit || 20;
        const offset = (page - 1) * limit;

        const baseQuery = db("products")
            .select(
                "id as product_id",
                "name as product_name",
                "unit",
                "current_stock",
                "minimum_stock"
            )
            .where(
                "is_active",
                true
            );

        // Search
        if (query.search?.trim()) {
            const search =
                `%${query.search.trim()}%`;

            baseQuery.whereILike(
                "name",
                search
            );
        }

        // Low stock
        if (query.low_stock) {
            baseQuery.whereRaw(
                "current_stock > 0 AND current_stock <= minimum_stock"
            );
        }

        // Out of stock
        if (query.out_of_stock) {
            baseQuery.where(
                "current_stock",
                "<=",
                0
            );
        }

        const data =
            await baseQuery
                .clone()
                .orderBy(
                    "name",
                    "asc"
                )
                .limit(limit)
                .offset(offset);

        const countQuery =
            db("products")
                .where(
                    "is_active",
                    true
                );

        if (query.search?.trim()) {
            const search =
                `%${query.search.trim()}%`;

            countQuery.whereILike(
                "name",
                search
            );
        }

        if (query.low_stock) {
            countQuery.whereRaw(
                "current_stock > 0 AND current_stock <= minimum_stock"
            );
        }

        if (query.out_of_stock) {
            countQuery.where(
                "current_stock",
                "<=",
                0
            );
        }

        const countResult =
            await countQuery
                .count<{ count: string }[]>(
                    "id as count"
                )
                .first();

        const total =
            Number(
                countResult?.count || 0
            );

        return {
            data,

            pagination: {
                page,
                limit,
                total,
                totalPages:
                    Math.ceil(
                        total / limit
                    ),
            },
        };
    }

    // ==========================================
    // GET PRODUCT STOCK
    // ==========================================

    async getProductStock(
        productId: number
    ) {
        const product =
            await db("products")
                .where(
                    "id",
                    productId
                )
                .where(
                    "is_active",
                    true
                )
                .first();

        if (!product) {
            throw new Error(
                "Product not found"
            );
        }

        return {
            product_id:
                Number(product.id),

            product_name:
                product.name,

            unit:
                product.unit,

            current_stock:
                String(
                    product.current_stock
                ),

            minimum_stock:
                String(
                    product.minimum_stock
                ),
        };
    }

    // ==========================================
    // GET STOCK MOVEMENTS
    // ==========================================

    async getMovements(
        productId: number,
        query: MovementListQuery
    ) {
        const page =
            query.page || 1;

        const limit =
            query.limit || 20;

        const offset =
            (page - 1) * limit;

        const product =
            await db("products")
                .where(
                    "id",
                    productId
                )
                .first();

        if (!product) {
            throw new Error(
                "Product not found"
            );
        }

        const movementQuery =
            db("stock_movements as sm")
                .leftJoin(
                    "products as p",
                    "p.id",
                    "sm.product_id"
                )
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
                    "sm.created_by",
                    "sm.reason",
                    "sm.created_at"
                )
                .where(
                    "sm.product_id",
                    productId
                );

        if (query.movement_type) {
            movementQuery.where(
                "sm.movement_type",
                query.movement_type
            );
        }

        if (query.start_date) {
            movementQuery.where(
                "sm.created_at",
                ">=",
                `${query.start_date} 00:00:00`
            );
        }

        if (query.end_date) {
            movementQuery.where(
                "sm.created_at",
                "<",
                `${query.end_date} 00:00:00`
            );
        }

        const data =
            await movementQuery
                .orderBy(
                    "sm.id",
                    "desc"
                )
                .limit(limit)
                .offset(offset);

        const countResult =
            await movementQuery
                .clone()
                .clearSelect()
                .clearOrder()
                .count<{ count: string }[]>(
                    "sm.id as count"
                )
                .first();

        const total =
            Number(
                countResult?.count || 0
            );

        return {
            data,

            pagination: {
                page,
                limit,
                total,
                totalPages:
                    Math.ceil(
                        total / limit
                    ),
            },
        };
    }

    // ==========================================
    // STOCK ADJUSTMENT
    // ==========================================

    async adjustStock(
        input: StockAdjustmentInput,
        createdBy: number | null
    ) {
        return db.transaction(
            async (trx) => {

                const product =
                    await trx("products")
                        .where(
                            "id",
                            input.product_id
                        )
                        .where(
                            "is_active",
                            true
                        )
                        .first();

                if (!product) {
                    throw new Error(
                        "Product not found"
                    );
                }

                const currentStock =
                    Number(
                        product.current_stock
                    );

                const newStock =
                    currentStock +
                    input.quantity;

                if (newStock < 0) {
                    throw new Error(
                        "Adjustment would result in negative stock"
                    );
                }

                // Update product stock
                await trx("products")
                    .where(
                        "id",
                        input.product_id
                    )
                    .update({
                        current_stock:
                            newStock,
                        updated_at:
                            trx.fn.now(),
                    });

                // Create movement
                const [movement] =
                    await trx(
                        "stock_movements"
                    )
                        .insert({
                            product_id:
                                input.product_id,

                            movement_type:
                                "adjustment",

                            quantity:
                                input.quantity,

                            stock_after:
                                newStock,

                            created_by:
                                createdBy,

                            reason:
                                input.reason,
                        })
                        .returning("*");

                return movement;
            }
        );
    }

    // ==========================================
    // STOCK RETURN
    // ==========================================

    async addReturn(
        input: StockReturnInput,
        createdBy: number | null
    ) {
        return db.transaction(
            async (trx) => {

                const product =
                    await trx("products")
                        .where(
                            "id",
                            input.product_id
                        )
                        .where(
                            "is_active",
                            true
                        )
                        .first();

                if (!product) {
                    throw new Error(
                        "Product not found"
                    );
                }

                const currentStock =
                    Number(
                        product.current_stock
                    );

                const newStock =
                    currentStock +
                    input.quantity;

                // Update product stock
                await trx("products")
                    .where(
                        "id",
                        input.product_id
                    )
                    .update({
                        current_stock:
                            newStock,
                        updated_at:
                            trx.fn.now(),
                    });

                // Create movement
                const [movement] =
                    await trx(
                        "stock_movements"
                    )
                        .insert({
                            product_id:
                                input.product_id,

                            movement_type:
                                "return",

                            quantity:
                                input.quantity,

                            stock_after:
                                newStock,

                            created_by:
                                createdBy,

                            reason:
                                input.reason,
                        })
                        .returning("*");

                return movement;
            }
        );
    }
}

export default new InventoryService();