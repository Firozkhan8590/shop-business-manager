import { Request, Response } from "express";
import { createExpenseSchema, expenseListQuerySchema, updateExpenseSchema } from "../../validators/expenses/expense.validator";
import expenseService from "../../services/expenses/expense.service";


class ExpenseController {
  // ==========================================
  // CREATE
  // ==========================================
  async create(req: Request, res: Response) {
    try {
      const validation = createExpenseSchema.safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: validation.error.flatten(),
        });
      }

      const expense = await expenseService.createExpense(
        validation.data
      );

      return res.status(201).json({
        success: true,
        message: "Expense created successfully",
        data: expense,
      });
    } catch (error) {
      console.error("Create expense error:", error);

      return res.status(500).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to create expense",
      });
    }
  }

  // ==========================================
  // GET ALL
  // ==========================================
  async getAll(req: Request, res: Response) {
    try {
      const validation = expenseListQuerySchema.safeParse(req.query);

      if (!validation.success) {
        return res.status(400).json({
          success: false,
          message: "Invalid query parameters",
          errors: validation.error.flatten(),
        });
      }

      const result = await expenseService.getExpenses(
        validation.data
      );

      return res.status(200).json({
        success: true,
        message: "Expenses fetched successfully",
        ...result,
      });
    } catch (error) {
      console.error("Get expenses error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch expenses",
      });
    }
  }

  // ==========================================
  // GET BY ID
  // ==========================================
  async getById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);

      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid expense ID",
        });
      }

      const expense = await expenseService.getExpenseById(id);

      return res.status(200).json({
        success: true,
        message: "Expense fetched successfully",
        data: expense,
      });
    } catch (error) {
      console.error("Get expense error:", error);

      const message =
        error instanceof Error
          ? error.message
          : "Failed to fetch expense";

      if (message === "Expense not found") {
        return res.status(404).json({
          success: false,
          message,
        });
      }

      return res.status(500).json({
        success: false,
        message,
      });
    }
  }

  // ==========================================
  // UPDATE
  // ==========================================
  async update(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);

      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid expense ID",
        });
      }

      const validation = updateExpenseSchema.safeParse(req.body);

      if (!validation.success) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: validation.error.flatten(),
        });
      }

      const expense = await expenseService.updateExpense(
        id,
        validation.data
      );

      return res.status(200).json({
        success: true,
        message: "Expense updated successfully",
        data: expense,
      });
    } catch (error) {
      console.error("Update expense error:", error);

      const message =
        error instanceof Error
          ? error.message
          : "Failed to update expense";

      if (message === "Expense not found") {
        return res.status(404).json({
          success: false,
          message,
        });
      }

      return res.status(500).json({
        success: false,
        message,
      });
    }
  }

  // ==========================================
  // DELETE
  // ==========================================
  async delete(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);

      if (!Number.isInteger(id) || id <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid expense ID",
        });
      }

      const result = await expenseService.deleteExpense(id);

      return res.status(200).json({
        success: true,
        message: result.message,
        data: {
          id: result.id,
        },
      });
    } catch (error) {
      console.error("Delete expense error:", error);

      const message =
        error instanceof Error
          ? error.message
          : "Failed to delete expense";

      if (message === "Expense not found") {
        return res.status(404).json({
          success: false,
          message,
        });
      }

      return res.status(500).json({
        success: false,
        message,
      });
    }
  }
}

export default new ExpenseController();