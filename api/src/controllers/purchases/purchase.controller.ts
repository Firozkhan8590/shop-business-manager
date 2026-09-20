import { Request, Response } from "express";

import {
  createPurchase,
  getNextPurchaseNumber,
  getPurchaseById,
  getPurchases,
  updatePurchase,
} from "../../services/purchases/purchase.service";

import {
  CreatePurchaseInput,
  UpdatePurchaseInput,
} from "../../types/purchases/purchase.type";

export async function listPurchases(
  req: Request,
  res: Response
) {
  try {
    const date =
      typeof req.query.date === "string"
        ? req.query.date
        : undefined;

    // Validate date format
    if (
      date &&
      !/^\d{4}-\d{2}-\d{2}$/.test(date)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid date format. Use YYYY-MM-DD",
      });
    }

    const purchases =
      await getPurchases(date);

    return res.json({
      success: true,
      message:
        date
          ? "Purchases fetched successfully for selected date"
          : "Purchases fetched successfully",
      data: purchases,
    });
  } catch (error) {
    console.error(
      "List purchases error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch purchases",
    });
  }
}
export async function getPurchase(
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
          "Invalid purchase ID",
      });
    }

    const purchase =
      await getPurchaseById(id);

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message:
          "Purchase not found",
      });
    }

    return res.json({
      success: true,
      message:
        "Purchase fetched successfully",
      data: purchase,
    });
  } catch (error) {
    console.error(
      "Get purchase error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch purchase",
    });
  }
}

export async function addPurchase(
  req: Request,
  res: Response
) {
  try {
    const purchaseData =
      req.body as CreatePurchaseInput;

    const userId = (
      req as Request & {
        user?: {
          id: number;
        };
      }
    ).user?.id ?? null;

    const purchase =
      await createPurchase(
        purchaseData,
        userId
      );

    return res.status(201).json({
      success: true,
      message:
        "Purchase created successfully",
      data: purchase,
    });
  } catch (error) {
    console.error(
      "Create purchase error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to create purchase";

    return res.status(400).json({
      success: false,
      message,
    });
  }
}

export async function editPurchase(
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
          "Invalid purchase ID",
      });
    }

    const purchaseData =
      req.body as UpdatePurchaseInput;

    const userId = (
      req as Request & {
        user?: {
          id: number;
        };
      }
    ).user?.id ?? null;

    const purchase =
      await updatePurchase(
        id,
        purchaseData,
        userId
      );

    return res.json({
      success: true,
      message:
        "Purchase updated successfully",
      data: purchase,
    });
  } catch (error) {
    console.error(
      "Update purchase error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Failed to update purchase";

    return res.status(400).json({
      success: false,
      message,
    });
  }
}

export async function getNextPurchaseNumberController(
  _req: Request,
  res: Response
) {
  try {
    const purchaseNumber = await getNextPurchaseNumber();

    return res.status(200).json({
      success: true,
      message: "Next purchase number generated successfully",
      data: {
        purchase_number: purchaseNumber,
      },
    });
  } catch (error) {
    console.error("Get next purchase number error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate next purchase number",
    });
  }
}