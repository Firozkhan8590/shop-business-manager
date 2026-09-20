"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import {
  ArrowLeft,
  Edit3,
  FileText,
  Keyboard,
  Package,
  Printer,
  Receipt,
  Search,
  ShoppingCart,
  UserRound,
  X,
} from "lucide-react";

import { getProducts, Product } from "@/src/lib/products";
import { getCustomer, Customer } from "@/src/lib/customer";
import {
  getSale,
  SaleDetails,
  SaleItem,
} from "@/src/lib/sales";

/* ============================================================
   PRODUCT TYPE
============================================================ */

interface ProductInfo {
  id: number;
  name: string;
  code?: string;
  hsn?: string;
  unit?: string;
  category?: string;
  purchasePrice?: number;
  sellingPrice?: number;
  stock?: number;
}

/* ============================================================
   NORMALIZE PRODUCT
============================================================ */

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

    hsn:
      p.hsn != null
        ? String(p.hsn)
        : p.hsn_code != null
        ? String(p.hsn_code)
        : undefined,

    unit:
      p.unit != null
        ? String(p.unit)
        : p.unit_name != null
        ? String(p.unit_name)
        : undefined,

    category:
      p.category != null
        ? String(p.category)
        : p.category_name != null
        ? String(p.category_name)
        : undefined,

    purchasePrice:
      p.purchase_price != null
        ? Number(p.purchase_price)
        : p.purchasePrice != null
        ? Number(p.purchasePrice)
        : p.cost_price != null
        ? Number(p.cost_price)
        : undefined,

    sellingPrice:
      p.selling_price != null
        ? Number(p.selling_price)
        : p.sellingPrice != null
        ? Number(p.sellingPrice)
        : p.sale_price != null
        ? Number(p.sale_price)
        : undefined,

    stock:
      p.stock != null
        ? Number(p.stock)
        : p.current_stock != null
        ? Number(p.current_stock)
        : p.stock_quantity != null
        ? Number(p.stock_quantity)
        : undefined,
  };
}

/* ============================================================
   PAGE
============================================================ */

