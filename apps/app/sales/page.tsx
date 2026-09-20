"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Eye,
  Pencil,
  Loader2,
  ShoppingCart,
  Receipt,
  Wallet,
  CreditCard,
  CalendarDays,
} from "lucide-react";

import Sidebar from "../components/Sidebar";

import {
  Sale,
  getSales,
} from "@/src/lib/sales";

type DateFilter =
  | "today"
  | "all"
  | "custom";

/* ============================================================
   LOCAL DATE HELPER
============================================================ */

function getTodayDate() {
  const today = new Date();

  const year =
    today.getFullYear();

  const month = String(
    today.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    today.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/* ============================================================
   PAGE
============================================================ */

export default function SalesPage() {
  const router = useRouter();

  const [sales, setSales] =
    useState<Sale[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /* ============================================================
     DATE FILTER
  ============================================================ */

  const [dateFilter, setDateFilter] =
    useState<DateFilter>("today");

  const [selectedDate, setSelectedDate] =
    useState(getTodayDate());

  const [todayKey, setTodayKey] =
    useState(getTodayDate());

  /* ============================================================
     AUTOMATIC MIDNIGHT REFRESH
  ============================================================ */

  useEffect(() => {
    if (dateFilter !== "today") {
      return;
    }

    const now = new Date();

    const nextMidnight =
      new Date(now);

    nextMidnight.setHours(
      24,
      0,
      0,
      0
    );

    const delay =
      nextMidnight.getTime() -
      now.getTime() +
      500;

    const timer =
      window.setTimeout(() => {
        setTodayKey(
          getTodayDate()
        );
      }, delay);

    return () => {
      window.clearTimeout(timer);
    };
  }, [
    dateFilter,
    todayKey,
  ]);

  /* ============================================================
     LOAD SALES
  ============================================================ */

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError("");

        let date:
          | string
          | undefined;

        if (
          dateFilter === "today"
        ) {
          date = getTodayDate();
        }

        if (
          dateFilter === "custom"
        ) {
          date = selectedDate;
        }

        const saleData =
          await getSales(date);

        setSales(saleData);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load sales"
        );
      } finally {
        setLoading(false);
      }
    }

    if (
      dateFilter !== "custom" ||
      selectedDate
    ) {
      loadData();
    }
  }, [
    dateFilter,
    selectedDate,
    todayKey,
  ]);

  /* ============================================================
     FORMAT AMOUNT
  ============================================================ */

  function formatAmount(
    amount: string
  ) {
    return Number(
      amount || 0
    ).toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );
  }

  /* ============================================================
     FORMAT DATE
  ============================================================ */

  function formatInvoiceDate(
    value: string
  ) {
    if (!value) {
      return "-";
    }

    const datePart =
      value.split("T")[0];

    const [
      year,
      month,
      day,
    ] = datePart.split("-");

    if (
      !year ||
      !month ||
      !day
    ) {
      return value;
    }

    return `${day}-${month}-${year}`;
  }

  /* ============================================================
     SUMMARY
  ============================================================ */

  const totalSales =
    sales.reduce(
      (sum, sale) =>
        sum +
        Number(
          sale.total_amount || 0
        ),
      0
    );

  const totalReceived =
    sales.reduce(
      (sum, sale) =>
        sum +
        Number(
          sale.paid_amount || 0
        ),
      0
    );

  const totalOutstanding =
    sales.reduce(
      (sum, sale) =>
        sum +
        Number(
          sale.balance_amount || 0
        ),
      0
    );

  const completedSales =
    sales.filter(
      (sale) =>
        sale.status ===
        "completed"
    ).length;

  /* ============================================================
     FILTER LABEL
  ============================================================ */

  function getFilterLabel() {
    if (
      dateFilter === "today"
    ) {
      return "Sales";
    }

    if (
      dateFilter === "all"
    ) {
      return "All Sales";
    }

    return "Sales";
  }

  /* ============================================================
     ACTIVE DATE TEXT
  ============================================================ */

  function getActiveDateText() {
    if (
      dateFilter === "today"
    ) {
      return getTodayDate();
    }

    if (
      dateFilter === "custom"
    ) {
      return selectedDate;
    }

    return "";
  }

  /* ============================================================
     TABLE DESCRIPTION
  ============================================================ */

  function getTableDescription() {
    if (
      dateFilter === "today"
    ) {
      return "Today's sales transactions.";
    }

    if (
      dateFilter === "custom"
    ) {
      return "Sales transactions for the selected date.";
    }

    return "View and manage all sales transactions.";
  }

  /* ============================================================
     EMPTY STATE TITLE
  ============================================================ */

  function getEmptyTitle() {
    if (
      dateFilter === "today"
    ) {
      return "No sales today";
    }

    return "No sales found";
  }

  /* ============================================================
     EMPTY STATE DESCRIPTION
  ============================================================ */

  function getEmptyDescription() {
    if (
      dateFilter === "today"
    ) {
      return "No sales have been recorded today.";
    }

    if (
      dateFilter === "custom" &&
      selectedDate
    ) {
      return `No sales found for ${formatInvoiceDate(
        selectedDate
      )}.`;
    }

    return "No sales were found for the selected filter.";
  }

  /* ============================================================
     UI
  ============================================================ */

  return (
    <div className="min-h-screen bg-slate-50">

      <Sidebar />

      <main className="ml-0 min-h-screen lg:ml-[260px]">

        <div className="p-4 sm:p-6 lg:p-8">

          {/* ==================================================
              HEADER
          ================================================== */}

          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <div className="flex items-center gap-3">

                <div className="rounded-lg bg-teal-50 p-3 text-teal-700">

                  <ShoppingCart
                    size={22}
                  />

                </div>

                <div>

                  <h1 className="text-2xl font-bold text-slate-900">
                    Sales
                  </h1>

                  <p className="mt-1 text-sm text-slate-500">
                    Manage sales invoices and customer transactions.
                  </p>

                </div>

              </div>

            </div>

            {/* NEW SALE */}

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/sales/new"
                )
              }
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-800"
            >

              <Plus
                size={18}
              />

              New Sale

            </button>

          </div>

          {/* ==================================================
              DATE FILTER CARD
          ================================================== */}

          <div className="mb-6 rounded-xl border border-slate-200 bg-white shadow-sm">

            <div className="flex flex-col gap-4 px-4 py-4 sm:px-5 lg:flex-row lg:items-center lg:justify-between">

              {/* FILTER BUTTONS */}

              <div className="flex flex-wrap items-center gap-2">

                <button
                  type="button"
                  onClick={() => {
                    setDateFilter(
                      "today"
                    );

                    setSelectedDate(
                      getTodayDate()
                    );
                  }}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                    dateFilter ===
                    "today"
                      ? "bg-teal-700 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Today
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setDateFilter(
                      "all"
                    )
                  }
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                    dateFilter ===
                    "all"
                      ? "bg-teal-700 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  All Sales
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setDateFilter(
                      "custom"
                    );

                    if (
                      !selectedDate
                    ) {
                      setSelectedDate(
                        getTodayDate()
                      );
                    }
                  }}
                  className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
                    dateFilter ===
                    "custom"
                      ? "bg-teal-700 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >

                  <CalendarDays
                    size={16}
                  />

                  Custom Date

                </button>

              </div>

              {/* CUSTOM DATE */}

              {dateFilter ===
                "custom" && (

                <div className="flex items-center gap-2">

                  <span className="text-sm text-slate-500">
                    Date:
                  </span>

                  <input
                    type="date"
                    value={
                      selectedDate
                    }
                    onChange={(e) =>
                      setSelectedDate(
                        e.target.value
                      )
                    }
                    className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                  />

                </div>

              )}

            </div>

            {/* FILTER INFO */}

            <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 sm:px-5">

              <div className="text-sm text-slate-500">

                Showing{" "}

                <span className="font-semibold text-slate-800">

                  {getFilterLabel()}

                  {dateFilter !==
                    "all" &&
                    getActiveDateText() && (
                      <>
                        {" "}
                        on{" "}
                        {formatInvoiceDate(
                          getActiveDateText()
                        )}
                      </>
                    )}

                </span>

              </div>

              <div className="text-xs text-slate-400">

                {sales.length}{" "}

                {sales.length ===
                1
                  ? "sale"
                  : "sales"}

              </div>

            </div>

          </div>

          {/* ==================================================
              SUMMARY CARDS
          ================================================== */}

          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

            {/* TOTAL SALES */}

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="flex items-start justify-between">

                <div>

                  <p className="text-sm font-medium text-slate-500">
                    Total Sales
                  </p>

                  <p className="mt-2 text-2xl font-bold text-slate-900">

                    ₹
                    {formatAmount(
                      totalSales.toString()
                    )}

                  </p>

                </div>

                <div className="rounded-lg bg-teal-50 p-2.5 text-teal-700">

                  <Receipt
                    size={20}
                  />

                </div>

              </div>

            </div>

            {/* TOTAL RECEIVED */}

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="flex items-start justify-between">

                <div>

                  <p className="text-sm font-medium text-slate-500">
                    Total Received
                  </p>

                  <p className="mt-2 text-2xl font-bold text-slate-900">

                    ₹
                    {formatAmount(
                      totalReceived.toString()
                    )}

                  </p>

                </div>

                <div className="rounded-lg bg-blue-50 p-2.5 text-blue-700">

                  <Wallet
                    size={20}
                  />

                </div>

              </div>

            </div>

            {/* OUTSTANDING */}

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="flex items-start justify-between">

                <div>

                  <p className="text-sm font-medium text-slate-500">
                    Outstanding
                  </p>

                  <p className="mt-2 text-2xl font-bold text-slate-900">

                    ₹
                    {formatAmount(
                      totalOutstanding.toString()
                    )}

                  </p>

                </div>

                <div className="rounded-lg bg-amber-50 p-2.5 text-amber-700">

                  <CreditCard
                    size={20}
                  />

                </div>

              </div>

            </div>

            {/* COMPLETED SALES */}

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="flex items-start justify-between">

                <div>

                  <p className="text-sm font-medium text-slate-500">
                    Completed Sales
                  </p>

                  <p className="mt-2 text-2xl font-bold text-slate-900">
                    {
                      completedSales
                    }
                  </p>

                </div>

                <div className="rounded-lg bg-green-50 p-2.5 text-green-700">

                  <ShoppingCart
                    size={20}
                  />

                </div>

              </div>

            </div>

          </div>

          {/* ==================================================
              ERROR
          ================================================== */}

          {error && (

            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">

              {error}

            </div>

          )}

          {/* ==================================================
              LOADING
          ================================================== */}

          {loading ? (

            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">

              <div className="flex min-h-[300px] items-center justify-center">

                <div className="flex items-center gap-2 text-sm text-slate-500">

                  <Loader2
                    size={18}
                    className="animate-spin"
                  />

                  Loading sales...

                </div>

              </div>

            </div>

          ) : (

            /* ==================================================
               SALES LIST CARD
            ================================================== */

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

              {/* ==================================================
                  LIST HEADER
              ================================================== */}

              <div className="border-b border-slate-200 px-6 py-5">

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

                  <div>

                    <h2 className="font-semibold text-slate-900">
                      Sales Invoices
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">

                      {dateFilter ===
                      "today"
                        ? "Today's sales transactions."
                        : dateFilter ===
                          "custom"
                        ? "Sales transactions for the selected date."
                        : "View and manage all sales transactions."}

                    </p>

                  </div>

                  {/* RIGHT SIDE DATE */}

                  {dateFilter !==
                    "all" &&
                    getActiveDateText() && (

                    <div className="text-sm text-slate-400">

                      Sales on{" "}

                      {formatInvoiceDate(
                        getActiveDateText()
                      )}

                    </div>

                  )}

                </div>

              </div>

              {/* ==================================================
                  EMPTY STATE
              ================================================== */}

              {sales.length ===
              0 ? (

                <div className="flex min-h-[250px] flex-col items-center justify-center px-6 text-center">

                  <div className="mb-4 rounded-full bg-slate-100 p-4 text-slate-400">

                    <ShoppingCart
                      size={26}
                    />

                  </div>

                  <h3 className="text-sm font-semibold text-slate-900">

                    {getEmptyTitle()}

                  </h3>

                  <p className="mt-1 text-sm text-slate-500">

                    {getEmptyDescription()}

                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        "/sales/new"
                      )
                    }
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800"
                  >

                    <Plus
                      size={16}
                    />

                    New Sale

                  </button>

                </div>

              ) : (

                /* ==================================================
                   SALES TABLE
                ================================================== */

                <div className="overflow-x-auto">

                  <table className="w-full min-w-[1000px] text-left">

                    <thead>

                      <tr className="border-b border-slate-200 bg-slate-50">

                        <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Invoice No.
                        </th>

                        <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Customer
                        </th>

                        <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Date
                        </th>

                        <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Total
                        </th>

                        <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Paid
                        </th>

                        <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Balance
                        </th>

                        <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Status
                        </th>

                        <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Actions
                        </th>

                      </tr>

                    </thead>

                    <tbody className="divide-y divide-slate-100">

                      {sales.map(
                        (sale) => (

                          <tr
                            key={
                              sale.id
                            }
                            className="hover:bg-slate-50"
                          >

                            {/* INVOICE */}

                            <td className="px-6 py-4">

                              <div className="font-medium text-slate-900">

                                {
                                  sale.invoice_number
                                }

                              </div>

                              <div className="mt-0.5 text-xs text-slate-400">

                                #
                                {
                                  sale.id
                                }

                              </div>

                            </td>

                            {/* CUSTOMER */}

                            <td className="px-6 py-4">

                              <span className="text-sm text-slate-700">

                                {
                                  sale.customer_name ||
                                  "Walk-in Customer"
                                }

                              </span>

                            </td>

                            {/* DATE */}

                            <td className="px-6 py-4">

                              <span className="text-sm text-slate-700">

                                {formatInvoiceDate(
                                  sale.sale_date
                                )}

                              </span>

                            </td>

                            {/* TOTAL */}

                            <td className="px-6 py-4 text-right">

                              <span className="text-sm font-semibold text-slate-900">

                                ₹
                                {formatAmount(
                                  sale.total_amount
                                )}

                              </span>

                            </td>

                            {/* PAID */}

                            <td className="px-6 py-4 text-right">

                              <span className="text-sm text-slate-700">

                                ₹
                                {formatAmount(
                                  sale.paid_amount
                                )}

                              </span>

                            </td>

                            {/* BALANCE */}

                            <td className="px-6 py-4 text-right">

                              <span
                                className={`text-sm font-semibold ${
                                  Number(
                                    sale.balance_amount
                                  ) > 0
                                    ? "text-amber-700"
                                    : "text-slate-700"
                                }`}
                              >

                                ₹
                                {formatAmount(
                                  sale.balance_amount
                                )}

                              </span>

                            </td>

                            {/* STATUS */}

                            <td className="px-6 py-4 text-center">

                              <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                                  sale.status ===
                                  "completed"
                                    ? "bg-green-50 text-green-700"
                                    : sale.status ===
                                      "cancelled"
                                    ? "bg-red-50 text-red-700"
                                    : "bg-slate-100 text-slate-600"
                                }`}
                              >

                                {
                                  sale.status
                                }

                              </span>

                            </td>

                            {/* ACTIONS */}

                            <td className="px-6 py-4">

                              <div className="flex items-center justify-end gap-2">

                                <button
                                  type="button"
                                  title="View Sale"
                                  onClick={() =>
                                    router.push(
                                      `/sales/${sale.id}`
                                    )
                                  }
                                  className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                                >

                                  <Eye
                                    size={17}
                                  />

                                </button>

                                <button
                                  type="button"
                                  title="Edit Sale"
                                  onClick={() =>
                                    router.push(
                                      `/sales/${sale.id}/edit`
                                    )
                                  }
                                  className="rounded-lg p-2 text-slate-500 hover:bg-teal-50 hover:text-teal-700"
                                >

                                  <Pencil
                                    size={17}
                                  />

                                </button>

                              </div>

                            </td>

                          </tr>

                        )
                      )}

                    </tbody>

                  </table>

                </div>

              )}

            </div>

          )}

        </div>

      </main>

    </div>
  );
}