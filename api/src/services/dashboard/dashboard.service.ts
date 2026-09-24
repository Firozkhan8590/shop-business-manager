import db from "../../config/database";

/* =========================================================
   TYPES
========================================================= */

interface DashboardSummary {
    todaySales: number;
    todayPurchases: number;
    todayExpenses: number;
    todayProfit: number;

    salesChange: number;
    purchasesChange: number;
    expensesChange: number;
    profitChange: number;
}

interface SalesPurchaseData {
    date: string;
    sales: number;
    purchases: number;
}

interface ProfitData {
    date: string;
    profit: number;
}

interface StockAlert {
    id: number;
    name: string;
    sku: string | null;
    unit: string;
    current_stock: number;
    minimum_stock: number;
}

interface RecentSale {
    id: number;
    invoice_number: string;
    customer_name: string | null;
    total_amount: number;
    paid_amount: number;
    balance_amount: number;
    payment_method: string;
    sale_date: string;
    status: string;
}

interface RecentPurchase {
    id: number;
    purchase_number: string;
    supplier_name: string | null;
    total_amount: number;
    paid_amount: number;
    balance_amount: number;
    payment_method: string;
    purchase_date: string;
    status: string;
}

/* =========================================================
   HELPERS
========================================================= */

const toNumber = (value: any): number => {
    return Number(value || 0);
};

const formatDate = (date: Date): string => {
    return date.toISOString().split("T")[0];
};

const calculateChange = (
    current: number,
    previous: number
): number => {
    if (previous === 0) {
        return current === 0 ? 0 : 100;
    }

    return Number(
        (((current - previous) / previous) * 100).toFixed(2)
    );
};

/* =========================================================
   GET DASHBOARD DATA
========================================================= */

