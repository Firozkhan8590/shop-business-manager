// src/lib/dashboard.ts

const API_BASE_URL = "http://localhost:4000/api";

/* =========================================================
   TYPES
========================================================= */

export interface DashboardSummary {
    todaySales: number;
    todayPurchases: number;
    todayExpenses: number;
    todayProfit: number;

    salesChange: number;
    purchasesChange: number;
    expensesChange: number;
    profitChange: number;
}

export interface SalesPurchaseData {
    date: string;
    sales: number;
    purchases: number;
}

export interface ProfitData {
    date: string;
    profit: number;
}

export interface StockAlert {
    id: number;
    name: string;
    sku: string | null;
    unit: string;
    current_stock: number;
    minimum_stock: number;
}

export interface RecentSale {
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

export interface RecentPurchase {
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

export interface DashboardOutstanding {
    customerOutstanding: number;
    supplierOutstanding: number;
}

export interface RecentTransactions {
    sales: RecentSale[];
    purchases: RecentPurchase[];
}

export interface DashboardData {
    summary: DashboardSummary;
    salesPurchases: SalesPurchaseData[];
    profitOverview: ProfitData[];
    outstanding: DashboardOutstanding;
    stockAlerts: StockAlert[];
    recentTransactions: RecentTransactions;
}

export interface DashboardResponse {
    success: boolean;
    message: string;
    data: DashboardData;
}

/* =========================================================
   GET DASHBOARD
========================================================= */

export const getDashboard = async (): Promise<DashboardData> => {
    const response = await fetch(
        `${API_BASE_URL}/dashboard`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        }
    );

    if (!response.ok) {
        let errorMessage =
            "Failed to fetch dashboard data";

        try {
            const errorData = await response.json();

            if (errorData?.message) {
                errorMessage = errorData.message;
            }
        } catch {
            // Ignore JSON parsing error
        }

        throw new Error(errorMessage);
    }

    const result: DashboardResponse =
        await response.json();

    if (!result.success) {
        throw new Error(
            result.message ||
                "Failed to fetch dashboard data"
        );
    }

    return result.data;
};