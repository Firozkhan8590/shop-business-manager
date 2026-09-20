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
  Purchase,
  getPurchases,
} from "@/src/lib/purchase";

import {
  getSuppliers,
  Supplier,
} from "@/src/lib/supplier";

export default function PurchasesPage() {
  const router = useRouter();

  const [purchases, setPurchases] = useState<
    Purchase[]
  >([]);

  const [suppliers, setSuppliers] = useState<
    Supplier[]
  >([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /* ============================================================
     DATE FILTER
  ============================================================ */

  const [filterType, setFilterType] =
    useState<
      "today" | "all" | "custom"
    >("today");

  const [selectedDate, setSelectedDate] =
    useState("");

  /* ============================================================
     GET LOCAL TODAY DATE
  ============================================================ */

  function getTodayDate() {
    const today = new Date();

    const year =
      today.getFullYear();

    const month =
      String(
        today.getMonth() + 1
      ).padStart(2, "0");

    const day =
      String(
        today.getDate()
      ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  /* ============================================================
     INITIAL DATE
  ============================================================ */

  useEffect(() => {
    setSelectedDate(
      getTodayDate()
    );
  }, []);

  /* ============================================================
     LOAD DATA
  ============================================================ */

  useEffect(() => {
    if (
      filterType === "custom" &&
      !selectedDate
    ) {
      return;
    }

    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const date =
          filterType === "all"
            ? undefined
            : filterType === "today"
            ? getTodayDate()
            : selectedDate;

        const [
          purchaseData,
          supplierData,
        ] = await Promise.all([
          getPurchases(date),
          getSuppliers(),
        ]);

        setPurchases(
          purchaseData
        );

        setSuppliers(
          supplierData
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load purchases"
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [
    filterType,
    selectedDate,
  ]);

  /* ============================================================
     MIDNIGHT REFRESH
  ============================================================ */

  useEffect(() => {
    if (
      filterType !== "today"
    ) {
      return;
    }

    const interval =
      setInterval(() => {
        const today =
          getTodayDate();

        setSelectedDate(
          (currentDate) =>
            currentDate === today
              ? currentDate
              : today
        );
      }, 60 * 1000);

    return () =>
      clearInterval(
        interval
      );
  }, [filterType]);

  /* ============================================================
     SUPPLIER NAME
  ============================================================ */

  function getSupplierName(
    supplierId: number | null
  ) {
    if (!supplierId) {
      return "No Supplier";
    }

    const supplier =
      suppliers.find(
        (item) =>
          item.id === supplierId
      );

    return (
      supplier?.name ||
      "Unknown Supplier"
    );
  }

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
    ] =
      datePart.split("-");

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
     FORMAT FILTER DATE
  ============================================================ */

  function formatFilterDate(
    value: string
  ) {
    if (!value) {
      return "";
    }

    const [
      year,
      month,
      day,
    ] =
      value.split("-");

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

  const totalPurchases =
    purchases.reduce(
      (sum, purchase) =>
        sum +
        Number(
          purchase.total_amount || 0
        ),
      0
    );

  const totalPaid =
    purchases.reduce(
      (sum, purchase) =>
        sum +
        Number(
          purchase.paid_amount || 0
        ),
      0
    );

  const totalBalance =
    purchases.reduce(
      (sum, purchase) =>
        sum +
        Number(
          purchase.balance_amount || 0
        ),
      0
    );

  const completedPurchases =
    purchases.filter(
      (purchase) =>
        purchase.status ===
        "completed"
    ).length;

  /* ============================================================
     FILTER LABEL
  ============================================================ */

  function getFilterLabel() {
    if (
      filterType === "today"
    ) {
      return "Today's Purchases";
    }

    if (
      filterType === "all"
    ) {
      return "All Purchases";
    }

    return selectedDate
      ? `Purchases on ${formatFilterDate(
          selectedDate
        )}`
      : "Custom Date";
  }

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />

      <main className="ml-0 min-h-screen lg:ml-[260px]">
        <div className="p-4 sm:p-6 lg:p-8">

          {/* ====================================================
              HEADER
          ==================================================== */}

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
                    Purchases
                  </h1>

                  <p className="mt-1 text-sm text-slate-500">
                    Manage purchase invoices and supplier transactions.
                  </p>
                </div>

              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/purchases/new"
                )
              }
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-800"
            >
              <Plus size={18} />
              New Purchase
            </button>
          </div>

          {/* ====================================================
              DATE FILTER
          ==================================================== */}

          <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

              {/* Filter Buttons */}

              <div className="flex flex-wrap items-center gap-2">

                <button
                  type="button"
                  onClick={() =>
                    setFilterType(
                      "today"
                    )
                  }
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                    filterType ===
                    "today"
                      ? "bg-teal-700 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Today
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setFilterType(
                      "all"
                    )
                  }
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                    filterType ===
                    "all"
                      ? "bg-teal-700 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  All Purchases
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setFilterType(
                      "custom"
                    )
                  }
                  className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
                    filterType ===
                    "custom"
                      ? "bg-teal-700 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <CalendarDays
                    size={16}
                  />
                  Custom Date
                </button>

              </div>

              {/* Custom Date */}

              {filterType ===
                "custom" && (
                <div className="flex items-center gap-2">

                  <label
                    htmlFor="purchase-date"
                    className="text-sm font-medium text-slate-600"
                  >
                    Date:
                  </label>

                  <input
                    id="purchase-date"
                    type="date"
                    value={
                      selectedDate
                    }
                    onChange={(
                      event
                    ) =>
                      setSelectedDate(
                        event.target
                          .value
                      )
                    }
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                  />

                </div>
              )}

            </div>

            {/* Active Filter */}

            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">

              <p className="text-sm text-slate-500">
                Showing{" "}
                <span className="font-semibold text-slate-800">
                  {getFilterLabel()}
                </span>
              </p>

              <p className="text-sm text-slate-400">
                {purchases.length}{" "}
                {purchases.length ===
                1
                  ? "purchase"
                  : "purchases"}
              </p>

            </div>
          </div>

          {/* ====================================================
              SUMMARY CARDS
          ==================================================== */}

          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

            {/* Total Purchases */}

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">

                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Total Purchases
                  </p>

                  <p className="mt-2 text-2xl font-bold text-slate-900">
                    ₹
                    {formatAmount(
                      totalPurchases.toString()
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

            {/* Total Paid */}

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">

                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Total Paid
                  </p>

                  <p className="mt-2 text-2xl font-bold text-slate-900">
                    ₹
                    {formatAmount(
                      totalPaid.toString()
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

            {/* Outstanding */}

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">

                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Outstanding
                  </p>

                  <p className="mt-2 text-2xl font-bold text-slate-900">
                    ₹
                    {formatAmount(
                      totalBalance.toString()
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

            {/* Completed Purchases */}

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">

                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Completed Purchases
                  </p>

                  <p className="mt-2 text-2xl font-bold text-slate-900">
                    {completedPurchases}
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

          {/* ====================================================
              ERROR
          ==================================================== */}

          {error && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* ====================================================
              LOADING
          ==================================================== */}

          {loading ? (
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">

              <div className="flex min-h-[300px] items-center justify-center">

                <div className="flex items-center gap-2 text-sm text-slate-500">

                  <Loader2
                    size={18}
                    className="animate-spin"
                  />

                  Loading purchases...

                </div>

              </div>

            </div>
          ) : (

            /* ==================================================
               PURCHASE TABLE
            ================================================== */

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

              {/* Table Header */}

              <div className="border-b border-slate-200 px-6 py-5">

                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">

                  <div>
                    <h2 className="font-semibold text-slate-900">
                      Purchase Invoices
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      View and manage your purchase transactions.
                    </p>
                  </div>

                  <div className="text-sm text-slate-400">
                    {getFilterLabel()}
                  </div>

                </div>

              </div>

              {/* No Purchases */}

              {purchases.length ===
              0 ? (
                <div className="flex min-h-[250px] flex-col items-center justify-center px-6 text-center">

                  <div className="mb-4 rounded-full bg-slate-100 p-4 text-slate-400">
                    <ShoppingCart
                      size={26}
                    />
                  </div>

                  <h3 className="text-sm font-semibold text-slate-900">
                    No purchases found
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    {filterType ===
                    "today"
                      ? "There are no purchases recorded today."
                      : filterType ===
                        "custom"
                      ? `No purchases found for ${formatFilterDate(
                          selectedDate
                        )}.`
                      : "Create your first purchase invoice to get started."}
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        "/purchases/new"
                      )
                    }
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800"
                  >
                    <Plus
                      size={16}
                    />
                    New Purchase
                  </button>

                </div>
              ) : (

                /* ==================================================
                   TABLE
                ================================================== */

                <div className="overflow-x-auto">

                  <table className="w-full min-w-[1000px] text-left">

                    <thead>

                      <tr className="border-b border-slate-200 bg-slate-50">

                        <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Purchase No.
                        </th>

                        <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Supplier
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

                      {purchases.map(
                        (
                          purchase
                        ) => (
                          <tr
                            key={
                              purchase.id
                            }
                            className="hover:bg-slate-50"
                          >

                            {/* Purchase Number */}

                            <td className="px-6 py-4">

                              <div className="font-medium text-slate-900">
                                {
                                  purchase.purchase_number
                                }
                              </div>

                              <div className="mt-0.5 text-xs text-slate-400">
                                #
                                {
                                  purchase.id
                                }
                              </div>

                            </td>

                            {/* Supplier */}

                            <td className="px-6 py-4">

                              <span className="text-sm text-slate-700">
                                {getSupplierName(
                                  purchase.supplier_id
                                )}
                              </span>

                            </td>

                            {/* Date */}

                            <td className="px-6 py-4">

                              <span className="text-sm text-slate-700">
                                {formatInvoiceDate(
                                  purchase.purchase_date
                                )}
                              </span>

                            </td>

                            {/* Total */}

                            <td className="px-6 py-4 text-right">

                              <span className="text-sm font-semibold text-slate-900">
                                ₹
                                {formatAmount(
                                  purchase.total_amount
                                )}
                              </span>

                            </td>

                            {/* Paid */}

                            <td className="px-6 py-4 text-right">

                              <span className="text-sm text-slate-700">
                                ₹
                                {formatAmount(
                                  purchase.paid_amount
                                )}
                              </span>

                            </td>

                            {/* Balance */}

                            <td className="px-6 py-4 text-right">

                              <span
                                className={`text-sm font-semibold ${
                                  Number(
                                    purchase.balance_amount
                                  ) > 0
                                    ? "text-amber-700"
                                    : "text-slate-700"
                                }`}
                              >
                                ₹
                                {formatAmount(
                                  purchase.balance_amount
                                )}
                              </span>

                            </td>

                            {/* Status */}

                            <td className="px-6 py-4 text-center">

                              <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                                  purchase.status ===
                                  "completed"
                                    ? "bg-green-50 text-green-700"
                                    : purchase.status ===
                                      "cancelled"
                                    ? "bg-red-50 text-red-700"
                                    : "bg-slate-100 text-slate-600"
                                }`}
                              >
                                {
                                  purchase.status
                                }
                              </span>

                            </td>

                            {/* Actions */}

                            <td className="px-6 py-4">

                              <div className="flex items-center justify-end gap-2">

                                <button
                                  type="button"
                                  title="View Purchase"
                                  onClick={() =>
                                    router.push(
                                      `/purchases/${purchase.id}`
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
                                  title="Edit Purchase"
                                  onClick={() =>
                                    router.push(
                                      `/purchases/${purchase.id}/edit`
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