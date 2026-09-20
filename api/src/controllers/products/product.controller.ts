import type { Request, Response } from "express";

import {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deactivateProduct,
} from "../../services/products/product.service";

export async function createProductController(
    req: Request,
    res: Response
): Promise<void> {
    try {
        const product = await createProduct(req.body);

        res.status(201).json({
            success: true,
            message: "Product created successfully",
            data: product,
        });
    } catch (error) {
        console.error("Create product error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create product",
        });
    }
}

export async function getProductsController(
    req: Request,
    res: Response
): Promise<void> {
    try {
        const products = await getProducts();

        res.status(200).json({
            success: true,
            data: products,
        });
    } catch (error) {
        console.error("Get products error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch products",
        });
    }
}

export async function getProductByIdController(
    req: Request,
    res: Response
): Promise<void> {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            res.status(400).json({
                success: false,
                message: "Invalid product ID",
            });
            return;
        }

        const product = await getProductById(id);

        if (!product) {
            res.status(404).json({
                success: false,
                message: "Product not found",
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: product,
        });
    } catch (error) {
        console.error("Get product error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to fetch product",
        });
    }
}

export async function updateProductController(
    req: Request,
    res: Response
): Promise<void> {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            res.status(400).json({
                success: false,
                message: "Invalid product ID",
            });
            return;
        }

        const product = await updateProduct(id, req.body);

        if (!product) {
            res.status(404).json({
                success: false,
                message: "Product not found",
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: "Product updated successfully",
            data: product,
        });
    } catch (error) {
        console.error("Update product error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update product",
        });
    }
}

export async function deactivateProductController(
    req: Request,
    res: Response
): Promise<void> {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            res.status(400).json({
                success: false,
                message: "Invalid product ID",
            });
            return;
        }

        const product = await deactivateProduct(id);

        if (!product) {
            res.status(404).json({
                success: false,
                message: "Product not found",
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: "Product deactivated successfully",
            data: product,
        });
    } catch (error) {
        console.error("Deactivate product error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to deactivate product",
        });
    }
}