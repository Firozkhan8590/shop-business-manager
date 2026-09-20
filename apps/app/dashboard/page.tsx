"use client";

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

/* -------------------------------------------------------------------------- */
/* STATIC DATA                                                                */
/* -------------------------------------------------------------------------- */

const salesPurchaseData = [
  { day: "Mon", sales: 18500, purchases: 9200 },
  { day: "Tue", sales: 22400, purchases: 11800 },
  { day: "Wed", sales: 19800, purchases: 7600 },
  { day: "Thu", sales: 27600, purchases: 14200 },
  { day: "Fri", sales: 24900, purchases: 10800 },
  { day: "Sat", sales: 32100, purchases: 16400 },
  { day: "Sun", sales: 28500, purchases: 12100 },
];

const profitData = [
  { day: "Mon", profit: 7200 },
  { day: "Tue", profit: 8600 },
  { day: "Wed", profit: 9100 },
  { day: "Thu", profit: 11200 },
  { day: "Fri", profit: 10400 },
  { day: "Sat", profit: 13800 },
  { day: "Sun", profit: 12100 },
];

const topProducts = [
  {
    name: "Plastic Storage Box",
    category: "Storage",
    quantity: 86,
    amount: "₹12,040",
  },
  {
    name: "Kitchen Container Set",
    category: "Kitchen",
    quantity: 72,
    amount: "₹9,360",
  },
  {
    name: "Plastic Bucket",
    category: "Household",
    quantity: 64,
    amount: "₹7,680",
  },
  {
    name: "Water Bottle",
    category: "Kitchen",
    quantity: 51,
    amount: "₹5,610",
  },
  {
    name: "Plastic Mug",
    category: "Household",
    quantity: 44,
    amount: "₹3,520",
  },
];

const lowStockItems = [
  {
    name: "Plastic Mug",
    stock: 4,
    minimum: 20,
    unit: "pcs",
  },
  {
    name: "Storage Basket",
    stock: 7,
    minimum: 25,
    unit: "pcs",
  },
  {
    name: "Water Bottle",
    stock: 9,
    minimum: 30,
    unit: "pcs",
  },
  {
    name: "Kitchen Tray",
    stock: 12,
    minimum: 20,
    unit: "pcs",
  },
];

const recentTransactions = [
  {
    type: "Sale",
    number: "INV-2026-0148",
    party: "Walk-in Customer",
    amount: "₹2,450",
    method: "Cash",
    time: "10:42 AM",
  },
  {
    type: "Sale",
    number: "INV-2026-0147",
    party: "Ameen Stores",
    amount: "₹5,840",
    method: "Credit",
    time: "10:15 AM",
  },
  {
    type: "Purchase",
    number: "PUR-2026-0084",
    party: "KPL Plastics",
    amount: "₹12,400",
    method: "Credit",
    time: "09:48 AM",
  },
  {
    type: "Expense",
    number: "EXP-2026-0032",
    party: "Shop Electricity",
    amount: "₹2,850",
    method: "Bank",
    time: "Yesterday",
  },
  {
    type: "Sale",
    number: "INV-2026-0146",
    party: "Nissar Traders",
    amount: "₹8,250",
    method: "UPI",
    time: "Yesterday",
  },
];

/* -------------------------------------------------------------------------- */
/* PAGE                                                                       */
/* -------------------------------------------------------------------------- */

