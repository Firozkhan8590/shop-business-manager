import { Request, Response } from "express";



import {
  getExpensesReport,
} from "../../services/reports/expense-report.service";
import { ExpenseReportFilters } from "../../types/reports/report.type";

class ExpenseReportController {
  // ==========================================
  // GET EXPENSE REPORT
  // ==========================================

  async getReport(
    req: Request,
    res: Response
  ) {
    try {
      const {
        from,
        to,
        category,
        payment_method,
      } = req.query;

      // ==========================================
      // DATE VALIDATION
      // ==========================================

      if (
        from !== undefined &&
        typeof from !== "string"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid from date",
        });
      }

      if (
        to !== undefined &&
        typeof to !== "string"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid to date",
        });
      }

      const dateRegex =
        /^\d{4}-\d{2}-\d{2}$/;

      if (
        typeof from === "string" &&
        !dateRegex.test(from)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "from must be in YYYY-MM-DD format",
        });
      }

      if (
        typeof to === "string" &&
        !dateRegex.test(to)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "to must be in YYYY-MM-DD format",
        });
      }

      // ==========================================
      // DATE RANGE VALIDATION
      // ==========================================

      if (
        typeof from === "string" &&
        typeof to === "string" &&
        from > to
      ) {
        return res.status(400).json({
          success: false,
          message:
            "from date cannot be greater than to date",
        });
      }

      // ==========================================
      // FILTER VALIDATION
      // ==========================================

      if (
        category !== undefined &&
        typeof category !== "string"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid category",
        });
      }

      if (
        payment_method !== undefined &&
        typeof payment_method !== "string"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid payment_method",
        });
      }

      const filters: ExpenseReportFilters = {
        from:
          typeof from === "string"
            ? from
            : undefined,

        to:
          typeof to === "string"
            ? to
            : undefined,

        category:
          typeof category === "string"
            ? category
            : undefined,

        paymentMethod:
          typeof payment_method === "string"
            ? payment_method
            : undefined,
      };

      const data =
        await getExpensesReport(
          filters
        );

      return res.status(200).json({
        success: true,
        message:
          "Expenses report fetched successfully",
        data,
      });
    } catch (error) {
      console.error(
        "Expenses report error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch expenses report",
      });
    }
  }
}

export default new ExpenseReportController();