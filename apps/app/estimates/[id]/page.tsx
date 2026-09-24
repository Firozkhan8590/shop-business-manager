"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Edit,
  FileText,
  Loader2,
  Printer,
} from "lucide-react";

import Sidebar from "../../components/Sidebar";

import {
  getEstimate,
  EstimateDetails,
} from "@/src/lib/estimate";

import {
  getProducts,
  Product,
} from "@/src/lib/products";

import {
  getCustomer,
  Customer,
} from "@/src/lib/customer";

/* ============================================================
   TYPES
============================================================ */

interface ProductInfo {
  id: number;
  name: string;
  unit?: string;
}

/* ============================================================
   HELPERS
============================================================ */

function normalizeProduct(
  product: Product
): ProductInfo {
  const p =
    product as Product &
      Record<string, unknown>;

  return {
    id: Number(p.id),

    name: String(
      p.name ??
        p.product_name ??
        p.item_name ??
        ""
    ),

    unit:
      p.unit != null
        ? String(p.unit)
        : p.unit_name != null
        ? String(p.unit_name)
        : undefined,
  };
}

function formatMoney(
  value: string | number | null | undefined
) {
  return Number(value || 0).toLocaleString(
    "en-IN",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  );
}

function formatDate(
  value: string | null | undefined
) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(
    "en-GB",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }
  );
}

function getStatusClass(
  status: string
) {
  switch (status) {
    case "draft":
      return "bg-slate-100 text-slate-700";

    case "sent":
      return "bg-blue-50 text-blue-700";

    case "accepted":
      return "bg-emerald-50 text-emerald-700";

    case "rejected":
      return "bg-red-50 text-red-700";

    case "expired":
      return "bg-orange-50 text-orange-700";

    case "converted":
      return "bg-purple-50 text-purple-700";

    default:
      return "bg-slate-100 text-slate-700";
  }
}

/* ============================================================
   PAGE
============================================================ */

