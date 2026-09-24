import type {
    Request,
    Response,
} from "express";

import {
    getDashboardData,
} from "../../services/dashboard/dashboard.service";

export async function getDashboard(
    req: Request,
    res: Response
): Promise<void> {
    try {
        const data =
            await getDashboardData();

        res.status(200).json({
            success: true,
            message:
                "Dashboard data fetched successfully",
            data,
        });
    } catch (error) {
        console.error(
            "Dashboard error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to fetch dashboard data",
        });
    }
}