import db from "../../config/database";
import {
    CreateExpenseDTO,
    ExpenseListQueryDTO,
    UpdateExpenseDTO,
} from "../../validators/expenses/expense.validator";

/*
 * PostgreSQL DATE should always be returned as:
 *
 * YYYY-MM-DD
 *
 * We explicitly cast expense_date to text so that
 * JavaScript timezone conversion does not change
 * the business date.
 */
const expenseColumns = [
    "id",
    "category",
    "description",
    "amount",
    db.raw(
        "expense_date::text as expense_date"
    ),
    "payment_method",
    "created_by",
    "notes",
    "created_at",
];

class ExpenseService {
    // ==========================================
    // CREATE EXPENSE
    // ==========================================
    async createExpense(data: CreateExpenseDTO) {
        const [insertedExpense] = await db("expenses")
            .insert({
                category: data.category,
                description: data.description,
                amount: data.amount,
                expense_date: data.expense_date,
                payment_method:
                    data.payment_method || "cash",
                notes: data.notes ?? null,
            })
            .returning("id");

        const expense = await db("expenses")
            .where("id", insertedExpense.id)
            .select(expenseColumns)
            .first();

        return expense;
    }

    // ==========================================
    // GET EXPENSE BY ID
    // ==========================================
    async getExpenseById(id: number) {
        const expense = await db("expenses")
            .where("id", id)
            .select(expenseColumns)
            .first();

        if (!expense) {
            throw new Error("Expense not found");
        }

        return expense;
    }

    // ==========================================
    // GET ALL EXPENSES
    // ==========================================
    async getExpenses(query: ExpenseListQueryDTO) {
        const {
            page = 1,
            limit = 20,
            search,
            category,
            payment_method,
            start_date,
            end_date,
        } = query;

        const offset = (page - 1) * limit;

        // =====================================================
        // FILTERED QUERY
        // Used ONLY for the expense history table.
        // =====================================================
        const baseQuery = db("expenses");

        // Search
        if (search) {
            baseQuery.where(function (this: any) {
                this.whereILike(
                    "description",
                    `%${search}%`
                )
                    .orWhereILike(
                        "category",
                        `%${search}%`
                    )
                    .orWhereILike(
                        "notes",
                        `%${search}%`
                    );
            });
        }

        // Category
        if (category) {
            baseQuery.whereILike(
                "category",
                category
            );
        }

        // Payment method
        if (payment_method) {
            baseQuery.where(
                "payment_method",
                payment_method
            );
        }

        // Start date
        if (start_date) {
            baseQuery.where(
                "expense_date",
                ">=",
                start_date
            );
        }

        // End date
        if (end_date) {
            baseQuery.where(
                "expense_date",
                "<=",
                end_date
            );
        }

        // =====================================================
        // FILTERED TOTAL COUNT
        // =====================================================
        const countResult = await baseQuery
            .clone()
            .clearSelect()
            .clearOrder()
            .count<{ count: string }>(
                "id as count"
            )
            .first();

        const total = Number(
            countResult?.count || 0
        );

        // =====================================================
        // EXPENSE HISTORY DATA
        // =====================================================
        const expenses = await baseQuery
            .clone()
            .select(expenseColumns)
            .orderBy("expense_date", "desc")
            .orderBy("id", "desc")
            .limit(limit)
            .offset(offset);

        // =====================================================
        // GLOBAL SUMMARY
        //
        // IMPORTANT:
        // This query DOES NOT use search/category/date
        // filters.
        //
        // Therefore the dashboard summary always represents
        // the complete expense history.
        // =====================================================
        const summaryResult = await db("expenses")
            .select(
                db.raw(
                    `
          COALESCE(
            SUM(amount),
            0
          ) AS "totalAmount"
          `
                ),

                db.raw(
                    `
          COALESCE(
            SUM(
              CASE
                WHEN expense_date =
                  (
                    CURRENT_TIMESTAMP
                    AT TIME ZONE 'Asia/Kolkata'
                  )::date
                THEN amount
                ELSE 0
              END
            ),
            0
          ) AS "todayAmount"
          `
                ),

                db.raw(`
    COALESCE(
        SUM(
            CASE
                WHEN expense_date >= DATE_TRUNC(
                    'month',
                    CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata'
                )::date

                AND expense_date < (
                    DATE_TRUNC(
                        'month',
                        CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata'
                    ) + INTERVAL '1 month'
                )::date

                THEN amount
                ELSE 0
            END
        ),
        0
    ) AS "monthAmount"
`),

                db.raw(
                    `
          COUNT(*) AS "transactionCount"
          `
                )
            )
            .first();

        const totalAmount = Number(
            summaryResult?.totalAmount || 0
        );

        const todayAmount = Number(
            summaryResult?.todayAmount || 0
        );

        const monthAmount = Number(
            summaryResult?.monthAmount || 0
        );

        const transactionCount = Number(
            summaryResult?.transactionCount || 0
        );

        return {
            data: expenses,

            pagination: {
                page,
                limit,
                total,
                totalPages:
                    Math.ceil(total / limit),
            },

            summary: {
                totalAmount,
                todayAmount,
                monthAmount,
                transactionCount,
            },
        };
    }

    // ==========================================
    // UPDATE EXPENSE
    // ==========================================
    async updateExpense(
        id: number,
        data: UpdateExpenseDTO
    ) {
        const existingExpense = await db(
            "expenses"
        )
            .where("id", id)
            .first();

        if (!existingExpense) {
            throw new Error("Expense not found");
        }

        const updateData: Record<
            string,
            unknown
        > = {};

        if (data.category !== undefined) {
            updateData.category =
                data.category;
        }

        if (data.description !== undefined) {
            updateData.description =
                data.description;
        }

        if (data.amount !== undefined) {
            updateData.amount = data.amount;
        }

        if (data.expense_date !== undefined) {
            updateData.expense_date =
                data.expense_date;
        }

        if (data.payment_method !== undefined) {
            updateData.payment_method =
                data.payment_method;
        }

        if (data.notes !== undefined) {
            updateData.notes = data.notes;
        }

        await db("expenses")
            .where("id", id)
            .update(updateData);

        const updatedExpense =
            await db("expenses")
                .where("id", id)
                .select(expenseColumns)
                .first();

        return updatedExpense;
    }

    // ==========================================
    // DELETE EXPENSE
    // ==========================================
    async deleteExpense(id: number) {
        const existingExpense = await db(
            "expenses"
        )
            .where("id", id)
            .first();

        if (!existingExpense) {
            throw new Error("Expense not found");
        }

        await db("expenses")
            .where("id", id)
            .del();

        return {
            id,
            message:
                "Expense deleted successfully",
        };
    }
}

export default new ExpenseService();