import { Request, Response } from "express";

import {
    createEstimate,
    deleteEstimate,
    getEstimateById,
    getEstimates,
    getNextEstimateNumber,
    updateEstimate,
} from "../../services/estimates/estimate.service";

import {
    CreateEstimateInput,
    UpdateEstimateInput,
} from "../../types/estimates/estimate.type";

// ==========================================
// LIST ESTIMATES
// ==========================================

export async function listEstimates(
    req: Request,
    res: Response
) {
    try {
        const page = Number(
            req.query.page || 1
        );

        const limit = Number(
            req.query.limit || 20
        );

        const search =
            req.query.search
                ? String(req.query.search)
                : undefined;

        const status =
            req.query.status
                ? String(req.query.status)
                : undefined;

        const customerId =
            req.query.customer_id
                ? Number(
                      req.query.customer_id
                  )
                : undefined;

        const result =
            await getEstimates(
                page,
                limit,
                search,
                status,
                customerId
            );

        return res.status(200).json({
            success: true,
            message:
                "Estimates fetched successfully",
            data: result.data,
            pagination:
                result.pagination,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to fetch estimates",
        });
    }
}

// ==========================================
// GET ESTIMATE BY ID
// ==========================================

export async function getEstimate(
    req: Request,
    res: Response
) {
    try {
        const id = Number(
            req.params.id
        );

        if (
            !Number.isInteger(id) ||
            id <= 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid estimate ID",
            });
        }

        const estimate =
            await getEstimateById(id);

        if (!estimate) {
            return res.status(404).json({
                success: false,
                message:
                    "Estimate not found",
            });
        }

        return res.status(200).json({
            success: true,
            message:
                "Estimate fetched successfully",
            data: estimate,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to fetch estimate",
        });
    }
}

// ==========================================
// GET NEXT ESTIMATE NUMBER
// ==========================================

export async function getNextEstimateNumberController(
    _req: Request,
    res: Response
) {
    try {
        const estimateNumber =
            await getNextEstimateNumber();

        return res.status(200).json({
            success: true,
            message:
                "Next estimate number generated successfully",
            data: {
                estimate_number:
                    estimateNumber,
            },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to generate estimate number",
        });
    }
}

// ==========================================
// CREATE ESTIMATE
// ==========================================

export async function addEstimate(
    req: Request,
    res: Response
) {
    try {
        const estimateData =
            req.body as CreateEstimateInput;

        const userId =
            (
                req as Request & {
                    user?: {
                        id: number;
                    };
                }
            ).user?.id ?? null;

        const estimate =
            await createEstimate(
                estimateData,
                userId
            );

        return res.status(201).json({
            success: true,
            message:
                "Estimate created successfully",
            data: estimate,
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to create estimate",
        });
    }
}

// ==========================================
// UPDATE ESTIMATE
// ==========================================

export async function editEstimate(
    req: Request,
    res: Response
) {
    try {
        const id = Number(
            req.params.id
        );

        if (
            !Number.isInteger(id) ||
            id <= 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid estimate ID",
            });
        }

        const estimateData =
            req.body as UpdateEstimateInput;

        const userId =
            (
                req as Request & {
                    user?: {
                        id: number;
                    };
                }
            ).user?.id ?? null;

        const estimate =
            await updateEstimate(
                id,
                estimateData,
                userId
            );

        return res.status(200).json({
            success: true,
            message:
                "Estimate updated successfully",
            data: estimate,
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to update estimate",
        });
    }
}

// ==========================================
// DELETE ESTIMATE
// ==========================================

export async function removeEstimate(
    req: Request,
    res: Response
) {
    try {
        const id = Number(
            req.params.id
        );

        if (
            !Number.isInteger(id) ||
            id <= 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Invalid estimate ID",
            });
        }

        await deleteEstimate(id);

        return res.status(200).json({
            success: true,
            message:
                "Estimate deleted successfully",
        });
    } catch (error) {
        return res.status(400).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to delete estimate",
        });
    }
}