import { Request, Response } from "express";

import {
  createSale,
  getNextInvoiceNumber,
  getSaleById,
  listSales,
  updateSale,
} from "../../services/sales/sale.service";

type AuthenticatedRequest = Request & {
  user?: {
    id?: number;
  };
};

export async function listSaleController(
  req: Request,
  res: Response
) {
  try {
    const date =
      typeof req.query.date === "string"
        ? req.query.date
        : undefined;

    /* ---------------- Validate Date ---------------- */

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

    const sales =
      await listSales(date);

    return res.json({
      success: true,
      message:
        date
          ? "Sales fetched successfully for selected date"
          : "Sales fetched successfully",
      data: sales,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message:
        error?.message ||
        "Failed to fetch sales",
    });
  }
}

export async function getSaleController(
  req: Request,
  res: Response
) {
  try {
    const id =
      Number(req.params.id);

    if (
      !Number.isInteger(id)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid sale ID",
      });
    }

    const sale =
      await getSaleById(id);

    return res.json({
      success: true,
      message:
        "Sale fetched successfully",
      data: sale,
    });
  } catch (error: any) {
    return res.status(404).json({
      success: false,
      message:
        error?.message ||
        "Sale not found",
    });
  }
}

export async function addSale(
  req: Request,
  res: Response
) {
  try {
    const userId =
      (req as AuthenticatedRequest).user?.id;

    const sale =
      await createSale(
        req.body,
        userId
      );

    return res.status(201).json({
      success: true,
      message:
        "Sale created successfully",
      data: sale,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message:
        error?.message ||
        "Failed to create sale",
    });
  }
}

export async function editSale(
  req: Request,
  res: Response
) {
  try {
    const id =
      Number(req.params.id);

    if (
      !Number.isInteger(id)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid sale ID",
      });
    }

    const userId =
      (req as AuthenticatedRequest).user?.id;

    const sale =
      await updateSale(
        id,
        req.body,
        userId
      );

    return res.json({
      success: true,
      message:
        "Sale updated successfully",
      data: sale,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message:
        error?.message ||
        "Failed to update sale",
    });
  }
}

export async function nextInvoiceNumber(
  _req: Request,
  res: Response
) {
  try {
    const invoiceNumber =
      await getNextInvoiceNumber();

    return res.json({
      success: true,
      message:
        "Next invoice number generated successfully",
      data: {
        invoice_number:
          invoiceNumber,
      },
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message:
        error?.message ||
        "Failed to generate invoice number",
    });
  }
}