"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Printer } from "lucide-react";

import {
  getEstimate,
  EstimateDetails,
  EstimateItem,
} from "@/src/lib/estimate";

import { getProducts, Product } from "@/src/lib/products";
import { getCustomer, Customer } from "@/src/lib/customer";

interface ProductInfo {
  id: number;
  name: string;
  code?: string;
  unit?: string;
}

function normalizeProduct(product: Product): ProductInfo {
  const p = product as Product & Record<string, unknown>;

  return {
    id: Number(p.id),

    name: String(
      p.name ??
        p.product_name ??
        p.item_name ??
        ""
    ),

    code:
      p.code != null
        ? String(p.code)
        : p.product_code != null
        ? String(p.product_code)
        : undefined,

    unit:
      p.unit != null
        ? String(p.unit)
        : p.unit_name != null
        ? String(p.unit_name)
        : undefined,
  };
}

export default function EstimatePrintPage() {
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
     LOAD DATA
  ============================================================ */

  useEffect(() => {
    async function loadEstimate() {
      try {
        setLoading(true);
        setError("");

        if (!estimateId || Number.isNaN(estimateId)) {
          throw new Error("Invalid estimate ID");
        }

        const estimateData =
          await getEstimate(estimateId);

        setEstimate(estimateData);

        const productData =
          await getProducts();

        setProducts(
          productData.map(normalizeProduct)
        );

        if (estimateData.customer_id) {
          const customerData =
            await getCustomer(
              Number(estimateData.customer_id)
            );

          setCustomer(customerData);
        }
      } catch (err: unknown) {
        console.error(
          "Estimate print page error:",
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
     HELPERS
  ============================================================ */

  const money = (value: number) => {
    return Number(value || 0).toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );
  };

  const formatDate = (
    value: string | null
  ) => {
    if (!value) return "-";

    const parsed = new Date(value);

    if (Number.isNaN(parsed.getTime())) {
      return value;
    }

    return parsed.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }
    );
  };

  const productFor = (
    productId: number | null
  ) => {
    return products.find(
      (product) =>
        product.id === Number(productId)
    );
  };

  /* ============================================================
     LOADING
  ============================================================ */

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="rounded-xl bg-white border border-slate-200 px-8 py-7 text-center shadow-sm">

          <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-[#079b89]" />

          <p className="text-sm font-semibold text-slate-700">
            Preparing estimate...
          </p>

        </div>
      </div>
    );
  }

  /* ============================================================
     ERROR
  ============================================================ */

  if (error || !estimate) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">

        <div className="rounded-xl bg-white border border-red-200 px-8 py-7 text-center shadow-sm">

          <h1 className="text-lg font-bold text-red-600">
            Unable to load estimate
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            {error || "Estimate not found"}
          </p>

          <button
            type="button"
            onClick={() => router.back()}
            className="mt-5 rounded-lg bg-[#079b89] px-5 py-2.5 text-sm font-semibold text-white"
          >
            Go Back
          </button>

        </div>
      </div>
    );
  }

  /* ============================================================
     CALCULATIONS
  ============================================================ */

  const discountPercent =
    Number(estimate.discount_percent || 0);

  const subtotal =
    Number(estimate.subtotal || 0);

  const discountAmount =
    subtotal * (discountPercent / 100);

  const totalAmount =
    Number(estimate.total_amount || 0);

  const customerName =
    customer?.name || "Walk-in Customer";

  return (
    <>
      {/* ========================================================
          SCREEN TOOLBAR
      ======================================================== */}

      <div className="print:hidden sticky top-0 z-50 border-b border-slate-200 bg-white">

        <div className="mx-auto flex h-14 max-w-[900px] items-center justify-between px-5">

          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <ArrowLeft size={16} />
            Back
          </button>

          <div className="text-center">

            <p className="text-sm font-bold text-slate-800">
              Estimate
            </p>

            <p className="text-[10px] text-slate-400">
              {estimate.estimate_number}
            </p>

          </div>

          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-2 rounded-lg bg-[#079b89] px-4 py-2 text-sm font-semibold text-white hover:bg-[#067f72]"
          >
            <Printer size={16} />
            Print
          </button>

        </div>
      </div>

      {/* ========================================================
          PAGE
      ======================================================== */}

      <main className="min-h-screen bg-slate-100 p-5 print:min-h-0 print:bg-white print:p-0">

        <div className="estimate-page mx-auto w-full max-w-[820px] bg-white px-8 py-6 shadow-sm print:max-w-none print:px-0 print:py-0 print:shadow-none">

          {/* ====================================================
              HEADER
          ==================================================== */}

          <div className="flex items-start justify-between border-b border-slate-300 pb-3">

            <div>

              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#079b89]">
                Estimate Document
              </p>

              <h1 className="mt-1 text-[23px] font-bold leading-none text-slate-900">
                Estimate
              </h1>

              <p className="mt-1 text-[10px] text-slate-500">
                Price Quotation
              </p>

            </div>

            <div className="text-right">

              <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400">
                Estimate No.
              </p>

              <p className="mt-1 text-[14px] font-bold text-slate-900">
                {estimate.estimate_number}
              </p>

              <p className="mt-1 text-[10px] text-slate-500">
                {formatDate(
                  estimate.estimate_date
                )}
              </p>

              <p className="mt-0.5 text-[9px] text-slate-500">
                Valid Until:{" "}
                {formatDate(
                  estimate.valid_until
                )}
              </p>

            </div>

          </div>

          {/* ====================================================
              CUSTOMER
          ==================================================== */}

          <div className="grid grid-cols-[1fr_auto] gap-5 border-b border-slate-200 py-3">

            <div>

              <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400">
                Customer
              </p>

              <p className="mt-1 text-[10px] font-bold text-slate-900">
                {customerName}
              </p>

              {customer?.phone && (
                <p className="mt-0.5 text-[10px] text-slate-500">
                  {customer.phone}
                </p>
              )}

              {customer?.address && (
                <p className="mt-0.5 max-w-[450px] truncate text-[10px] text-slate-500">
                  {customer.address}
                </p>
              )}

            </div>

            <div className="text-right">

              <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-slate-400">
                Document
              </p>

              <p className="mt-1 text-[9px] font-bold text-[#067f72]">
                PRICE ESTIMATE
              </p>

            </div>

          </div>

          {/* ====================================================
              ITEMS
          ==================================================== */}

          <div className="mt-3 overflow-hidden rounded-md border border-slate-200">

            <table className="w-full table-fixed border-collapse">

              <thead>

                <tr className="bg-slate-50">

                  <th className="w-[5%] px-2 py-1.5 text-left text-[9px] font-bold uppercase tracking-wide text-slate-400">
                    #
                  </th>

                  <th className="w-[45%] px-2 py-1.5 text-left text-[9px] font-bold uppercase tracking-wide text-slate-400">
                    Item
                  </th>

                  <th className="w-[10%] px-1 py-1.5 text-center text-[9px] font-bold uppercase tracking-wide text-slate-400">
                    Unit
                  </th>

                  <th className="w-[10%] px-1 py-1.5 text-right text-[9px] font-bold uppercase tracking-wide text-slate-400">
                    Qty
                  </th>

                  <th className="w-[14%] px-1 py-1.5 text-right text-[9px] font-bold uppercase tracking-wide text-slate-400">
                    Rate
                  </th>

                  <th className="w-[16%] px-2 py-1.5 text-right text-[9px] font-bold uppercase tracking-wide text-slate-400">
                    Amount
                  </th>

                </tr>

              </thead>

              <tbody>

                {estimate.items.map(
                  (
                    item: EstimateItem,
                    index: number
                  ) => {

                    const product =
                      productFor(
                        item.product_id
                      );

                    return (
                      <tr
                        key={item.id}
                        className="border-t border-slate-100"
                      >

                        <td className="px-2 py-[3px] text-[9px] text-slate-400">
                          {String(
                            index + 1
                          ).padStart(2, "0")}
                        </td>

                        <td className="overflow-hidden px-2 py-[3px]">

                          <div className="truncate text-[9px] font-semibold leading-[11px] text-slate-800">
                            {product?.name ||
                              `Product #${item.product_id}`}
                          </div>

                          {product?.code && (
                            <div className="truncate text-[8px] leading-[10px] text-slate-400">
                              {product.code}
                            </div>
                          )}

                        </td>

                        <td className="px-1 py-[3px] text-center text-[9px] text-slate-500">
                          {product?.unit || "-"}
                        </td>

                        <td className="px-1 py-[3px] text-right text-[9px] font-medium text-slate-700">
                          {Number(
                            item.quantity || 0
                          ).toLocaleString(
                            "en-IN",
                            {
                              maximumFractionDigits: 3,
                            }
                          )}
                        </td>

                        <td className="px-1 py-[3px] text-right text-[9px] text-slate-600">
                          ₹
                          {money(
                            Number(
                              item.unit_price
                            )
                          )}
                        </td>

                        <td className="px-2 py-[3px] text-right text-[9px] font-semibold text-slate-900">
                          ₹
                          {money(
                            Number(
                              item.total_amount
                            )
                          )}
                        </td>

                      </tr>
                    );
                  }
                )}

              </tbody>

            </table>

          </div>

          {/* ====================================================
              SUMMARY
          ==================================================== */}

          <div className="mt-3 flex justify-end">

            <div className="w-[250px]">

              <div className="flex justify-between py-0.5 text-[10px]">

                <span className="text-slate-500">
                  Subtotal
                </span>

                <span className="font-medium text-slate-800">
                  ₹{money(subtotal)}
                </span>

              </div>

              <div className="flex justify-between py-0.5 text-[10px]">

                <span className="text-slate-500">

                  Discount

                  {discountPercent > 0 && (
                    <span className="ml-1">
                      ({discountPercent}%)
                    </span>
                  )}

                </span>

                <span className="font-medium text-slate-800">
                  - ₹{money(discountAmount)}
                </span>

              </div>

              <div className="mt-1 flex items-center justify-between border-t border-slate-300 pt-2">

                <span className="text-[10px] font-bold text-slate-900">
                  Total
                </span>

                <span className="text-[15px] font-bold text-[#079b89]">
                  ₹{money(totalAmount)}
                </span>

              </div>

            </div>

          </div>

          {/* ====================================================
              NOTES
          ==================================================== */}

          {estimate.notes && (
            <div className="mt-3 border-t border-slate-200 pt-2">

              <p className="text-[9px] font-bold uppercase text-slate-400">
                Notes
              </p>

              <p className="mt-0.5 whitespace-pre-wrap text-[9px] text-slate-500">
                {estimate.notes}
              </p>

            </div>
          )}

          {/* ====================================================
              FOOTER
          ==================================================== */}

          <div className="mt-3 border-t border-slate-200 pt-2 text-center">

            <p className="text-[10px] font-semibold text-slate-600">
              Thank you for your business
            </p>

            <p className="mt-0.5 text-[8px] text-slate-400">
              This estimate is a price quotation and not a sales invoice.
            </p>

          </div>

        </div>

      </main>

      {/* ========================================================
          PRINT CSS
      ======================================================== */}

      <style>{`
        @page {
          size: A4 portrait;
          margin: 5mm;
        }

        @media print {
          html,
          body {
            margin: 0 !important;
            padding: 0 !important;
            background: #fff !important;
          }

          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .estimate-page {
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
          }

          .estimate-page table {
            width: 100% !important;
            table-layout: fixed !important;
            border-collapse: collapse !important;
          }

          .estimate-page tbody td {
            padding-top: 2px !important;
            padding-bottom: 2px !important;
            line-height: 9px !important;
          }

          .estimate-page tr {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }

          .estimate-page thead {
            display: table-header-group;
          }
        }
      `}</style>
    </>
  );
}