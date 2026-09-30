import db from "../../config/database";
import { ExpenseReportData, ExpenseReportFilters, ExpenseReportItem } from "../../types/reports/report.type";



interface ExpenseReportRow {
  id: number | string;
  category: string;
  description: string | null;
  amount: number | string;
  expense_date: string;
  payment_method: string;
  notes: string | null;
}

export const getExpensesReport = async (
  filters: ExpenseReportFilters
): Promise<ExpenseReportData> => {
  const {
    from,
    to,
    category,
    paymentMethod,
  } = filters;

  const query = db("expenses as e");

  // ==========================================
  // DATE FILTER
  // ==========================================

  if (from) {
    query.where("e.expense_date", ">=", from);
  }

  if (to) {
    query.where("e.expense_date", "<=", to);
  }

  // ==========================================
  // CATEGORY FILTER
  // ==========================================

  if (category) {
    query.whereILike("e.category", category);
  }

  // ==========================================
  // PAYMENT METHOD FILTER
  // ==========================================

  if (paymentMethod) {
    query.where(
      "e.payment_method",
      paymentMethod
    );
  }

  // ==========================================
  // SELECT
  // ==========================================

  const rows = (await query
    .select(
      "e.id",
      "e.category",
      "e.description",
      "e.amount",
      db.raw(
        "e.expense_date::text as expense_date"
      ),
      "e.payment_method",
      "e.notes"
    )
    .orderBy("e.expense_date", "desc")
    .orderBy("e.id", "desc")) as ExpenseReportRow[];

  // ==========================================
  // MAP DATA
  // ==========================================

  const expenses: ExpenseReportItem[] =
    rows.map((row) => ({
      id: Number(row.id),

      category: row.category,

      description:
        row.description ?? null,

      amount: Number(row.amount),

      expenseDate: row.expense_date,

      paymentMethod:
        row.payment_method,

      notes: row.notes ?? null,
    }));

  // ==========================================
  // SUMMARY
  // ==========================================

  const totalTransactions =
    expenses.length;

  const totalExpenses =
    expenses.reduce(
      (sum, expense) =>
        sum + expense.amount,
      0
    );

  return {
    summary: {
      totalTransactions,
      totalExpenses,
    },

    expenses,
  };
};