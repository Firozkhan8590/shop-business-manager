import { Request, Response } from "express";

import {
    getCustomerPaymentsReport,
    getOutstandingReport,
    getProductPurchasesReport,
    getProductSalesReport,
    getProfitReport,
    getPurchasesReport,
  getSalesReport,
  getStockMovementsReport,
  getSupplierPaymentsReport,
} from "../../services/reports/report.service";

/* ============================================================
   SALES REPORT
============================================================ */

export async function salesReportController(
  req: Request,
  res: Response
) {
  try {
    const from =
      typeof req.query.from === "string"
        ? req.query.from
        : undefined;

    const to =
      typeof req.query.to === "string"
        ? req.query.to
        : undefined;

    /* ---------------- VALIDATE FROM ---------------- */

    if (
      from &&
      !/^\d{4}-\d{2}-\d{2}$/.test(from)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid from date format. Use YYYY-MM-DD",
      });
    }

    /* ---------------- VALIDATE TO ---------------- */

    if (
      to &&
      !/^\d{4}-\d{2}-\d{2}$/.test(to)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid to date format. Use YYYY-MM-DD",
      });
    }

    /* ---------------- VALIDATE DATE RANGE ---------------- */

    if (from && to && from > to) {
      return res.status(400).json({
        success: false,
        message:
          "From date cannot be greater than to date",
      });
    }

    /* ---------------- GET REPORT ---------------- */

    const report =
      await getSalesReport({
        from,
        to,
      });

    return res.json({
      success: true,
      message:
        "Sales report fetched successfully",
      data: report,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message:
        error?.message ||
        "Failed to fetch sales report",
    });
  }
}

/* ============================================================
   PURCHASE REPORT CONTROLLER
============================================================ */

export async function purchasesReportController(
  req: Request,
  res: Response
) {
  try {
    const from =
      typeof req.query.from === "string"
        ? req.query.from
        : undefined;

    const to =
      typeof req.query.to === "string"
        ? req.query.to
        : undefined;

    /* =========================
       FROM DATE VALIDATION
    ========================= */

    if (
      from &&
      !/^\d{4}-\d{2}-\d{2}$/.test(from)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid from date format. Use YYYY-MM-DD",
      });
    }

    /* =========================
       TO DATE VALIDATION
    ========================= */

    if (
      to &&
      !/^\d{4}-\d{2}-\d{2}$/.test(to)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid to date format. Use YYYY-MM-DD",
      });
    }

    /* =========================
       DATE RANGE VALIDATION
    ========================= */

    if (from && to && from > to) {
      return res.status(400).json({
        success: false,
        message:
          "From date cannot be greater than to date",
      });
    }

    /* =========================
       GET REPORT
    ========================= */

    const report =
      await getPurchasesReport({
        from,
        to,
      });

    return res.json({
      success: true,
      message:
        "Purchase report fetched successfully",
      data: report,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message:
        error?.message ||
        "Failed to fetch purchase report",
    });
  }
}

/* ================================
   CUSTOMER PAYMENTS REPORT
================================ */

export const customerPaymentsReportController = async (
  req: Request,
  res: Response
) => {
  try {
    const { from, to } = req.query;

    const fromDate = from as string | undefined;
    const toDate = to as string | undefined;

    /* ================================
       DATE VALIDATION
    ================================ */

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

    if (fromDate && !dateRegex.test(fromDate)) {
      return res.status(400).json({
        success: false,
        message: "Invalid from date. Use YYYY-MM-DD format",
      });
    }

    if (toDate && !dateRegex.test(toDate)) {
      return res.status(400).json({
        success: false,
        message: "Invalid to date. Use YYYY-MM-DD format",
      });
    }

    if (fromDate && toDate && fromDate > toDate) {
      return res.status(400).json({
        success: false,
        message: "From date cannot be greater than to date",
      });
    }

    const data = await getCustomerPaymentsReport({
      from: fromDate,
      to: toDate,
    });

    return res.status(200).json({
      success: true,
      message: "Customer payments report fetched successfully",
      data,
    });
  } catch (error: any) {
    console.error("Customer Payments Report Error:", error);

    return res.status(500).json({
      success: false,
      message:
        error?.message || "Failed to fetch customer payments report",
    });
  }
};

/* ================================
   SUPPLIER PAYMENTS REPORT
================================ */

export const supplierPaymentsReportController = async (
  req: Request,
  res: Response
) => {
  try {
    const { from, to } = req.query;

    const fromDate = from as string | undefined;
    const toDate = to as string | undefined;

    /* ================================
       DATE VALIDATION
    ================================ */

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

    if (fromDate && !dateRegex.test(fromDate)) {
      return res.status(400).json({
        success: false,
        message: "Invalid from date. Use YYYY-MM-DD format",
      });
    }

    if (toDate && !dateRegex.test(toDate)) {
      return res.status(400).json({
        success: false,
        message: "Invalid to date. Use YYYY-MM-DD format",
      });
    }

    if (fromDate && toDate && fromDate > toDate) {
      return res.status(400).json({
        success: false,
        message: "From date cannot be greater than to date",
      });
    }

    const data = await getSupplierPaymentsReport({
      from: fromDate,
      to: toDate,
    });

    return res.status(200).json({
      success: true,
      message: "Supplier payments report fetched successfully",
      data,
    });
  } catch (error: any) {
    console.error("Supplier Payments Report Error:", error);

    return res.status(500).json({
      success: false,
      message:
        error?.message || "Failed to fetch supplier payments report",
    });
  }
};

/* ================================
   OUTSTANDING REPORT
================================ */

