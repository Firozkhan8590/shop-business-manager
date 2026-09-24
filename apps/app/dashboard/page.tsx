"use client";

import { useEffect, useMemo, useState } from "react";

import {
  Bell,
  ChevronDown,
  CircleDollarSign,
  MoreHorizontal,
  Receipt,
  Search,
  ShoppingCart,
  TrendingUp,
  Wallet,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  RefreshCw,
} from "lucide-react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
} from "recharts";

import Sidebar from "../components/Sidebar";
import { DashboardData, getDashboard, RecentPurchase, RecentSale } from "@/src/lib/dashboard";



/* -------------------------------------------------------------------------- */
/* HELPERS                                                                    */
/* -------------------------------------------------------------------------- */

const formatCurrency = (value: number) => {
  return `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
};

const formatChartDay = (dateString: string) => {
  const date = new Date(`${dateString}T00:00:00`);

  return date.toLocaleDateString("en-IN", {
    weekday: "short",
  });
};

const formatDateTime = (dateString: string) => {
  if (!dateString) return "-";

  const date = new Date(`${dateString}T00:00:00`);

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  });
};

/* -------------------------------------------------------------------------- */
/* PAGE                                                                       */
/* -------------------------------------------------------------------------- */

export default function DashboardPage() {
  const [dashboard, setDashboard] =
    useState<DashboardData | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  /* ------------------------------------------------------------------------ */
  /* FETCH DASHBOARD                                                          */
  /* ------------------------------------------------------------------------ */

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getDashboard();

      setDashboard(data);
    } catch (err) {
      console.error(
        "Dashboard fetch error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load dashboard"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  /* ------------------------------------------------------------------------ */
  /* LOADING                                                                   */
  /* ------------------------------------------------------------------------ */

  if (loading && !dashboard) {
    return (
      <div className="min-h-screen bg-[#f5f7f7] text-slate-900">
        <Sidebar />

        <div className="lg:pl-[260px]">
          <div className="flex min-h-screen items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-[#087f70]" />

              <p className="text-sm text-slate-500">
                Loading dashboard...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ------------------------------------------------------------------------ */
  /* ERROR                                                                     */
  /* ------------------------------------------------------------------------ */

  if (error && !dashboard) {
    return (
      <div className="min-h-screen bg-[#f5f7f7] text-slate-900">
        <Sidebar />

        <div className="lg:pl-[260px]">
          <div className="flex min-h-screen items-center justify-center px-5">
            <div className="w-full max-w-md rounded-xl border border-red-100 bg-white p-6 text-center shadow-sm">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>

              <h2 className="mt-4 text-lg font-semibold text-slate-900">
                Unable to load dashboard
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                {error}
              </p>

              <button
                onClick={loadDashboard}
                className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg bg-[#087f70] px-4 text-sm font-semibold text-white transition hover:bg-[#066e61]"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return null;
  }

  /* ------------------------------------------------------------------------ */
  /* DATA                                                                      */
  /* ------------------------------------------------------------------------ */

  const {
    summary,
    salesPurchases,
    profitOverview,
    outstanding,
    stockAlerts,
    recentTransactions,
  } = dashboard;

  /* ------------------------------------------------------------------------ */
  /* CHART DATA                                                                */
  /* ------------------------------------------------------------------------ */

  const salesPurchaseChartData =
    salesPurchases.map((item) => ({
      day: formatChartDay(item.date),
      date: item.date,
      sales: Number(item.sales || 0),
      purchases: Number(item.purchases || 0),
    }));

  const profitChartData =
    profitOverview.map((item) => ({
      day: formatChartDay(item.date),
      date: item.date,
      profit: Number(item.profit || 0),
    }));

  /* ------------------------------------------------------------------------ */
  /* WEEKLY PROFIT                                                             */
  /* ------------------------------------------------------------------------ */

  const weeklyProfit = profitOverview.reduce(
    (total, item) =>
      total + Number(item.profit || 0),
    0
  );

  /* ------------------------------------------------------------------------ */
  /* RECENT TRANSACTIONS                                                       */
  /* ------------------------------------------------------------------------ */

  const sales = (
  recentTransactions?.sales || []
).map((sale: RecentSale) => ({
  type: "Sale",
  number: sale.invoice_number,
  party:
    sale.customer_name ||
    "Walk-in Customer",
  amount: Number(sale.total_amount || 0),
  method: sale.payment_method || "-",
  date: sale.sale_date,
  sortDate: sale.sale_date,
}));

const purchases = (
  recentTransactions?.purchases || []
).map(
  (purchase: RecentPurchase) => ({
    type: "Purchase",
    number: purchase.purchase_number,
    party:
      purchase.supplier_name ||
      "Unknown Supplier",
    amount: Number(
      purchase.total_amount || 0
    ),
    method:
      purchase.payment_method || "-",
    date: purchase.purchase_date,
    sortDate: purchase.purchase_date,
  })
);

const transactions = [...sales, ...purchases]
  .sort(
    (a, b) =>
      new Date(b.sortDate).getTime() -
      new Date(a.sortDate).getTime()
  )
  .slice(0, 5);
  /* ------------------------------------------------------------------------ */
  /* PAGE                                                                      */
  /* ------------------------------------------------------------------------ */

  return (
    <div className="min-h-screen bg-[#f5f7f7] text-slate-900">

      {/* ------------------------------------------------------------------ */}
      {/* SIDEBAR                                                            */}
      {/* ------------------------------------------------------------------ */}

      <Sidebar />

      {/* ------------------------------------------------------------------ */}
      {/* MAIN CONTENT                                                       */}
      {/* ------------------------------------------------------------------ */}

      <div className="lg:pl-[260px]">

        {/* TOPBAR */}

        <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-slate-200 bg-white/95 px-5 backdrop-blur lg:px-8">

          <div className="flex items-center gap-4">

            <div className="relative hidden sm:block">

              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                placeholder="Search anything..."
                className="h-10 w-[280px] rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition focus:border-[#0a8f78] focus:bg-white focus:ring-4 focus:ring-[#0a8f78]/10"
              />

            </div>

            <div className="sm:hidden">
              <p className="text-sm font-semibold text-slate-800">
                MAJ & SONS
              </p>
            </div>

          </div>

          <div className="flex items-center gap-3">

            {/* Refresh */}

            <button
              onClick={loadDashboard}
              disabled={loading}
              className="rounded-lg p-2.5 text-slate-500 transition hover:bg-slate-100 disabled:opacity-50"
              title="Refresh dashboard"
            >
              <RefreshCw
                className={`h-[18px] w-[18px] ${
                  loading
                    ? "animate-spin"
                    : ""
                }`}
              />
            </button>

            {/* Notification */}

            <button className="relative rounded-lg p-2.5 text-slate-500 hover:bg-slate-100">

              <Bell className="h-[19px] w-[19px]" />

              {stockAlerts.length > 0 && (
                <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-red-500" />
              )}

            </button>

            {/* User */}

            <div className="hidden h-9 w-px bg-slate-200 sm:block" />

            <div className="flex items-center gap-2.5">

              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e6f5f1] text-sm font-bold text-[#087f70]">
                A
              </div>

              <div className="hidden text-left sm:block">

                <p className="text-xs font-semibold text-slate-700">
                  Administrator
                </p>

                <p className="text-[10px] text-slate-400">
                  Admin
                </p>

              </div>

            </div>

          </div>

        </header>

        {/* ---------------------------------------------------------------- */}
        {/* PAGE                                                              */}
        {/* ---------------------------------------------------------------- */}

        <main className="mx-auto max-w-[1600px] px-5 py-7 lg:px-8">

          {/* PAGE HEADER */}

          <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end">

            <div>

              <p className="mb-1 text-xs font-medium uppercase tracking-[0.15em] text-[#0a8f78]">
                Business Overview
              </p>

              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Dashboard
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Here's what's happening in your business today.
              </p>

            </div>

            <div className="flex items-center gap-2">

              <button className="flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 text-sm font-medium text-slate-600 shadow-sm hover:bg-slate-50">
                Today
                <ChevronDown className="h-4 w-4" />
              </button>

              <button className="flex h-10 items-center gap-2 rounded-lg bg-[#087f70] px-4 text-sm font-semibold text-white shadow-sm hover:bg-[#066e61]">
                <Receipt className="h-4 w-4" />
                New Sale
              </button>

            </div>

          </div>

          {/* ---------------------------------------------------------------- */}
          {/* SUMMARY CARDS                                                     */}
          {/* ---------------------------------------------------------------- */}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

            <StatCard
              title="Today's Sales"
              value={formatCurrency(
                summary.todaySales
              )}
              change={`${summary.salesChange >= 0 ? "+" : ""}${summary.salesChange}%`}
              description="vs yesterday"
              icon={CircleDollarSign}
              positive={
                summary.salesChange >= 0
              }
            />

            <StatCard
              title="Today's Purchases"
              value={formatCurrency(
                summary.todayPurchases
              )}
              change={`${summary.purchasesChange >= 0 ? "+" : ""}${summary.purchasesChange}%`}
              description="vs yesterday"
              icon={ShoppingCart}
              positive={
                summary.purchasesChange >= 0
              }
            />

            <StatCard
              title="Today's Expenses"
              value={formatCurrency(
                summary.todayExpenses
              )}
              change={`${summary.expensesChange >= 0 ? "+" : ""}${summary.expensesChange}%`}
              description="vs yesterday"
              icon={Wallet}
              positive={
                summary.expensesChange <= 0
              }
            />

            <StatCard
              title="Today's Profit"
              value={formatCurrency(
                summary.todayProfit
              )}
              change={`${summary.profitChange >= 0 ? "+" : ""}${summary.profitChange}%`}
              description="vs yesterday"
              icon={TrendingUp}
              positive={
                summary.profitChange >= 0
              }
            />

          </div>

          {/* ---------------------------------------------------------------- */}
          {/* CHART ROW                                                         */}
          {/* ---------------------------------------------------------------- */}

          <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(340px,0.8fr)]">

            {/* BAR CHART */}

            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="mb-6 flex items-start justify-between">

                <div>

                  <h2 className="text-[15px] font-semibold text-slate-900">
                    Sales & Purchases
                  </h2>

                  <p className="mt-1 text-xs text-slate-400">
                    Business activity for the last 7 days
                  </p>

                </div>

                <button className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
                  <MoreHorizontal className="h-5 w-5" />
                </button>

              </div>

              <div className="h-[300px] w-full">

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >

                  <BarChart
                    data={
                      salesPurchaseChartData
                    }
                    margin={{
                      top: 5,
                      right: 5,
                      left: -15,
                      bottom: 5,
                    }}
                    barGap={5}
                  >

                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="day"
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fontSize: 11,
                      }}
                    />

                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fontSize: 10,
                      }}
                      tickFormatter={(value) =>
                        `₹${Number(
                          value / 1000
                        ).toFixed(0)}k`
                      }
                    />

                    <Tooltip
                      labelFormatter={(
                        label,
                        payload
                      ) => {
                        const item =
                          payload?.[0]
                            ?.payload;

                        return item?.date
                          ? formatDateTime(
                              item.date
                            )
                          : label;
                      }}
                      formatter={(
                        value,
                        name
                      ) => [
                        formatCurrency(
                          Number(value)
                        ),
                        name === "sales"
                          ? "Sales"
                          : "Purchases",
                      ]}
                      contentStyle={{
                        borderRadius: "8px",
                        border:
                          "1px solid #e2e8f0",
                        boxShadow:
                          "0 8px 30px rgba(15,23,42,0.08)",
                        fontSize: "12px",
                      }}
                    />

                    <Legend
                      verticalAlign="top"
                      align="right"
                      iconType="circle"
                      wrapperStyle={{
                        fontSize: "11px",
                        paddingBottom: "20px",
                      }}
                      formatter={(value) =>
                        value === "sales"
                          ? "Sales"
                          : "Purchases"
                      }
                    />

                    <Bar
                      dataKey="sales"
                      name="sales"
                      fill="#087f70"
                      radius={[
                        4,
                        4,
                        0,
                        0,
                      ]}
                      maxBarSize={26}
                    />

                    <Bar
                      dataKey="purchases"
                      name="purchases"
                      fill="#94a3b8"
                      radius={[
                        4,
                        4,
                        0,
                        0,
                      ]}
                      maxBarSize={26}
                    />

                  </BarChart>

                </ResponsiveContainer>

              </div>

            </section>

            {/* PROFIT CHART */}

            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="mb-5 flex items-start justify-between">

                <div>

                  <h2 className="text-[15px] font-semibold text-slate-900">
                    Profit Overview
                  </h2>

                  <p className="mt-1 text-xs text-slate-400">
                    Profit performance this week
                  </p>

                </div>

                <button className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
                  <MoreHorizontal className="h-5 w-5" />
                </button>

              </div>

              <div className="mb-3">

                <p className="text-2xl font-bold text-slate-900">
                  {formatCurrency(
                    weeklyProfit
                  )}
                </p>

                <p className="mt-1 text-xs font-medium text-slate-400">
                  Total profit for the last 7 days
                </p>

              </div>

              <div className="h-[190px]">

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >

                  <LineChart
                    data={profitChartData}
                    margin={{
                      top: 10,
                      right: 5,
                      left: -20,
                      bottom: 0,
                    }}
                  >

                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="day"
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fontSize: 10,
                      }}
                    />

                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{
                        fontSize: 9,
                      }}
                      tickFormatter={(value) =>
                        `₹${Number(
                          value / 1000
                        ).toFixed(0)}k`
                      }
                    />

                    <Tooltip
                      labelFormatter={(
                        label,
                        payload
                      ) => {
                        const item =
                          payload?.[0]
                            ?.payload;

                        return item?.date
                          ? formatDateTime(
                              item.date
                            )
                          : label;
                      }}
                      formatter={(value) => [
                        formatCurrency(
                          Number(value)
                        ),
                        "Profit",
                      ]}
                      contentStyle={{
                        borderRadius: "8px",
                        border:
                          "1px solid #e2e8f0",
                        fontSize: "11px",
                      }}
                    />

                    <Line
                      type="monotone"
                      dataKey="profit"
                      stroke="#087f70"
                      strokeWidth={2.5}
                      dot={{
                        r: 3,
                        strokeWidth: 2,
                        fill: "#ffffff",
                      }}
                      activeDot={{
                        r: 5,
                      }}
                    />

                  </LineChart>

                </ResponsiveContainer>

              </div>

            </section>

          </div>

          {/* ---------------------------------------------------------------- */}
          {/* SECOND ROW                                                        */}
          {/* ---------------------------------------------------------------- */}

          <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">

            {/* OUTSTANDING */}

            <section className="rounded-xl border border-slate-200 bg-white shadow-sm">

              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">

                <div>

                  <h2 className="text-[15px] font-semibold text-slate-900">
                    Outstanding
                  </h2>

                  <p className="mt-1 text-xs text-slate-400">
                    Current receivables and payables
                  </p>

                </div>

              </div>

              <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2">

                <div className="rounded-xl bg-emerald-50 p-5">

                  <div className="flex items-center gap-2">

                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white">
                      <ArrowDownRight className="h-4 w-4 text-emerald-600" />
                    </div>

                    <p className="text-xs font-medium text-emerald-700">
                      Customer Outstanding
                    </p>

                  </div>

                  <p className="mt-4 text-2xl font-bold text-slate-900">
                    {formatCurrency(
                      outstanding.customerOutstanding
                    )}
                  </p>

                  <p className="mt-1 text-[11px] text-slate-500">
                    Amount receivable
                  </p>

                </div>

                <div className="rounded-xl bg-blue-50 p-5">

                  <div className="flex items-center gap-2">

                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white">
                      <ArrowUpRight className="h-4 w-4 text-blue-600" />
                    </div>

                    <p className="text-xs font-medium text-blue-700">
                      Supplier Outstanding
                    </p>

                  </div>

                  <p className="mt-4 text-2xl font-bold text-slate-900">
                    {formatCurrency(
                      outstanding.supplierOutstanding
                    )}
                  </p>

                  <p className="mt-1 text-[11px] text-slate-500">
                    Amount payable
                  </p>

                </div>

              </div>

            </section>

            {/* LOW STOCK */}

            <section className="rounded-xl border border-slate-200 bg-white shadow-sm">

              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">

                <div>

                  <div className="flex items-center gap-2">

                    <h2 className="text-[15px] font-semibold text-slate-900">
                      Low Stock Items
                    </h2>

                    <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-bold text-red-600">
                      {stockAlerts.length}
                    </span>

                  </div>

                  <p className="mt-1 text-xs text-slate-400">
                    Products that need restocking
                  </p>

                </div>

                <button className="text-xs font-semibold text-[#087f70] hover:underline">
                  View inventory
                </button>

              </div>

              <div className="divide-y divide-slate-100">

                {stockAlerts.length === 0 ? (
                  <div className="px-5 py-8 text-center">
                    <p className="text-sm font-medium text-slate-600">
                      No low stock items
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Your inventory levels look good.
                    </p>
                  </div>
                ) : (
                  stockAlerts
                    .slice(0, 5)
                    .map((item) => {

                      const percentage =
                        item.minimum_stock > 0
                          ? Math.min(
                              (Number(
                                item.current_stock
                              ) /
                                Number(
                                  item.minimum_stock
                                )) *
                                100,
                              100
                            )
                          : 0;

                      return (
                        <div
                          key={item.id}
                          className="flex items-center gap-4 px-5 py-3.5"
                        >

                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50">
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                          </div>

                          <div className="min-w-0 flex-1">

                            <p className="truncate text-sm font-medium text-slate-800">
                              {item.name}
                            </p>

                            {item.sku && (
                              <p className="mt-0.5 text-[10px] text-slate-400">
                                SKU: {item.sku}
                              </p>
                            )}

                            <div className="mt-2 h-1.5 w-full max-w-[180px] overflow-hidden rounded-full bg-slate-100">

                              <div
                                className="h-full rounded-full bg-red-400"
                                style={{
                                  width: `${percentage}%`,
                                }}
                              />

                            </div>

                          </div>

                          <div className="text-right">

                            <p className="text-sm font-bold text-red-600">
                              {item.current_stock}
                            </p>

                            <p className="text-[10px] text-slate-400">
                              min{" "}
                              {
                                item.minimum_stock
                              }{" "}
                              {item.unit}
                            </p>

                          </div>

                        </div>
                      );
                    })
                )}

              </div>

            </section>

          </div>

          {/* ---------------------------------------------------------------- */}
          {/* RECENT TRANSACTIONS                                               */}
          {/* ---------------------------------------------------------------- */}

          <section className="mt-5 rounded-xl border border-slate-200 bg-white shadow-sm">

            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">

              <div>

                <h2 className="text-[15px] font-semibold text-slate-900">
                  Recent Transactions
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  Latest sales and purchases
                </p>

              </div>

              <button className="text-xs font-semibold text-[#087f70] hover:underline">
                View all
              </button>

            </div>

            {/* DESKTOP TABLE */}

            <div className="hidden overflow-x-auto md:block">

              <table className="w-full">

                <thead>

                  <tr className="border-b border-slate-100">

                    <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Type
                    </th>

                    <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Number
                    </th>

                    <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Party
                    </th>

                    <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Method
                    </th>

                    <th className="px-5 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Amount
                    </th>

                    <th className="px-5 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Date
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-slate-100">

                  {transactions.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-5 py-10 text-center text-sm text-slate-400"
                      >
                        No recent transactions
                      </td>
                    </tr>
                  ) : (
                    transactions.map(
                      (transaction) => (

                        <tr
                          key={`${transaction.type}-${transaction.number}`}
                          className="transition hover:bg-slate-50"
                        >

                          <td className="px-5 py-3.5">
                            <TransactionType
                              type={
                                transaction.type
                              }
                            />
                          </td>

                          <td className="px-5 py-3.5 text-sm font-medium text-slate-700">
                            {
                              transaction.number
                            }
                          </td>

                          <td className="px-5 py-3.5 text-sm text-slate-600">
                            {
                              transaction.party
                            }
                          </td>

                          <td className="px-5 py-3.5">

                            <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-500">
                              {
                                transaction.method
                              }
                            </span>

                          </td>

                          <td className="px-5 py-3.5 text-right text-sm font-semibold text-slate-800">
                            {formatCurrency(
                              transaction.amount
                            )}
                          </td>

                          <td className="px-5 py-3.5 text-right text-xs text-slate-400">
                            {formatDateTime(
                              transaction.date
                            )}
                          </td>

                        </tr>

                      )
                    )
                  )}

                </tbody>

              </table>

            </div>

            {/* MOBILE LIST */}

            <div className="divide-y divide-slate-100 md:hidden">

              {transactions.length === 0 ? (
                <div className="px-5 py-8 text-center text-sm text-slate-400">
                  No recent transactions
                </div>
              ) : (
                transactions.map(
                  (transaction) => (

                    <div
                      key={`${transaction.type}-${transaction.number}`}
                      className="flex items-center gap-3 px-5 py-4"
                    >

                      <TransactionType
                        type={
                          transaction.type
                        }
                      />

                      <div className="min-w-0 flex-1">

                        <p className="truncate text-sm font-medium text-slate-700">
                          {
                            transaction.party
                          }
                        </p>

                        <p className="mt-0.5 text-[11px] text-slate-400">
                          {
                            transaction.number
                          }
                        </p>

                      </div>

                      <div className="text-right">

                        <p className="text-sm font-semibold text-slate-800">
                          {formatCurrency(
                            transaction.amount
                          )}
                        </p>

                        <p className="mt-0.5 text-[10px] text-slate-400">
                          {formatDateTime(
                            transaction.date
                          )}
                        </p>

                      </div>

                    </div>

                  )
                )
              )}

            </div>

          </section>

          {/* FOOTER */}

          <footer className="flex flex-col items-center justify-between gap-2 py-7 text-[11px] text-slate-400 sm:flex-row">

            <p>
              © 2026 MAJ & SONS · Shop Business Manager
            </p>

            <p>
              Simple. Reliable. Profitable.
            </p>

          </footer>

        </main>

      </div>

    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* STAT CARD                                                                  */
/* -------------------------------------------------------------------------- */

function StatCard({
  title,
  value,
  change,
  description,
  icon: Icon,
  positive,
}: {
  title: string;
  value: string;
  change: string;
  description: string;
  icon: React.ElementType;
  positive: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

      <div className="flex items-start justify-between">

        <div>

          <p className="text-xs font-medium text-slate-400">
            {title}
          </p>

          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {value}
          </p>

        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#e6f5f1] text-[#087f70]">
          <Icon className="h-[19px] w-[19px]" />
        </div>

      </div>

      <div className="mt-4 flex items-center gap-2">

        <span
          className={`
            flex items-center gap-0.5 text-[11px] font-semibold
            ${
              positive
                ? "text-emerald-600"
                : "text-red-500"
            }
          `}
        >

          {positive ? (
            <ArrowUpRight className="h-3 w-3" />
          ) : (
            <ArrowDownRight className="h-3 w-3" />
          )}

          {change}

        </span>

        <span className="text-[11px] text-slate-400">
          {description}
        </span>

      </div>

    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* TRANSACTION TYPE                                                           */
/* -------------------------------------------------------------------------- */

function TransactionType({
  type,
}: {
  type: string;
}) {
  const config = {
    Sale: {
      icon: ArrowUpRight,
      className:
        "bg-emerald-50 text-emerald-600",
    },

    Purchase: {
      icon: ArrowDownRight,
      className:
        "bg-blue-50 text-blue-600",
    },

    Expense: {
      icon: Wallet,
      className:
        "bg-orange-50 text-orange-600",
    },
  };

  const current =
    config[
      type as keyof typeof config
    ] || config.Sale;

  const Icon = current.icon;

  return (
    <div className="flex items-center gap-2">

      <div
        className={`flex h-8 w-8 items-center justify-center rounded-lg ${current.className}`}
      >
        <Icon className="h-4 w-4" />
      </div>

      <span className="text-xs font-medium text-slate-600">
        {type}
      </span>

    </div>
  );
}