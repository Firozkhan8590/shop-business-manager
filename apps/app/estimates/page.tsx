"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Eye,
  Pencil,
  Trash2,
  Loader2,
  FileText,
  Send,
  CheckCircle,
  CalendarDays,
  AlertTriangle,
} from "lucide-react";

import Sidebar from "../components/Sidebar";

import {
  Estimate,
  EstimateStatus,
  getEstimates,
  deleteEstimate,
} from "@/src/lib/estimate";

export default function EstimatesPage() {
  const router = useRouter();

  const [estimates, setEstimates] = useState<Estimate[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [deletingId, setDeletingId] =
    useState<number | null>(null);

  const [deleteEstimateTarget, setDeleteEstimateTarget] =
    useState<Estimate | null>(null);

  /* ============================================================
     DATE FILTER
  ============================================================ */

  // IMPORTANT:
  // Default is ALL so existing estimates are visible
  // regardless of whether they were created today or yesterday.
  const [filterType, setFilterType] =
    useState<"today" | "all" | "custom">("all");

  const [selectedDate, setSelectedDate] =
    useState("");

  /* ============================================================
     STATUS FILTER
  ============================================================ */

  const [statusFilter, setStatusFilter] =
    useState<EstimateStatus | "">("");

  /* ============================================================
     GET LOCAL TODAY DATE
  ============================================================ */

  function getTodayDate() {
    const today = new Date();

    const year = today.getFullYear();

    const month = String(
      today.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      today.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  /* ============================================================
     INITIAL DATE
  ============================================================ */

  useEffect(() => {
    setSelectedDate(getTodayDate());
  }, []);

  /* ============================================================
     LOAD ESTIMATES
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

        const response = await getEstimates(
          1,
          100,
          undefined,
          statusFilter || undefined
        );

        let data = response.data || [];

        /* ======================================================
           DATE FILTER
        ====================================================== */

        if (filterType !== "all") {
          const targetDate =
            filterType === "today"
              ? getTodayDate()
              : selectedDate;

          data = data.filter((estimate) => {
            const estimateDate =
              estimate.estimate_date?.split("T")[0];

            return estimateDate === targetDate;
          });
        }

        setEstimates(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load estimates"
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [
    filterType,
    selectedDate,
    statusFilter,
  ]);

  /* ============================================================
     MIDNIGHT REFRESH
  ============================================================ */

  useEffect(() => {
    if (filterType !== "today") {
      return;
    }

    const interval = setInterval(() => {
      const today = getTodayDate();

      setSelectedDate((currentDate) =>
        currentDate === today
          ? currentDate
          : today
      );
    }, 60 * 1000);

    return () => clearInterval(interval);
  }, [filterType]);

  /* ============================================================
     DELETE ESTIMATE
  ============================================================ */

  async function handleDeleteEstimate() {
    if (!deleteEstimateTarget) {
      return;
    }

    try {
      setDeletingId(deleteEstimateTarget.id);
      setError("");

      await deleteEstimate(
        deleteEstimateTarget.id
      );

      setEstimates((current) =>
        current.filter(
          (estimate) =>
            estimate.id !== deleteEstimateTarget.id
        )
      );

      setDeleteEstimateTarget(null);
    } catch (err) {
      console.error(
        "Failed to delete estimate:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete estimate"
      );
    } finally {
      setDeletingId(null);
    }
  }

  /* ============================================================
     FORMAT AMOUNT
  ============================================================ */

  function formatAmount(amount: string) {
    return Number(amount || 0).toLocaleString(
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

  function formatEstimateDate(
    value: string | null
  ) {
    if (!value) {
      return "-";
    }

    const datePart = value.split("T")[0];

    const [year, month, day] =
      datePart.split("-");

    if (!year || !month || !day) {
      return value;
    }

    return `${day}-${month}-${year}`;
  }

  /* ============================================================
     FORMAT FILTER DATE
  ============================================================ */

  function formatFilterDate(value: string) {
    if (!value) {
      return "";
    }

    const [year, month, day] =
      value.split("-");

    if (!year || !month || !day) {
      return value;
    }

    return `${day}-${month}-${year}`;
  }

  /* ============================================================
     CUSTOMER NAME
  ============================================================ */

  function getCustomerName(
    estimate: Estimate
  ) {
    return (
      estimate.customer_name ||
      "Walk-in Customer"
    );
  }

  /* ============================================================
     SUMMARY
  ============================================================ */

  const totalEstimates =
    estimates.reduce(
      (sum, estimate) =>
        sum +
        Number(
          estimate.total_amount || 0
        ),
      0
    );

  const acceptedEstimates =
    estimates.filter(
      (estimate) =>
        estimate.status === "accepted"
    ).length;

  const sentEstimates =
    estimates.filter(
      (estimate) =>
        estimate.status === "sent"
    ).length;

  const draftEstimates =
    estimates.filter(
      (estimate) =>
        estimate.status === "draft"
    ).length;

  /* ============================================================
     FILTER LABEL
  ============================================================ */

  function getFilterLabel() {
    if (filterType === "today") {
      return "Today's Estimates";
    }

    if (filterType === "all") {
      return "All Estimates";
    }

    return selectedDate
      ? `Estimates on ${formatFilterDate(
          selectedDate
        )}`
      : "Custom Date";
  }

  /* ============================================================
     STATUS STYLE
  ============================================================ */

  function getStatusClass(
    status: EstimateStatus
  ) {
    switch (status) {
      case "accepted":
        return "bg-green-50 text-green-700";

      case "sent":
        return "bg-blue-50 text-blue-700";

      case "rejected":
        return "bg-red-50 text-red-700";

      case "expired":
        return "bg-orange-50 text-orange-700";

      case "converted":
        return "bg-purple-50 text-purple-700";

      case "draft":
      default:
        return "bg-slate-100 text-slate-600";
    }
  }

  /* ============================================================
     RENDER
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
                  <FileText size={22} />
                </div>

                <div>
                  <h1 className="text-2xl font-bold text-slate-900">
                    Estimates
                  </h1>

                  <p className="mt-1 text-sm text-slate-500">
                    Manage customer quotations and estimates.
                  </p>
                </div>

              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/estimates/new"
                )
              }
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-800"
            >
              <Plus size={18} />
              New Estimate
            </button>

          </div>

          {/* ==================================================
              FILTER
          ================================================== */}

          <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">

            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

              {/* DATE FILTERS */}

              <div className="flex flex-wrap items-center gap-2">

                <button
                  type="button"
                  onClick={() =>
                    setFilterType("today")
                  }
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                    filterType === "today"
                      ? "bg-teal-700 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Today
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setFilterType("all")
                  }
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                    filterType === "all"
                      ? "bg-teal-700 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  All Estimates
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setFilterType("custom")
                  }
                  className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
                    filterType === "custom"
                      ? "bg-teal-700 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <CalendarDays size={16} />
                  Custom Date
                </button>

              </div>

              {/* CUSTOM DATE */}

              {filterType === "custom" && (
                <div className="flex items-center gap-2">

                  <label
                    htmlFor="estimate-date"
                    className="text-sm font-medium text-slate-600"
                  >
                    Date:
                  </label>

                  <input
                    id="estimate-date"
                    type="date"
                    value={selectedDate}
                    onChange={(event) =>
                      setSelectedDate(
                        event.target.value
                      )
                    }
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                  />

                </div>
              )}

            </div>

            {/* STATUS FILTER */}

            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">

              <span className="text-sm font-medium text-slate-500">
                Status:
              </span>

              <button
                type="button"
                onClick={() =>
                  setStatusFilter("")
                }
                className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                  statusFilter === ""
                    ? "bg-slate-800 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                All
              </button>

              {(
                [
                  "draft",
                  "sent",
                  "accepted",
                  "rejected",
                  "expired",
                  "converted",
                ] as EstimateStatus[]
              ).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() =>
                    setStatusFilter(
                      status
                    )
                  }
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize ${
                    statusFilter === status
                      ? "bg-teal-700 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {status}
                </button>
              ))}

            </div>

            {/* ACTIVE FILTER */}

            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">

              <p className="text-sm text-slate-500">
                Showing{" "}
                <span className="font-semibold text-slate-800">
                  {getFilterLabel()}
                </span>
              </p>

              <p className="text-sm text-slate-400">
                {estimates.length}{" "}
                {estimates.length === 1
                  ? "estimate"
                  : "estimates"}
              </p>

            </div>

          </div>

          {/* ==================================================
              SUMMARY CARDS
          ================================================== */}

          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

            {/* TOTAL */}

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="flex items-start justify-between">

                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Total Estimates
                  </p>

                  <p className="mt-2 text-2xl font-bold text-slate-900">
                    ₹
                    {formatAmount(
                      totalEstimates.toString()
                    )}
                  </p>
                </div>

                <div className="rounded-lg bg-teal-50 p-2.5 text-teal-700">
                  <FileText size={20} />
                </div>

              </div>

            </div>

            {/* DRAFT */}

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="flex items-start justify-between">

                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Draft Estimates
                  </p>

                  <p className="mt-2 text-2xl font-bold text-slate-900">
                    {draftEstimates}
                  </p>
                </div>

                <div className="rounded-lg bg-slate-100 p-2.5 text-slate-600">
                  <FileText size={20} />
                </div>

              </div>

            </div>

            {/* SENT */}

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="flex items-start justify-between">

                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Sent Estimates
                  </p>

                  <p className="mt-2 text-2xl font-bold text-slate-900">
                    {sentEstimates}
                  </p>
                </div>

                <div className="rounded-lg bg-blue-50 p-2.5 text-blue-700">
                  <Send size={20} />
                </div>

              </div>

            </div>

            {/* ACCEPTED */}

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

              <div className="flex items-start justify-between">

                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Accepted Estimates
                  </p>

                  <p className="mt-2 text-2xl font-bold text-slate-900">
                    {acceptedEstimates}
                  </p>
                </div>

                <div className="rounded-lg bg-green-50 p-2.5 text-green-700">
                  <CheckCircle size={20} />
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
              LOADING / TABLE
          ================================================== */}

          {loading ? (
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">

              <div className="flex min-h-[300px] items-center justify-center">

                <div className="flex items-center gap-2 text-sm text-slate-500">

                  <Loader2
                    size={18}
                    className="animate-spin"
                  />

                  Loading estimates...

                </div>

              </div>

            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

              {/* TABLE HEADER */}

              <div className="border-b border-slate-200 px-6 py-5">

                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">

                  <div>
                    <h2 className="font-semibold text-slate-900">
                      Estimate List
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      View and manage customer estimates.
                    </p>
                  </div>

                  <div className="text-sm text-slate-400">
                    {getFilterLabel()}
                  </div>

                </div>

              </div>

              {/* NO ESTIMATES */}

              {estimates.length === 0 ? (
                <div className="flex min-h-[250px] flex-col items-center justify-center px-6 text-center">

                  <div className="mb-4 rounded-full bg-slate-100 p-4 text-slate-400">
                    <FileText size={26} />
                  </div>

                  <h3 className="text-sm font-semibold text-slate-900">
                    No estimates found
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    {filterType === "today"
                      ? "There are no estimates recorded today."
                      : filterType === "custom"
                      ? `No estimates found for ${formatFilterDate(
                          selectedDate
                        )}.`
                      : "Create your first estimate to get started."}
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        "/estimates/new"
                      )
                    }
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800"
                  >
                    <Plus size={16} />
                    New Estimate
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
                          Estimate No.
                        </th>

                        <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Customer
                        </th>

                        <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Date
                        </th>

                        <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Valid Until
                        </th>

                        <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Subtotal
                        </th>

                        <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Total
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

                      {estimates.map(
                        (estimate) => (
                          <tr
                            key={estimate.id}
                            className="hover:bg-slate-50"
                          >

                            {/* ESTIMATE NUMBER */}

                            <td className="px-6 py-4">

                              <div className="font-medium text-slate-900">
                                {
                                  estimate.estimate_number
                                }
                              </div>

                              <div className="mt-0.5 text-xs text-slate-400">
                                #{estimate.id}
                              </div>

                            </td>

                            {/* CUSTOMER */}

                            <td className="px-6 py-4">

                              <span className="text-sm text-slate-700">
                                {getCustomerName(
                                  estimate
                                )}
                              </span>

                              {estimate.customer_phone && (
                                <div className="mt-0.5 text-xs text-slate-400">
                                  {
                                    estimate.customer_phone
                                  }
                                </div>
                              )}

                            </td>

                            {/* DATE */}

                            <td className="px-6 py-4">

                              <span className="text-sm text-slate-700">
                                {formatEstimateDate(
                                  estimate.estimate_date
                                )}
                              </span>

                            </td>

                            {/* VALID UNTIL */}

                            <td className="px-6 py-4">

                              <span className="text-sm text-slate-700">
                                {formatEstimateDate(
                                  estimate.valid_until
                                )}
                              </span>

                            </td>

                            {/* SUBTOTAL */}

                            <td className="px-6 py-4 text-right">

                              <span className="text-sm text-slate-700">
                                ₹
                                {formatAmount(
                                  estimate.subtotal
                                )}
                              </span>

                            </td>

                            {/* TOTAL */}

                            <td className="px-6 py-4 text-right">

                              <span className="text-sm font-semibold text-slate-900">
                                ₹
                                {formatAmount(
                                  estimate.total_amount
                                )}
                              </span>

                            </td>

                            {/* STATUS */}

                            <td className="px-6 py-4 text-center">

                              <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${getStatusClass(
                                  estimate.status
                                )}`}
                              >
                                {
                                  estimate.status
                                }
                              </span>

                            </td>

                            {/* ACTIONS */}

                            <td className="px-6 py-4">

                              <div className="flex items-center justify-end gap-2">

                                {/* VIEW */}

                                <button
                                  type="button"
                                  title="View Estimate"
                                  onClick={() =>
                                    router.push(
                                      `/estimates/${estimate.id}`
                                    )
                                  }
                                  className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                                >
                                  <Eye size={17} />
                                </button>

                                {/* EDIT */}

                                <button
                                  type="button"
                                  title="Edit Estimate"
                                  onClick={() =>
                                    router.push(
                                      `/estimates/${estimate.id}/edit`
                                    )
                                  }
                                  className="rounded-lg p-2 text-slate-500 hover:bg-teal-50 hover:text-teal-700"
                                >
                                  <Pencil size={17} />
                                </button>

                                {/* DELETE */}

                                <button
                                  type="button"
                                  title="Delete Estimate"
                                  disabled={
                                    deletingId ===
                                    estimate.id
                                  }
                                  onClick={() =>
                                      setDeleteEstimateTarget(
                                      estimate
                                    )
                                  }
                                  className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  <Trash2 size={17} />
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


      {/* ============================================================
          DELETE ESTIMATE MODAL
      ============================================================ */}

      {deleteEstimateTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              if (!deletingId) {
                setDeleteEstimateTarget(null);
              }
            }
          }}
        >
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">

            {/* Modal Header */}

            <div className="p-6">

              <div className="flex items-start gap-4">

                {/* Warning Icon */}

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-500">
                  <AlertTriangle size={24} />
                </div>

                <div className="flex-1">

                  <h2 className="text-lg font-bold text-slate-800">
                    Delete Estimate?
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Are you sure you want to remove this estimate?
                  </p>

                </div>

              </div>

              {/* Estimate */}

              <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">

                <div className="flex items-center gap-3">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#063f3d]/10 text-[#063f3d]">
                    <FileText size={20} />
                  </div>

                  <div className="min-w-0">

                    <p className="truncate text-sm font-semibold text-slate-800">
                      {deleteEstimateTarget.estimate_number}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {deleteEstimateTarget.customer_name
                        ? deleteEstimateTarget.customer_name
                        : "Walk-in Customer"}
                    </p>

                  </div>

                </div>

              </div>

              {/* Warning */}

              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">

                <div className="flex gap-3">

                  <AlertTriangle
                    size={18}
                    className="mt-0.5 shrink-0 text-amber-600"
                  />

                  <div>

                    <p className="text-sm font-semibold text-amber-800">
                      This estimate will be permanently removed.
                    </p>

                    <p className="mt-1 text-xs leading-5 text-amber-700">
                      The estimate and its item details will be
                      deleted. This action cannot be undone.
                    </p>

                  </div>

                </div>

              </div>

            </div>

            {/* Modal Footer */}

            <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">

              <button
                type="button"
                disabled={deletingId !== null}
                onClick={() =>
                  setDeleteEstimateTarget(null)
                }
                className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={
                  deletingId ===
                  deleteEstimateTarget?.id
                }
                onClick={handleDeleteEstimate}
                className="flex items-center gap-2 rounded-xl bg-red-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Trash2
                  size={17}
                  className={
                    deletingId ===
                    deleteEstimateTarget.id
                      ? "animate-pulse"
                      : ""
                  }
                />

                {deletingId ===
                    deleteEstimateTarget.id
                  ? "Deleting..."
                  : "Delete Estimate"}
              </button>

            </div>

          </div>
        </div>
      )}

      </main>
    </div>
  );
}