export const getDashboardData = async () => {
    try {
        /* -------------------------------------------------
           DATE RANGE
        ------------------------------------------------- */

        const today = new Date();

        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

        const todayString = formatDate(today);
        const yesterdayString = formatDate(yesterday);
        const sevenDaysAgoString = formatDate(sevenDaysAgo);

        /* =================================================
           1. TODAY SALES
        ================================================= */

        const todaySalesResult =
            await db("sales")
                .where("sale_date", todayString)
                .where("status", "completed")
                .sum("total_amount as total")
                .first();

        const todaySales = toNumber(todaySalesResult?.total);

        /* =================================================
           2. YESTERDAY SALES
        ================================================= */

        const yesterdaySalesResult =
            await db("sales")
                .where("sale_date", yesterdayString)
                .where("status", "completed")
                .sum("total_amount as total")
                .first();

        const yesterdaySales =
            toNumber(yesterdaySalesResult?.total);

        /* =================================================
           3. TODAY PURCHASES
        ================================================= */

        const todayPurchasesResult =
            await db("purchases")
                .where("purchase_date", todayString)
                .where("status", "completed")
                .sum("total_amount as total")
                .first();

        const todayPurchases =
            toNumber(todayPurchasesResult?.total);

        /* =================================================
           4. YESTERDAY PURCHASES
        ================================================= */

        const yesterdayPurchasesResult =
            await db("purchases")
                .where("purchase_date", yesterdayString)
                .where("status", "completed")
                .sum("total_amount as total")
                .first();

        const yesterdayPurchases =
            toNumber(yesterdayPurchasesResult?.total);

        /* =================================================
           5. TODAY EXPENSES
        ================================================= */

        const todayExpensesResult =
            await db("expenses")
                .where("expense_date", todayString)
                .sum("amount as total")
                .first();

        const todayExpenses =
            toNumber(todayExpensesResult?.total);

        /* =================================================
           6. YESTERDAY EXPENSES
        ================================================= */

        const yesterdayExpensesResult =
            await db("expenses")
                .where("expense_date", yesterdayString)
                .sum("amount as total")
                .first();

        const yesterdayExpenses =
            toNumber(yesterdayExpensesResult?.total);

        /* =================================================
           7. TODAY COGS

           IMPORTANT:
           Do NOT use:

           .sum(
               db.raw(
                   "si.quantity * p.purchase_price as total"
               )
           )

           because PostgreSQL generates:

           SUM(
               si.quantity * p.purchase_price AS total
           )

           Correct SQL:

           SUM(si.quantity * p.purchase_price) AS total
        ================================================= */

        const todayCogsResult =
            await db("sales as s")
                .join(
                    "sale_items as si",
                    "s.id",
                    "si.sale_id"
                )
                .join(
                    "products as p",
                    "si.product_id",
                    "p.id"
                )
                .where("s.sale_date", todayString)
                .where("s.status", "completed")
                .select(
                    db.raw(
                        "COALESCE(SUM(si.quantity * p.purchase_price), 0) AS total"
                    )
                )
                .first();

        const todayCogs =
            toNumber(todayCogsResult?.total);

        /* =================================================
           8. YESTERDAY COGS
        ================================================= */

        const yesterdayCogsResult =
            await db("sales as s")
                .join(
                    "sale_items as si",
                    "s.id",
                    "si.sale_id"
                )
                .join(
                    "products as p",
                    "si.product_id",
                    "p.id"
                )
                .where("s.sale_date", yesterdayString)
                .where("s.status", "completed")
                .select(
                    db.raw(
                        "COALESCE(SUM(si.quantity * p.purchase_price), 0) AS total"
                    )
                )
                .first();

        const yesterdayCogs =
            toNumber(yesterdayCogsResult?.total);

        /* =================================================
           9. TODAY PROFIT

           Gross Profit = Sales - COGS
           Net Profit   = Gross Profit - Expenses
        ================================================= */

        const todayGrossProfit =
            todaySales - todayCogs;

        const todayProfit =
            todayGrossProfit - todayExpenses;

        /* =================================================
           10. YESTERDAY PROFIT
        ================================================= */

        const yesterdayGrossProfit =
            yesterdaySales - yesterdayCogs;

        const yesterdayProfit =
            yesterdayGrossProfit - yesterdayExpenses;

        /* =================================================
           11. SALES & PURCHASES - LAST 7 DAYS
        ================================================= */

        const salesLast7Days =
            await db("sales")
                .where(
                    "sale_date",
                    ">=",
                    sevenDaysAgoString
                )
                .where(
                    "sale_date",
                    "<=",
                    todayString
                )
                .where("status", "completed")
                .select("sale_date")
                .sum("total_amount as total")
                .groupBy("sale_date")
                .orderBy("sale_date", "asc");

        const purchasesLast7Days =
            await db("purchases")
                .where(
                    "purchase_date",
                    ">=",
                    sevenDaysAgoString
                )
                .where(
                    "purchase_date",
                    "<=",
                    todayString
                )
                .where("status", "completed")
                .select("purchase_date")
                .sum("total_amount as total")
                .groupBy("purchase_date")
                .orderBy("purchase_date", "asc");

        const salesPurchaseData: SalesPurchaseData[] = [];

        for (
            let i = 0;
            i < 7;
            i++
        ) {
            const date = new Date(sevenDaysAgo);

            date.setDate(
                sevenDaysAgo.getDate() + i
            );

            const dateString =
                formatDate(date);

            const salesData =
                salesLast7Days.find(
                    (item: any) =>
                        formatDate(
                            new Date(item.sale_date)
                        ) === dateString
                );

            const purchaseData =
                purchasesLast7Days.find(
                    (item: any) =>
                        formatDate(
                            new Date(item.purchase_date)
                        ) === dateString
                );

            salesPurchaseData.push({
                date: dateString,
                sales: toNumber(
                    salesData?.total
                ),
                purchases: toNumber(
                    purchaseData?.total
                ),
            });
        }

        /* =================================================
           12. PROFIT OVERVIEW - LAST 7 DAYS
        ================================================= */

        const profitSales =
            await db("sales as s")
                .join(
                    "sale_items as si",
                    "s.id",
                    "si.sale_id"
                )
                .join(
                    "products as p",
                    "si.product_id",
                    "p.id"
                )
                .where(
                    "s.sale_date",
                    ">=",
                    sevenDaysAgoString
                )
                .where(
                    "s.sale_date",
                    "<=",
                    todayString
                )
                .where(
                    "s.status",
                    "completed"
                )
                .select("s.sale_date")
                .select(
                    db.raw(
                        "COALESCE(SUM(si.quantity * p.purchase_price), 0) AS cost"
                    )
                )
                .groupBy("s.sale_date");

        const profitRevenue =
            await db("sales")
                .where(
                    "sale_date",
                    ">=",
                    sevenDaysAgoString
                )
                .where(
                    "sale_date",
                    "<=",
                    todayString
                )
                .where("status", "completed")
                .select("sale_date")
                .sum("total_amount as revenue")
                .groupBy("sale_date");

        const profitExpenses =
            await db("expenses")
                .where(
                    "expense_date",
                    ">=",
                    sevenDaysAgoString
                )
                .where(
                    "expense_date",
                    "<=",
                    todayString
                )
                .select("expense_date")
                .sum("amount as expense")
                .groupBy("expense_date");

        const profitOverview: ProfitData[] = [];

        for (
            let i = 0;
            i < 7;
            i++
        ) {
            const date = new Date(sevenDaysAgo);

            date.setDate(
                sevenDaysAgo.getDate() + i
            );

            const dateString =
                formatDate(date);

            const revenueData =
                profitRevenue.find(
                    (item: any) =>
                        formatDate(
                            new Date(item.sale_date)
                        ) === dateString
                );

            const costData =
                profitSales.find(
                    (item: any) =>
                        formatDate(
                            new Date(item.sale_date)
                        ) === dateString
                );

            const expenseData =
                profitExpenses.find(
                    (item: any) =>
                        formatDate(
                            new Date(item.expense_date)
                        ) === dateString
                );

            const revenue =
                toNumber(
                    revenueData?.revenue
                );

            const cost =
                toNumber(
                    costData?.cost
                );

            const expense =
                toNumber(
                    expenseData?.expense
                );

            const profit =
                revenue - cost - expense;

            profitOverview.push({
                date: dateString,
                profit,
            });
        }

        /* =================================================
           13. CUSTOMER OUTSTANDING
        ================================================= */

        const customerOpeningResult =
            await db("customers")
                .sum(
                    "opening_balance as total"
                )
                .first();

        const customerSalesBalanceResult =
            await db("sales")
                .whereNotNull("customer_id")
                .where("status", "completed")
                .sum(
                    "balance_amount as total"
                )
                .first();

        const customerPaymentsResult =
            await db("customer_payments")
                .sum("amount as total")
                .first();

        const customerOpening =
            toNumber(
                customerOpeningResult?.total
            );

        const customerSalesBalance =
            toNumber(
                customerSalesBalanceResult?.total
            );

        const customerPayments =
            toNumber(
                customerPaymentsResult?.total
            );

        const customerOutstanding =
            customerOpening +
            customerSalesBalance -
            customerPayments;

        /* =================================================
           14. SUPPLIER OUTSTANDING
        ================================================= */

        const supplierOpeningResult =
            await db("suppliers")
                .sum(
                    "opening_balance as total"
                )
                .first();

        const supplierPurchaseBalanceResult =
            await db("purchases")
                .whereNotNull("supplier_id")
                .where("status", "completed")
                .sum(
                    "balance_amount as total"
                )
                .first();

        const supplierPaymentsResult =
            await db("supplier_payments")
                .sum("amount as total")
                .first();

        const supplierOpening =
            toNumber(
                supplierOpeningResult?.total
            );

        const supplierPurchaseBalance =
            toNumber(
                supplierPurchaseBalanceResult?.total
            );

        const supplierPayments =
            toNumber(
                supplierPaymentsResult?.total
            );

        const supplierOutstanding =
            supplierOpening +
            supplierPurchaseBalance -
            supplierPayments;

        /* =================================================
           15. STOCK ALERTS
        ================================================= */

        /* =================================================
   STOCK ALERTS
================================================= */

const stockAlerts =
    await db("products")
        .where("is_active", true)
        .whereRaw(
            "current_stock <= minimum_stock"
        )
        .select(
            "id",
            "name",
            "sku",
            "unit",
            "current_stock",
            "minimum_stock"
        )
        .orderBy(
            "current_stock",
            "asc"
        );

        /* =================================================
           16. RECENT SALES
        ================================================= */

        const recentSales =
            await db("sales as s")
                .leftJoin(
                    "customers as c",
                    "s.customer_id",
                    "c.id"
                )
                .select(
                    "s.id",
                    "s.invoice_number",
                    "c.name as customer_name",
                    "s.total_amount",
                    "s.paid_amount",
                    "s.balance_amount",
                    "s.payment_method",
                    "s.sale_date",
                    "s.status"
                )
                .orderBy(
                    "s.created_at",
                    "desc"
                )
                .limit(5);

        /* =================================================
           17. RECENT PURCHASES
        ================================================= */

        const recentPurchases =
            await db("purchases as p")
                .leftJoin(
                    "suppliers as s",
                    "p.supplier_id",
                    "s.id"
                )
                .select(
                    "p.id",
                    "p.purchase_number",
                    "s.name as supplier_name",
                    "p.total_amount",
                    "p.paid_amount",
                    "p.balance_amount",
                    "p.payment_method",
                    "p.purchase_date",
                    "p.status"
                )
                .orderBy(
                    "p.created_at",
                    "desc"
                )
                .limit(5);

        /* =================================================
           18. SUMMARY
        ================================================= */

        const summary: DashboardSummary = {
            todaySales,
            todayPurchases,
            todayExpenses,
            todayProfit,

            salesChange:
                calculateChange(
                    todaySales,
                    yesterdaySales
                ),

            purchasesChange:
                calculateChange(
                    todayPurchases,
                    yesterdayPurchases
                ),

            expensesChange:
                calculateChange(
                    todayExpenses,
                    yesterdayExpenses
                ),

            profitChange:
                calculateChange(
                    todayProfit,
                    yesterdayProfit
                ),
        };

        /* =================================================
           19. FINAL RESPONSE
        ================================================= */

        return {
            summary,

            salesPurchases:
                salesPurchaseData,

            profitOverview,

            outstanding: {
                customerOutstanding,
                supplierOutstanding,
            },

            stockAlerts,

            recentTransactions: {
                sales: recentSales,
                purchases: recentPurchases,
            },
        };
    } catch (error) {
        console.error(
            "Dashboard service error:",
            error
        );

        throw error;
    }
};