export default function DashboardPage() {
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

            {/* Notification */}

            <button className="relative rounded-lg p-2.5 text-slate-500 hover:bg-slate-100">

              <Bell className="h-[19px] w-[19px]" />

              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-red-500" />

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
              value="₹28,450"
              change="+12.5%"
              description="vs yesterday"
              icon={CircleDollarSign}
              positive
            />

            <StatCard
              title="Today's Purchases"
              value="₹12,840"
              change="+5.8%"
              description="vs yesterday"
              icon={ShoppingCart}
              positive
            />

            <StatCard
              title="Today's Expenses"
              value="₹3,250"
              change="-8.2%"
              description="vs yesterday"
              icon={Wallet}
              positive
            />

            <StatCard
              title="Today's Profit"
              value="₹12,360"
              change="+18.4%"
              description="vs yesterday"
              icon={TrendingUp}
              positive
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

                <ResponsiveContainer width="100%" height="100%">

                  <BarChart
                    data={salesPurchaseData}
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
                        `₹${value / 1000}k`
                      }
                    />

                    <Tooltip
                      formatter={(value, name) => [
                        `₹${Number(value).toLocaleString("en-IN")}`,
                        name === "sales"
                          ? "Sales"
                          : "Purchases",
                      ]}
                      contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid #e2e8f0",
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
                      radius={[4, 4, 0, 0]}
                      maxBarSize={26}
                    />

                    <Bar
                      dataKey="purchases"
                      name="purchases"
                      fill="#94a3b8"
                      radius={[4, 4, 0, 0]}
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
                  ₹72,400
                </p>

                <p className="mt-1 text-xs font-medium text-emerald-600">
                  +14.8% this week
                </p>

              </div>

              <div className="h-[190px]">

                <ResponsiveContainer width="100%" height="100%">

                  <LineChart
                    data={profitData}
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
                        `₹${value / 1000}k`
                      }
                    />

                    <Tooltip
                      formatter={(value) => [
                        `₹${Number(value).toLocaleString("en-IN")}`,
                        "Profit",
                      ]}
                      contentStyle={{
                        borderRadius: "8px",
                        border: "1px solid #e2e8f0",
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

            {/* TOP PRODUCTS */}

            <section className="rounded-xl border border-slate-200 bg-white shadow-sm">

              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">

                <div>

                  <h2 className="text-[15px] font-semibold text-slate-900">
                    Top Selling Products
                  </h2>

                  <p className="mt-1 text-xs text-slate-400">
                    Best performing products this week
                  </p>

                </div>

                <button className="text-xs font-semibold text-[#087f70] hover:underline">
                  View all
                </button>

              </div>

              <div className="divide-y divide-slate-100">

                {topProducts.map((product, index) => (

                  <div
                    key={product.name}
                    className="flex items-center gap-4 px-5 py-3.5"
                  >

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-500">
                      {String(index + 1).padStart(2, "0")}
                    </div>

                    <div className="min-w-0 flex-1">

                      <p className="truncate text-sm font-medium text-slate-800">
                        {product.name}
                      </p>

                      <p className="mt-0.5 text-[11px] text-slate-400">
                        {product.category}
                      </p>

                    </div>

                    <div className="hidden text-right sm:block">

                      <p className="text-xs font-semibold text-slate-700">
                        {product.quantity} sold
                      </p>

                    </div>

                    <div className="w-[75px] text-right">

                      <p className="text-sm font-semibold text-slate-800">
                        {product.amount}
                      </p>

                    </div>

                  </div>

                ))}

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
                      {lowStockItems.length}
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

                {lowStockItems.map((item) => {

                  const percentage = Math.min(
                    (item.stock / item.minimum) * 100,
                    100
                  );

                  return (
                    <div
                      key={item.name}
                      className="flex items-center gap-4 px-5 py-3.5"
                    >

                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      </div>

                      <div className="min-w-0 flex-1">

                        <p className="truncate text-sm font-medium text-slate-800">
                          {item.name}
                        </p>

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
                          {item.stock}
                        </p>

                        <p className="text-[10px] text-slate-400">
                          min {item.minimum} {item.unit}
                        </p>

                      </div>

                    </div>
                  );

                })}

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
                  Latest sales, purchases and expenses
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
                      Time
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-slate-100">

                  {recentTransactions.map((transaction) => (

                    <tr
                      key={transaction.number}
                      className="transition hover:bg-slate-50"
                    >

                      <td className="px-5 py-3.5">
                        <TransactionType type={transaction.type} />
                      </td>

                      <td className="px-5 py-3.5 text-sm font-medium text-slate-700">
                        {transaction.number}
                      </td>

                      <td className="px-5 py-3.5 text-sm text-slate-600">
                        {transaction.party}
                      </td>

                      <td className="px-5 py-3.5">

                        <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-500">
                          {transaction.method}
                        </span>

                      </td>

                      <td className="px-5 py-3.5 text-right text-sm font-semibold text-slate-800">
                        {transaction.amount}
                      </td>

                      <td className="px-5 py-3.5 text-right text-xs text-slate-400">
                        {transaction.time}
                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

            {/* MOBILE LIST */}

            <div className="divide-y divide-slate-100 md:hidden">

              {recentTransactions.map((transaction) => (

                <div
                  key={transaction.number}
                  className="flex items-center gap-3 px-5 py-4"
                >

                  <TransactionType type={transaction.type} />

                  <div className="min-w-0 flex-1">

                    <p className="truncate text-sm font-medium text-slate-700">
                      {transaction.party}
                    </p>

                    <p className="mt-0.5 text-[11px] text-slate-400">
                      {transaction.number}
                    </p>

                  </div>

                  <div className="text-right">

                    <p className="text-sm font-semibold text-slate-800">
                      {transaction.amount}
                    </p>

                    <p className="mt-0.5 text-[10px] text-slate-400">
                      {transaction.time}
                    </p>

                  </div>

                </div>

              ))}

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
      className: "bg-emerald-50 text-emerald-600",
    },
    Purchase: {
      icon: ArrowDownRight,
      className: "bg-blue-50 text-blue-600",
    },
    Expense: {
      icon: Wallet,
      className: "bg-orange-50 text-orange-600",
    },
  };

  const current =
    config[type as keyof typeof config] || config.Sale;

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