import { Request, Response } from "express";

import {
    inventoryListQuerySchema,
    movementListQuerySchema,
    stockAdjustmentSchema,
    stockReturnSchema,
} from "../../validators/inventory/inventory.validator";

import inventoryService from "../../services/inventory/inventory.service";

class InventoryController {

    // ==========================================
    // GET INVENTORY
    // ==========================================

    async getInventory(
        req: Request,
        res: Response
    ) {
        try {
            const query =
                inventoryListQuerySchema.parse(
                    req.query
                );

            const result =
                await inventoryService.getInventory(
                    query
                );

            return res.status(200).json({
                success: true,
                message:
                    "Inventory fetched successfully",
                ...result,
            });

        } catch (error: any) {

            console.error(
                "Get inventory error:",
                error
            );

            return res.status(400).json({
                success: false,
                message:
                    error?.message ||
                    "Failed to fetch inventory",
            });
        }
    }

    // ==========================================
    // GET PRODUCT STOCK
    // ==========================================

    async getProductStock(
        req: Request,
        res: Response
    ) {
        try {
            const productId =
                Number(
                    req.params.productId
                );

            if (
                !Number.isInteger(
                    productId
                ) ||
                productId <= 0
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid product ID",
                });
            }

            const result =
                await inventoryService.getProductStock(
                    productId
                );

            return res.status(200).json({
                success: true,
                message:
                    "Product stock fetched successfully",
                data: result,
            });

        } catch (error: any) {

            return res.status(
                error?.message ===
                    "Product not found"
                    ? 404
                    : 400
            ).json({
                success: false,
                message:
                    error?.message ||
                    "Failed to fetch product stock",
            });
        }
    }

    // ==========================================
    // GET STOCK MOVEMENTS
    // ==========================================

    async getMovements(
        req: Request,
        res: Response
    ) {
        try {
            const productId =
                Number(
                    req.params.productId
                );

            if (
                !Number.isInteger(
                    productId
                ) ||
                productId <= 0
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Invalid product ID",
                });
            }

            const query =
                movementListQuerySchema.parse(
                    req.query
                );

            const result =
                await inventoryService.getMovements(
                    productId,
                    query
                );

            return res.status(200).json({
                success: true,
                message:
                    "Stock movements fetched successfully",
                ...result,
            });

        } catch (error: any) {

            return res.status(400).json({
                success: false,
                message:
                    error?.message ||
                    "Failed to fetch stock movements",
            });
        }
    }

    // ==========================================
    // STOCK ADJUSTMENT
    // ==========================================

    async adjustStock(
        req: Request,
        res: Response
    ) {
        try {
            const data =
                stockAdjustmentSchema.parse(
                    req.body
                );

            const createdBy =
                Number(
                    (req as any).user?.id
                );

            const result =
                await inventoryService.adjustStock(
                    data,
                    Number.isInteger(
                        createdBy
                    )
                        ? createdBy
                        : null
                );

            return res.status(201).json({
                success: true,
                message:
                    "Stock adjusted successfully",
                data: result,
            });

        } catch (error: any) {

            console.error(
                "Stock adjustment error:",
                error
            );

            return res.status(400).json({
                success: false,
                message:
                    error?.message ||
                    "Failed to adjust stock",
            });
        }
    }

    // ==========================================
    // STOCK RETURN
    // ==========================================

    async addReturn(
        req: Request,
        res: Response
    ) {
        try {
            const data =
                stockReturnSchema.parse(
                    req.body
                );

            const createdBy =
                Number(
                    (req as any).user?.id
                );

            const result =
                await inventoryService.addReturn(
                    data,
                    Number.isInteger(
                        createdBy
                    )
                        ? createdBy
                        : null
                );

            return res.status(201).json({
                success: true,
                message:
                    "Stock return added successfully",
                data: result,
            });

        } catch (error: any) {

            console.error(
                "Stock return error:",
                error
            );

            return res.status(400).json({
                success: false,
                message:
                    error?.message ||
                    "Failed to add stock return",
            });
        }
    }
}

export default new InventoryController();