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
    day: string;
    sales: number;
    purchases: number;
}

export interface ProfitData {
    date: string;
    day: string;
    profit: number;
}

export interface StockAlert {
    id: number;
    name: string;
    unit: string;
    currentStock: number;
    minimumStock: number;
}

export interface RecentSale {
    id: number;
    invoiceNumber: string;
    customerName: string;
    date: string;
    amount: number;
}

export interface RecentPurchase {
    id: number;
    purchaseNumber: string;
    supplierName: string;
    date: string;
    amount: number;
}

export interface DashboardData {
    summary: DashboardSummary;

    salesPurchases: SalesPurchaseData[];

    profitOverview: {
        totalProfit: number;
        daily: ProfitData[];
    };

    outstanding: {
        customers: number;
        suppliers: number;
    };

    stockAlerts: {
        totalAlerts: number;
        products: StockAlert[];
    };

    recentTransactions: {
        sales: RecentSale[];
        purchases: RecentPurchase[];
    };
}