export default function ViewEstimatePage() {
  const params = useParams();
  const router = useRouter();

  const estimateId = Number(params.id);

  const [estimate, setEstimate] =
    useState<EstimateDetails | null>(null);

  const [customer, setCustomer] =
    useState<Customer | null>(null);

  const [products, setProducts] =
    useState<ProductInfo[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /* ============================================================
     LOAD ESTIMATE
  ============================================================ */

  useEffect(() => {
    async function loadEstimate() {
      try {
        setLoading(true);
        setError("");

        if (
          !estimateId ||
          Number.isNaN(estimateId)
        ) {
          throw new Error(
            "Invalid estimate ID"
          );
        }

        const estimateData =
          await getEstimate(
            estimateId
          );

        setEstimate(
          estimateData
        );

        /* =========================
           LOAD PRODUCTS
        ========================= */

        const productData =
          await getProducts();

        setProducts(
          productData.map(
            normalizeProduct
          )
        );

        /* =========================
           LOAD CUSTOMER
        ========================= */

        if (
          estimateData.customer_id
        ) {
          const customerData =
            await getCustomer(
              Number(
                estimateData.customer_id
              )
            );

          setCustomer(
            customerData
          );
        }
      } catch (err) {
        console.error(
          "Estimate view error:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load estimate"
        );
      } finally {
        setLoading(false);
      }
    }

    loadEstimate();
  }, [estimateId]);

  /* ============================================================
     PRODUCT LOOKUP
  ============================================================ */

  const productMap = useMemo(() => {
    const map =
      new Map<
        number,
        ProductInfo
      >();

    products.forEach(
      (product) => {
        map.set(
          product.id,
          product
        );
      }
    );

    return map;
  }, [products]);

  /* ============================================================
     DISCOUNT
  ============================================================ */

  const discountAmount = useMemo(() => {
    if (!estimate) {
      return 0;
    }

    const subtotal =
      Number(
        estimate.subtotal || 0
      );

    const discountPercent =
      Number(
        estimate.discount_percent ||
          0
      );

    return (
      subtotal *
      discountPercent /
      100
    );
  }, [estimate]);

  /* ============================================================
     KEYBOARD
  ============================================================ */

  useEffect(() => {
    const handleKeyDown = (
      event: KeyboardEvent
    ) => {
      if (event.key === "F8") {
        event.preventDefault();

        window.print();
      }

      if (event.key === "Escape") {
        event.preventDefault();

        router.back();
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [router]);

  /* ============================================================
     LOADING
  ============================================================ */

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Sidebar />

        <main className="ml-0 min-h-screen lg:ml-[260px]">
          <div className="flex min-h-screen items-center justify-center">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Loader2
                size={20}
                className="animate-spin"
              />

              Loading estimate...
            </div>
          </div>
        </main>
      </div>
    );
  }

  /* ============================================================
     ERROR
  ============================================================ */

  if (error || !estimate) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Sidebar />

        <main className="ml-0 min-h-screen lg:ml-[260px]">
          <div className="p-4 sm:p-6 lg:p-8">

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/estimates"
                )
              }
              className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft size={18} />

              Back to Estimates
            </button>

            <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
              {error ||
                "Estimate not found"}
            </div>

          </div>
        </main>
      </div>
    );
  }

  /* ============================================================
     PAGE
  ============================================================ */

  return (
    <div className="min-h-screen bg-slate-50">

      <Sidebar />

      <main className="ml-0 min-h-screen lg:ml-[260px]">

        <div className="p-4 sm:p-6 lg:p-8">

          {/* ==================================================
              HEADER
          ================================================== */}

          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-center gap-3">

              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/estimates"
                  )
                }
                className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                title="Back"
              >
                <ArrowLeft
                  size={19}
                />
              </button>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-[#079b89]">
                <FileText
                  size={23}
                />
              </div>

              <div>

                <div className="flex items-center gap-3">

                  <h1 className="text-2xl font-bold text-slate-900">
                    {estimate.estimate_number}
                  </h1>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${getStatusClass(
                      estimate.status
                    )}`}
                  >
                    {estimate.status}
                  </span>

                </div>

                <p className="mt-1 text-sm text-slate-500">
                  View Estimate
                </p>

              </div>

            </div>

            {/* ACTIONS */}

            <div className="flex items-center gap-2">

              <button
                type="button"
                onClick={() =>
                  router.push(
                    `/estimates/${estimate.id}/edit`
                  )
                }
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                <Edit
                  size={17}
                />

                Edit
              </button>

              <button
  type="button"
  onClick={() =>
    router.push(`/estimates/${estimate.id}/print`)
  }
  className="inline-flex items-center gap-2 rounded-lg bg-[#079b89] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#067d70]"
>
  <Printer size={17} />
  Print
</button>

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
              ESTIMATE DETAILS
          ================================================== */}

          <section className="mb-6 rounded-xl border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-200 px-6 py-5">

              <div className="flex items-center justify-between">

                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Estimate Details
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Quotation information
                  </p>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${getStatusClass(
                    estimate.status
                  )}`}
                >
                  {estimate.status}
                </span>

              </div>

            </div>

            <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-4">

              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">
                  Estimate No.
                </p>

                <p className="font-semibold text-slate-900">
                  {estimate.estimate_number}
                </p>
              </div>

              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">
                  Estimate Date
                </p>

                <p className="font-medium text-slate-800">
                  {formatDate(
                    estimate.estimate_date
                  )}
                </p>
              </div>

              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">
                  Valid Until
                </p>

                <p className="font-medium text-slate-800">
                  {formatDate(
                    estimate.valid_until
                  )}
                </p>
              </div>

              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">
                  Customer
                </p>

                <p className="font-semibold text-slate-900">
                  {customer?.name ||
                    estimate.customer_name ||
                    "Walk-in Customer"}
                </p>

                {(customer?.phone ||
                  estimate.customer_phone) && (
                  <p className="mt-1 text-xs text-slate-500">
                    {customer?.phone ||
                      estimate.customer_phone}
                  </p>
                )}
              </div>

            </div>

          </section>

          {/* ==================================================
              CUSTOMER
          ================================================== */}

          {customer && (
            <section className="mb-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="mb-4 flex items-center justify-between">

                <div>
                  <h2 className="font-bold text-slate-900">
                    Customer
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Customer information
                  </p>
                </div>

              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-3">

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Name
                  </p>

                  <p className="mt-1 font-semibold text-slate-900">
                    {customer.name}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Phone
                  </p>

                  <p className="mt-1 text-slate-700">
                    {customer.phone ||
                      "-"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Address
                  </p>

                  <p className="mt-1 text-slate-700">
                    {customer.address ||
                      "-"}
                  </p>
                </div>

              </div>

            </section>
          )}

          {/* ==================================================
              ITEMS
          ================================================== */}

          <section className="mb-6 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

            <div className="border-b border-slate-200 px-6 py-5">

              <h2 className="font-bold text-slate-900">
                Estimate Items
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Products included in this quotation
              </p>

            </div>

            <div className="overflow-x-auto">

              <table className="w-full min-w-[700px]">

                <thead className="border-b border-slate-200 bg-slate-50">

                  <tr>

                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      #
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Product
                    </th>

                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Unit
                    </th>

                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Qty
                    </th>

                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Rate
                    </th>

                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Amount
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-slate-100">

                  {estimate.items.map(
                    (item, index) => {

                      const product =
                        productMap.get(
                          Number(
                            item.product_id
                          )
                        );

                      return (
                        <tr
                          key={item.id}
                          className="hover:bg-slate-50"
                        >

                          <td className="px-6 py-4 text-sm text-slate-500">
                            {index + 1}
                          </td>

                          <td className="px-6 py-4">

                            <p className="font-medium text-slate-900">
                              {product?.name ||
                                `Product #${item.product_id}`}
                            </p>

                          </td>

                          <td className="px-6 py-4 text-sm text-slate-600">
                            {product?.unit ||
                              "-"}
                          </td>

                          <td className="px-6 py-4 text-right text-sm text-slate-700">
                            {item.quantity}
                          </td>

                          <td className="px-6 py-4 text-right text-sm text-slate-700">
                            ₹
                            {formatMoney(
                              item.unit_price
                            )}
                          </td>

                          <td className="px-6 py-4 text-right text-sm font-semibold text-slate-900">
                            ₹
                            {formatMoney(
                              item.total_amount
                            )}
                          </td>

                        </tr>
                      );
                    }
                  )}

                </tbody>

              </table>

            </div>

          </section>

          {/* ==================================================
              BOTTOM SECTION
          ================================================== */}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

            {/* NOTES */}

            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

              <h2 className="font-bold text-slate-900">
                Notes
              </h2>

              <div className="mt-4 min-h-[140px] rounded-lg bg-slate-50 p-4">

                {estimate.notes ? (
                  <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
                    {estimate.notes}
                  </p>
                ) : (
                  <p className="text-sm text-slate-400">
                    No notes added.
                  </p>
                )}

              </div>

            </section>

            {/* VOUCHER SUMMARY */}

            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">

              <div className="mb-5 flex items-center justify-between">

                <div>
                  <h2 className="font-bold text-slate-900">
                    Estimate Voucher
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Final quotation amount
                  </p>
                </div>

                <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700">
                  {estimate.estimate_number}
                </span>

              </div>

              <div className="space-y-4">

                {/* SUBTOTAL */}

                <div className="flex items-center justify-between">

                  <span className="text-sm text-slate-500">
                    Subtotal
                  </span>

                  <span className="font-semibold text-slate-900">
                    ₹
                    {formatMoney(
                      estimate.subtotal
                    )}
                  </span>

                </div>

                {/* DISCOUNT */}

                <div className="flex items-center justify-between">

                  <div>

                    <span className="text-sm text-slate-500">
                      Discount
                    </span>

                    <span className="ml-2 text-xs text-slate-400">
                      (
                      {formatMoney(
                        estimate.discount_percent
                      )}
                      %)
                    </span>

                  </div>

                  <span className="font-semibold text-red-500">
                    - ₹
                    {formatMoney(
                      discountAmount
                    )}
                  </span>

                </div>

                <div className="border-t border-slate-200 pt-4">

                  <div className="flex items-center justify-between">

                    <span className="text-base font-bold text-slate-900">
                      Total Estimate
                    </span>

                    <span className="text-2xl font-bold text-[#079b89]">
                      ₹
                      {formatMoney(
                        estimate.total_amount
                      )}
                    </span>

                  </div>

                </div>

              </div>

            </section>

          </div>

          {/* ==================================================
              FOOTER
          ================================================== */}

          <div className="mt-6 flex items-center justify-between rounded-xl border border-slate-200 bg-white px-6 py-4 shadow-sm">

            <p className="text-xs text-slate-400">
              Estimate #{estimate.estimate_number}
            </p>

            <div className="flex items-center gap-2 text-xs text-slate-400">

              <span>
                F8
              </span>

              <span>
                Print
              </span>

              <span className="mx-1">
                •
              </span>

              <span>
                Esc
              </span>

              <span>
                Back
              </span>

            </div>

          </div>

        </div>

      </main>

      {/* ======================================================
          PRINT STYLES
      ====================================================== */}

      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }

          aside,
          nav {
            display: none !important;
          }

          main {
            margin-left: 0 !important;
          }

          button {
            display: none !important;
          }

          .shadow-sm {
            box-shadow: none !important;
          }

          .bg-slate-50 {
            background: white !important;
          }

          .min-h-screen {
            min-height: auto !important;
          }
        }
      `}</style>

    </div>
  );
}