export const outstandingReportController = async (
  req: Request,
  res: Response
) => {
  try {
    const data = await getOutstandingReport();

    return res.status(200).json({
      success: true,
      message: "Outstanding report fetched successfully",
      data,
    });
  } catch (error: any) {
    console.error("Outstanding Report Error:", error);

    return res.status(500).json({
      success: false,
      message:
        error?.message || "Failed to fetch outstanding report",
    });
  }
};

/* ================================
   PRODUCT SALES REPORT
================================ */

export const productSalesReportController = async (
  req: Request,
  res: Response
) => {
  try {
    const { from, to } = req.query;

    const fromDate = from as string | undefined;
    const toDate = to as string | undefined;

    /* ================================
       DATE VALIDATION
    ================================ */

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

    if (fromDate && !dateRegex.test(fromDate)) {
      return res.status(400).json({
        success: false,
        message: "Invalid from date. Use YYYY-MM-DD format",
      });
    }

    if (toDate && !dateRegex.test(toDate)) {
      return res.status(400).json({
        success: false,
        message: "Invalid to date. Use YYYY-MM-DD format",
      });
    }

    if (fromDate && toDate && fromDate > toDate) {
      return res.status(400).json({
        success: false,
        message: "From date cannot be greater than to date",
      });
    }

    const data = await getProductSalesReport({
      from: fromDate,
      to: toDate,
    });

    return res.status(200).json({
      success: true,
      message: "Product sales report fetched successfully",
      data,
    });
  } catch (error: any) {
    console.error("Product Sales Report Error:", error);

    return res.status(500).json({
      success: false,
      message:
        error?.message || "Failed to fetch product sales report",
    });
  }
};

/* ================================
   PRODUCT PURCHASES REPORT
================================ */

export const productPurchasesReportController = async (
  req: Request,
  res: Response
) => {
  try {
    const { from, to } = req.query;

    const fromDate = from as string | undefined;
    const toDate = to as string | undefined;

    /* ================================
       DATE VALIDATION
    ================================ */

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

    if (fromDate && !dateRegex.test(fromDate)) {
      return res.status(400).json({
        success: false,
        message: "Invalid from date. Use YYYY-MM-DD format",
      });
    }

    if (toDate && !dateRegex.test(toDate)) {
      return res.status(400).json({
        success: false,
        message: "Invalid to date. Use YYYY-MM-DD format",
      });
    }

    if (fromDate && toDate && fromDate > toDate) {
      return res.status(400).json({
        success: false,
        message: "From date cannot be greater than to date",
      });
    }

    const data = await getProductPurchasesReport({
      from: fromDate,
      to: toDate,
    });

    return res.status(200).json({
      success: true,
      message: "Product purchases report fetched successfully",
      data,
    });
  } catch (error: any) {
    console.error("Product Purchases Report Error:", error);

    return res.status(500).json({
      success: false,
      message:
        error?.message ||
        "Failed to fetch product purchases report",
    });
  }
};

/* ================================
   STOCK MOVEMENTS REPORT
================================ */

export const stockMovementsReportController = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      from,
      to,
      productId,
      movementType,
    } = req.query;

    const fromDate = from as string | undefined;
    const toDate = to as string | undefined;

    const productIdValue = productId
      ? Number(productId)
      : undefined;

    const movementTypeValue =
      movementType as string | undefined;

    /* ================================
       DATE VALIDATION
    ================================ */

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

    if (fromDate && !dateRegex.test(fromDate)) {
      return res.status(400).json({
        success: false,
        message: "Invalid from date. Use YYYY-MM-DD format",
      });
    }

    if (toDate && !dateRegex.test(toDate)) {
      return res.status(400).json({
        success: false,
        message: "Invalid to date. Use YYYY-MM-DD format",
      });
    }

    if (fromDate && toDate && fromDate > toDate) {
      return res.status(400).json({
        success: false,
        message: "From date cannot be greater than to date",
      });
    }

    /* ================================
       PRODUCT ID VALIDATION
    ================================ */

    if (
      productId !== undefined &&
      (!Number.isInteger(productIdValue) ||
        Number(productIdValue) <= 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid productId",
      });
    }

    const data = await getStockMovementsReport({
      from: fromDate,
      to: toDate,
      productId: productIdValue,
      movementType: movementTypeValue,
    });

    return res.status(200).json({
      success: true,
      message: "Stock movements report fetched successfully",
      data,
    });
  } catch (error: any) {
    console.error(
      "Stock Movements Report Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error?.message ||
        "Failed to fetch stock movements report",
    });
  }
};

/* ================================
   PROFIT REPORT
================================ */

export const profitReportController = async (
  req: Request,
  res: Response
) => {
  try {
    const { from, to } = req.query;

    const fromDate =
      typeof from === "string"
        ? from
        : undefined;

    const toDate =
      typeof to === "string"
        ? to
        : undefined;

    /* ================================
       DATE VALIDATION
    ================================ */

    const dateRegex =
      /^\d{4}-\d{2}-\d{2}$/;

    if (
      fromDate &&
      !dateRegex.test(fromDate)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid from date. Use YYYY-MM-DD format",
      });
    }

    if (
      toDate &&
      !dateRegex.test(toDate)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid to date. Use YYYY-MM-DD format",
      });
    }

    /* ================================
       DATE RANGE VALIDATION
    ================================ */

    if (
      fromDate &&
      toDate &&
      fromDate > toDate
    ) {
      return res.status(400).json({
        success: false,
        message:
          "From date cannot be greater than to date",
      });
    }

    /* ================================
       GET REPORT
    ================================ */

    const data =
      await getProfitReport({
        from: fromDate,
        to: toDate,
      });

    return res.status(200).json({
      success: true,
      message:
        "Profit report fetched successfully",
      data,
    });
  } catch (error: any) {
    console.error(
      "Profit Report Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error?.message ||
        "Failed to fetch profit report",
    });
  }
};