export default function SaleViewPage() {
  const params = useParams();
  const router = useRouter();

  const saleId = Number(params.id);

  /* ============================================================
     STATE
  ============================================================ */

  const [sale, setSale] =
    useState<SaleDetails | null>(null);

  const [customer, setCustomer] =
    useState<Customer | null>(null);

  const [products, setProducts] =
    useState<ProductInfo[]>([]);

  const [selectedItem, setSelectedItem] =
    useState<SaleItem | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  /* ============================================================
     LOAD DATA
  ============================================================ */

  useEffect(() => {
    if (!saleId || Number.isNaN(saleId)) {
      setError("Invalid sale ID");
      setLoading(false);
      return;
    }

    async function loadSale() {
      try {
        setLoading(true);
        setError("");

        const saleData =
          await getSale(saleId);

        setSale(saleData);

        const [customerData, productData] =
          await Promise.all([
            saleData.customer_id
              ? getCustomer(
                  Number(
                    saleData.customer_id
                  )
                )
              : Promise.resolve(null),

            getProducts(),
          ]);

        setCustomer(customerData);

        setProducts(
          productData.map(
            normalizeProduct
          )
        );

        if (
          saleData.items &&
          saleData.items.length > 0
        ) {
          setSelectedItem(
            saleData.items[0]
          );
        }
      } catch (err: unknown) {
        console.error(
          "Failed to load sale:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load sale"
        );
      } finally {
        setLoading(false);
      }
    }

    loadSale();
  }, [saleId]);

  /* ============================================================
     HELPERS
  ============================================================ */

  const formatMoney = (value: number) => {
    return Number(value || 0).toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );
  };

  const formatDate = (value: string) => {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }
    );
  };

  const getProduct = (
    productId: number | null
  ) => {
    return products.find(
      (product) =>
        product.id === Number(productId)
    );
  };

  /* ============================================================
     SELECTED PRODUCT
  ============================================================ */

  const selectedProduct = selectedItem
    ? getProduct(selectedItem.product_id)
    : undefined;

  /* ============================================================
     TOTAL QUANTITY
  ============================================================ */

  const totalQuantity = useMemo(() => {
    if (!sale) return 0;

    return sale.items.reduce(
      (sum, item) =>
        sum + Number(item.quantity || 0),
      0
    );
  }, [sale]);

  /* ============================================================
     KEYBOARD SHORTCUTS

     IMPORTANT:
     F8 opens the dedicated print page.
     It does NOT call window.print() here.
  ============================================================ */

  useEffect(() => {
    const handler = (
      event: KeyboardEvent
    ) => {
      /* ------------------------------------------------------
         ESC → BACK
      ------------------------------------------------------ */

      if (event.key === "Escape") {
        event.preventDefault();

        router.push("/sales");

        return;
      }

      /* ------------------------------------------------------
         F8 → OPEN PRINT PAGE
      ------------------------------------------------------ */

      if (event.key === "F8") {
        event.preventDefault();

        if (sale) {
          router.push(
            `/sales/${sale.id}/print`
          );
        }
      }
    };

    window.addEventListener(
      "keydown",
      handler
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handler
      );
    };
  }, [router, sale]);

  /* ============================================================
     LOADING
  ============================================================ */

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4f7f8] flex items-center justify-center">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm px-8 py-7 text-center">

          <div className="w-10 h-10 border-4 border-slate-200 border-t-[#079b89] rounded-full animate-spin mx-auto mb-4" />

          <p className="font-semibold text-slate-700">
            Loading sale...
          </p>

          <p className="text-xs text-slate-400 mt-1">
            Please wait
          </p>

        </div>
      </div>
    );
  }

  /* ============================================================
     ERROR
  ============================================================ */

  if (error || !sale) {
    return (
      <div className="min-h-screen bg-[#f4f7f8] flex items-center justify-center">

        <div className="bg-white border border-red-200 rounded-xl shadow-sm px-8 py-7 text-center max-w-md">

          <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4">
            <X size={24} />
          </div>

          <h2 className="font-bold text-lg">
            Sale Not Found
          </h2>

          <p className="text-sm text-slate-500 mt-2">
            {error ||
              "Unable to load this sale."}
          </p>

          <button
            type="button"
            onClick={() =>
              router.push("/sales")
            }
            className="mt-5 bg-[#079b89] text-white px-5 py-2.5 rounded-lg font-semibold"
          >
            Back to Sales
          </button>

        </div>
      </div>
    );
  }

  /* ============================================================
     CUSTOMER NAME
  ============================================================ */

  const customerName =
    customer?.name ||
    (sale.customer_id
      ? "Unknown Customer"
      : "Walk-in Customer");

  /* ============================================================
     MAIN UI
  ============================================================ */

  return (
    <div className="min-h-screen bg-[#f4f7f8] text-[#102a43] pb-[65px]">

      {/* ======================================================
          SIDEBAR
      ======================================================= */}

      <aside className="fixed left-0 top-0 bottom-0 w-[250px] bg-[#034f4a] text-white z-40 print:hidden">

        <div className="h-[78px] px-6 flex items-center gap-3 border-b border-white/10">

          <div className="w-11 h-11 rounded-xl bg-[#0aa88f] flex items-center justify-center">
            <span className="text-xl font-bold">
              ↗
            </span>
          </div>

          <div>

            <div className="font-bold text-[16px]">
              MAJ & SONS
            </div>

            <div className="text-[10px] tracking-[2px] text-emerald-200">
              BUSINESS MANAGER
            </div>

          </div>

        </div>

        <div className="px-6 pt-5 pb-2 text-[10px] tracking-[2px] text-emerald-300 font-semibold">
          MAIN
        </div>

        <SidebarItem
          label="Dashboard"
          icon="▦"
          onClick={() =>
            router.push("/dashboard")
          }
        />

        <SidebarItem
          label="Sales & Billing"
          icon="▣"
          active
          onClick={() =>
            router.push("/sales")
          }
        />

        <SidebarItem
          label="Estimates"
          icon="▤"
        />

        <div className="px-6 pt-5 pb-2 text-[10px] tracking-[2px] text-emerald-300 font-semibold">
          INVENTORY
        </div>

        <SidebarItem
          label="Products"
          icon="◇"
          onClick={() =>
            router.push("/products")
          }
        />

        <SidebarItem
          label="Inventory"
          icon="◇"
        />

        <SidebarItem
          label="Purchases"
          icon="🛒"
          onClick={() =>
            router.push("/purchases")
          }
        />

        <div className="px-6 pt-5 pb-2 text-[10px] tracking-[2px] text-emerald-300 font-semibold">
          PARTIES
        </div>

        <SidebarItem
          label="Customers"
          icon="♙"
          onClick={() =>
            router.push("/customers")
          }
        />

        <SidebarItem
          label="Suppliers"
          icon="▱"
          onClick={() =>
            router.push("/suppliers")
          }
        />

        <div className="px-6 pt-5 pb-2 text-[10px] tracking-[2px] text-emerald-300 font-semibold">
          ACCOUNTS
        </div>

        <SidebarItem
          label="Payments"
          icon="▣"
        />

        <SidebarItem
          label="Receipts"
          icon="▤"
        />

        <SidebarItem
          label="Expenses"
          icon="▤"
        />

        <SidebarItem
          label="Ledger"
          icon="▥"
        />

        <div className="px-6 pt-5 pb-2 text-[10px] tracking-[2px] text-emerald-300 font-semibold">
          REPORTS
        </div>

        <SidebarItem
          label="Reports"
          icon="▥"
        />

        <div className="px-6 pt-5 pb-2 text-[10px] tracking-[2px] text-emerald-300 font-semibold">
          SETTINGS
        </div>

        <SidebarItem
          label="Settings"
          icon="⚙"
        />

      </aside>

      {/* ======================================================
          MAIN
      ======================================================= */}

      <div className="ml-[250px]">

        {/* ====================================================
            TOP BAR
        ===================================================== */}

        <header className="h-[72px] bg-white border-b border-slate-200 flex items-center px-7 gap-5 print:hidden">

          <button
            type="button"
            onClick={() =>
              router.push("/sales")
            }
            className="text-slate-500 hover:text-slate-800"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="relative w-[520px]">

            <Search
              size={18}
              className="absolute left-3 top-3 text-slate-400"
            />

            <input
              placeholder="Search anything... (Ctrl + S)"
              className="w-full h-[40px] border border-slate-200 rounded-lg pl-10 pr-3 outline-none"
            />

          </div>

          <div className="ml-auto flex items-center gap-7 text-sm">

            <span>
              🏪 Demo Store
            </span>

            <div className="w-9 h-9 rounded-full bg-[#075e58] text-white flex items-center justify-center font-bold">
              A
            </div>

            <span>
              Admin
            </span>

          </div>

        </header>

        {/* ====================================================
            CONTENT
        ===================================================== */}

        <main className="p-7">

          {/* ==================================================
              PAGE HEADER
          =================================================== */}

          <div className="flex items-center justify-between mb-6">

            <div>

              <div className="text-sm text-slate-500 mb-2">
                Sales
                <span className="mx-2">
                  ›
                </span>
                View Sale
              </div>

              <div className="flex items-center gap-3">

                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#079b89] flex items-center justify-center">
                  <Receipt size={25} />
                </div>

                <div>

                  <h1 className="text-[27px] font-bold text-[#0d2238]">
                    Sales Invoice
                  </h1>

                  <p className="text-sm text-slate-500">
                    View sales transaction details.
                  </p>

                </div>

              </div>

            </div>

            <div className="flex gap-3 print:hidden">

              <button
                type="button"
                onClick={() =>
                  router.push("/sales")
                }
                className="h-10 px-4 border border-slate-300 bg-white rounded-lg font-semibold hover:bg-slate-50"
              >
                <ArrowLeft
                  size={16}
                  className="inline mr-2"
                />
                Back
              </button>

              <button
                type="button"
                onClick={() =>
                  router.push(
                    `/sales/${sale.id}/edit`
                  )
                }
                className="h-10 px-4 bg-[#079b89] text-white rounded-lg font-semibold hover:bg-[#078877]"
              >
                <Edit3
                  size={15}
                  className="inline mr-2"
                />
                Edit Sale
              </button>

              {/* =================================================
                  PRINT → DEDICATED PRINT PAGE
              ================================================== */}

              <button
                type="button"
                onClick={() =>
                  router.push(
                    `/sales/${sale.id}/print`
                  )
                }
                className="h-10 px-4 border border-slate-300 bg-white rounded-lg font-semibold hover:bg-slate-50"
              >
                <Printer
                  size={15}
                  className="inline mr-2"
                />
                Print
              </button>

            </div>

          </div>

          {/* ==================================================
              VOUCHER
          =================================================== */}

          <div className="grid grid-cols-[1fr_320px] gap-5">

            {/* ==================================================
                LEFT
            =================================================== */}

            <div className="space-y-5">

              {/* =================================================
                  VOUCHER DETAILS
              ================================================== */}

              <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">

                <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">

                  <div className="flex items-center gap-3">

                    <FileText
                      size={20}
                      className="text-[#079b89]"
                    />

                    <h2 className="font-bold text-[17px]">
                      Voucher Details
                    </h2>

                  </div>

                  <StatusBadge
                    status={sale.status}
                  />

                </div>

                <div className="p-5">

                  <div className="grid grid-cols-4 gap-5">

                    <InfoField
                      label="Invoice No."
                      value={
                        sale.invoice_number
                      }
                    />

                    <InfoField
                      label="Sale Date"
                      value={formatDate(
                        sale.sale_date
                      )}
                    />

                    <InfoField
                      label="Customer"
                      value={customerName}
                    />

                    <InfoField
                      label="Payment Method"
                      value={
                        sale.payment_method
                      }
                    />

                  </div>

                  <div className="grid grid-cols-2 gap-5 mt-5">

                    <InfoField
                      label="Created At"
                      value={formatDate(
                        sale.created_at
                      )}
                    />

                    <InfoField
                      label="Total Items"
                      value={String(
                        sale.items.length
                      )}
                    />

                  </div>

                </div>

              </section>

              {/* =================================================
                  SALES ITEMS
              ================================================== */}

              <section className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-visible">

                <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">

                  <div className="flex items-center gap-3">

                    <ShoppingCart
                      size={20}
                      className="text-[#079b89]"
                    />

                    <div>

                      <h2 className="font-bold text-[17px]">
                        Sales Items
                      </h2>

                      <p className="text-xs text-slate-500 mt-0.5">
                        {sale.items.length} items · Total quantity{" "}
                        {totalQuantity}
                      </p>

                    </div>

                  </div>

                </div>

                <div className="overflow-x-auto">

                  <table className="w-full border-collapse">

                    <thead>

                      <tr className="bg-[#f0f5f6] border-b border-slate-200 text-xs text-slate-600">

                        <th className="w-[55px] px-3 py-3 text-center">
                          #
                        </th>

                        <th className="px-3 py-3 text-left">
                          Product
                        </th>

                        <th className="px-3 py-3 text-left">
                          Code
                        </th>

                        <th className="px-3 py-3 text-center">
                          Unit
                        </th>

                        <th className="px-3 py-3 text-right">
                          Quantity
                        </th>

                        <th className="px-3 py-3 text-right">
                          Rate (₹)
                        </th>

                        <th className="px-5 py-3 text-right">
                          Amount (₹)
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {sale.items.map(
                        (item, index) => {
                          const product =
                            getProduct(
                              item.product_id
                            );

                          const amount =
                            Number(
                              item.total_amount
                            );

                          const active =
                            selectedItem?.id ===
                            item.id;

                          return (
                            <tr
                              key={item.id}
                              onClick={() =>
                                setSelectedItem(
                                  item
                                )
                              }
                              className={`border-b border-slate-100 cursor-pointer transition ${
                                active
                                  ? "bg-[#ecfaf7]"
                                  : "hover:bg-slate-50"
                              }`}
                            >

                              <td className="px-3 py-4 text-center text-sm text-slate-500">
                                {index + 1}
                              </td>

                              <td className="px-3 py-4">

                                <div className="font-semibold text-sm">
                                  {product?.name ||
                                    `Product #${item.product_id}`}
                                </div>

                                {product?.category && (
                                  <div className="text-[11px] text-slate-400 mt-1">
                                    {product.category}
                                  </div>
                                )}

                              </td>

                              <td className="px-3 py-4 text-sm text-slate-500">
                                {product?.code || "-"}
                              </td>

                              <td className="px-3 py-4 text-center text-sm">
                                {product?.unit || "-"}
                              </td>

                              <td className="px-3 py-4 text-right text-sm font-medium">
                                {Number(
                                  item.quantity
                                ).toFixed(3)}
                              </td>

                              <td className="px-3 py-4 text-right text-sm">
                                {formatMoney(
                                  Number(
                                    item.unit_price
                                  )
                                )}
                              </td>

                              <td className="px-5 py-4 text-right text-sm font-bold">
                                {formatMoney(
                                  amount
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

              {/* =================================================
                  NARRATION
              ================================================== */}

              {sale.notes && (
                <section className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">

                  <h2 className="font-bold text-[16px] mb-3">
                    Narration
                  </h2>

                  <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-600">
                    {sale.notes}
                  </div>

                </section>
              )}

            </div>

            {/* ==================================================
                RIGHT
            =================================================== */}

            <div className="space-y-5">

              {/* =================================================
                  CUSTOMER
              ================================================== */}

              <section className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">

                <div className="flex items-center gap-3 mb-4">

                  <div className="w-9 h-9 rounded-lg bg-emerald-50 text-[#079b89] flex items-center justify-center">
                    <UserRound size={18} />
                  </div>

                  <div>

                    <h2 className="font-bold">
                      Customer
                    </h2>

                    <p className="text-xs text-slate-500">
                      Party details
                    </p>

                  </div>

                </div>

                <div className="text-[16px] font-bold">
                  {customerName}
                </div>

                {customer?.phone && (
                  <div className="text-sm text-slate-500 mt-2">
                    {customer.phone}
                  </div>
                )}

                {customer?.address && (
                  <div className="text-sm text-slate-500 mt-2">
                    {customer.address}
                  </div>
                )}

                {!sale.customer_id && (
                  <div className="mt-3 text-xs text-slate-400">
                    No customer account selected.
                  </div>
                )}

              </section>

              {/* =================================================
                  PRODUCT DETAILS
              ================================================== */}

              <section className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">

                <div className="flex items-center justify-between mb-5">

                  <div className="flex items-center gap-3">

                    <div className="w-9 h-9 rounded-lg bg-emerald-50 text-[#079b89] flex items-center justify-center">
                      <Package size={18} />
                    </div>

                    <h2 className="font-bold">
                      Product Details
                    </h2>

                  </div>

                  {selectedProduct && (
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full">
                      Selected
                    </span>
                  )}

                </div>

                {selectedProduct ? (
                  <div>

                    <div className="font-bold text-[16px] mb-4">
                      {selectedProduct.name}
                    </div>

                    <ProductInfoRow
                      label="Product Code"
                      value={
                        selectedProduct.code ||
                        "-"
                      }
                    />

                    <ProductInfoRow
                      label="HSN"
                      value={
                        selectedProduct.hsn ||
                        "-"
                      }
                    />

                    <ProductInfoRow
                      label="Category"
                      value={
                        selectedProduct.category ||
                        "-"
                      }
                    />

                    <ProductInfoRow
                      label="Unit"
                      value={
                        selectedProduct.unit ||
                        "-"
                      }
                    />

                    <ProductInfoRow
                      label="Purchase Price"
                      value={
                        selectedProduct.purchasePrice !=
                        null
                          ? `₹${formatMoney(
                              selectedProduct.purchasePrice
                            )}`
                          : "-"
                      }
                    />

                    <ProductInfoRow
                      label="Selling Price"
                      value={
                        selectedProduct.sellingPrice !=
                        null
                          ? `₹${formatMoney(
                              selectedProduct.sellingPrice
                            )}`
                          : "-"
                      }
                    />

                    <ProductInfoRow
                      label="Current Stock"
                      value={
                        selectedProduct.stock !=
                        null
                          ? `${selectedProduct.stock} ${
                              selectedProduct.unit ||
                              ""
                            }`
                          : "-"
                      }
                    />

                  </div>
                ) : (
                  <div className="text-center py-7 text-sm text-slate-400">

                    <Package
                      size={28}
                      className="mx-auto mb-2 opacity-40"
                    />

                    Click an item to view product details.

                  </div>
                )}

              </section>

              {/* =================================================
                  VOUCHER SUMMARY
              ================================================== */}

              <section className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">

                <div className="flex items-center gap-3 mb-4">

                  <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Receipt size={18} />
                  </div>

                  <h2 className="font-bold">
                    Voucher Summary
                  </h2>

                </div>

                <SummaryRow
                  label="Sub Total"
                  value={`₹${formatMoney(
                    Number(
                      sale.subtotal
                    )
                  )}`}
                />

                <SummaryRow
                  label={`Discount (${Number(
                    sale.discount_percent
                  )}%)`}
                  value={`₹${formatMoney(
                    Number(
                      sale.subtotal
                    ) -
                      Number(
                        sale.total_amount
                      )
                  )}`}
                />

                <div className="border-t border-slate-200 my-2" />

                <div className="flex justify-between py-3 text-[17px] font-bold">

                  <span>
                    Total Amount
                  </span>

                  <span>
                    ₹
                    {formatMoney(
                      Number(
                        sale.total_amount
                      )
                    )}
                  </span>

                </div>

                <SummaryRow
                  label="Paid Amount"
                  value={`₹${formatMoney(
                    Number(
                      sale.paid_amount
                    )
                  )}`}
                />

                <div className="mt-2 bg-orange-50 rounded-lg px-3 py-3 flex justify-between">

                  <span className="font-bold">
                    Balance
                  </span>

                  <span className="font-bold text-orange-600 text-[17px]">
                    ₹
                    {formatMoney(
                      Number(
                        sale.balance_amount
                      )
                    )}
                  </span>

                </div>

              </section>

            </div>

          </div>

        </main>

      </div>

      {/* ========================================================
          BOTTOM BAR
      ========================================================= */}

      <footer className="fixed bottom-0 left-[250px] right-0 h-[58px] bg-white border-t border-slate-200 flex items-center px-7 z-40 print:hidden">

        <div className="flex items-center gap-4 text-xs text-slate-500">

          <Keyboard size={17} />

          <Shortcut
            keyName="F8"
            label="Print"
          />

          <Shortcut
            keyName="Esc"
            label="Back"
          />

        </div>

        <div className="ml-auto flex gap-3">

          <button
            type="button"
            onClick={() =>
              router.push("/sales")
            }
            className="h-10 px-5 rounded-lg border border-slate-300 bg-white font-semibold"
          >
            <ArrowLeft
              size={15}
              className="inline mr-2"
            />
            Back
          </button>

          <button
            type="button"
            onClick={() =>
              router.push(
                `/sales/${sale.id}/edit`
              )
            }
            className="h-10 px-5 rounded-lg bg-[#079b89] text-white font-bold"
          >
            <Edit3
              size={15}
              className="inline mr-2"
            />
            Edit Sale
          </button>

        </div>

      </footer>

    </div>
  );
}

/* ============================================================
   SIDEBAR ITEM
============================================================ */

function SidebarItem({
  label,
  icon,
  active = false,
  onClick,
}: {
  label: string;
  icon: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-[calc(100%-24px)] ml-3 h-11 px-4 rounded-lg flex items-center gap-4 text-sm transition ${
        active
          ? "bg-[#08a58f] text-white font-semibold"
          : "text-emerald-50/90 hover:bg-white/10"
      }`}
    >
      <span className="w-5 text-center">
        {icon}
      </span>

      {label}
    </button>
  );
}

/* ============================================================
   INFO FIELD
============================================================ */

function InfoField({
  label,
  value,
}: {
  label: string;
  value:
    | string
    | number
    | null
    | undefined;
}) {
  return (
    <div>

      <div className="text-xs text-slate-500 mb-1.5">
        {label}
      </div>

      <div className="font-semibold text-sm">
        {value ?? "-"}
      </div>

    </div>
  );
}

/* ============================================================
   PRODUCT INFO ROW
============================================================ */

function ProductInfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex justify-between py-2 border-b border-slate-100 text-sm">

      <span className="text-slate-500">
        {label}
      </span>

      <span className="font-medium text-right">
        {value}
      </span>

    </div>
  );
}

/* ============================================================
   SUMMARY ROW
============================================================ */

function SummaryRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex justify-between py-3 border-b border-slate-100 text-sm">

      <span className="text-slate-500">
        {label}
      </span>

      <span className="font-semibold">
        {value}
      </span>

    </div>
  );
}

/* ============================================================
   STATUS BADGE
============================================================ */

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const normalized =
    status.toLowerCase();

  let className =
    "bg-emerald-50 text-emerald-700";

  if (normalized === "pending") {
    className =
      "bg-red-50 text-red-600";
  }

  if (normalized === "partial") {
    className =
      "bg-amber-50 text-amber-700";
  }

  return (
    <span
      className={`px-3 py-1.5 rounded-full text-xs font-semibold ${className}`}
    >
      {status}
    </span>
  );
}

/* ============================================================
   SHORTCUT
============================================================ */

function Shortcut({
  keyName,
  label,
}: {
  keyName: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2">

      <span className="border border-slate-300 bg-slate-50 rounded px-2 py-1 font-semibold text-[11px]">
        {keyName}
      </span>

      <span>
        {label}
      </span>

    </div>
  );
}