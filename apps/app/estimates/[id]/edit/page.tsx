"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  FileText,
  Keyboard,
  Loader2,
  Plus,
  Save,
  Search,
  Trash2,
  X,
} from "lucide-react";

import Sidebar from "../../../components/Sidebar";

import {
  getProducts,
  Product,
} from "@/src/lib/products";

import {
  getCustomers,
  Customer,
} from "@/src/lib/customer";

import {
  getEstimate,
  updateEstimate,
  UpdateEstimateInput,
} from "@/src/lib/estimate";

/* ============================================================
   TYPES
============================================================ */

interface EstimateRow {
  product_id: number | "";
  product_name: string;
  unit: string;
  quantity: string;
  unit_price: string;
}

/* ============================================================
   HELPERS
============================================================ */

const emptyRow = (): EstimateRow => ({
  product_id: "",
  product_name: "",
  unit: "",
  quantity: "1",
  unit_price: "",
});

const money = (value: number) =>
  value.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

function formatDateForInput(
  dateValue: string | null | undefined
) {
  if (!dateValue) return "";

  const value = String(dateValue).trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  if (value.includes("T")) {
    return value.split("T")[0];
  }

  const parts = value.split("-");

  if (
    parts.length === 3 &&
    parts[0].length === 2 &&
    parts[1].length === 2 &&
    parts[2].length === 4
  ) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }

  return "";
}

function getTodayDate() {
  return new Date().toISOString().split("T")[0];
}

function getDefaultValidUntil() {
  const date = new Date();

  date.setDate(date.getDate() + 15);

  return date.toISOString().split("T")[0];
}

/* ============================================================
   PAGE
============================================================ */

export default function EditEstimatePage() {
  const router = useRouter();
  const params = useParams();
  const estimateId = Number(params.id);

  /* ============================================================
     BASIC DETAILS
  ============================================================ */

  const [estimateNumber, setEstimateNumber] =
    useState("");

  const [estimateDate, setEstimateDate] =
    useState(getTodayDate());

  const [validUntil, setValidUntil] =
    useState(getDefaultValidUntil());

  /* ============================================================
     CUSTOMERS
  ============================================================ */

  const [customers, setCustomers] =
    useState<Customer[]>([]);

  const [customerSearch, setCustomerSearch] =
    useState("");

  const [selectedCustomer, setSelectedCustomer] =
    useState<Customer | null>(null);

  const [showCustomerSearch, setShowCustomerSearch] =
    useState(false);

  const [highlightedCustomer, setHighlightedCustomer] =
    useState(0);

  /* ============================================================
     PRODUCTS
  ============================================================ */

  const [products, setProducts] =
    useState<Product[]>([]);

  const [activeProductRow, setActiveProductRow] =
    useState<number | null>(null);

  const [productSearch, setProductSearch] =
    useState("");

  const [showProductSearch, setShowProductSearch] =
    useState(false);

  const [highlightedProduct, setHighlightedProduct] =
    useState(0);

  /* ============================================================
     ITEMS
  ============================================================ */

  const [rows, setRows] = useState<EstimateRow[]>([
    emptyRow(),
  ]);

  /* ============================================================
     AMOUNTS
  ============================================================ */

  const [discountPercent, setDiscountPercent] =
    useState("0");

  const [notes, setNotes] =
    useState("");

  /* ============================================================
     STATUS
  ============================================================ */

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [loadingData, setLoadingData] =
    useState(true);

  /* ============================================================
     REFS
  ============================================================ */

  const productInputRefs =
    useRef<(HTMLInputElement | null)[]>([]);

  const quantityInputRefs =
    useRef<(HTMLInputElement | null)[]>([]);

  const rateInputRefs =
    useRef<(HTMLInputElement | null)[]>([]);

  const customerInputRef =
    useRef<HTMLInputElement>(null);

  /* ============================================================
     LOAD DATA
  ============================================================ */

  useEffect(() => {
    async function loadData() {
      try {
        setLoadingData(true);
        setError("");

        if (!estimateId || Number.isNaN(estimateId)) {
          throw new Error("Invalid estimate ID");
        }

        const [estimateData, customerData, productData] =
          await Promise.all([
            getEstimate(estimateId),
            getCustomers(),
            getProducts(),
          ]);

        setCustomers(
          customerData.filter(
            (customer) => customer.is_active
          )
        );

        setProducts(productData);

        setEstimateNumber(
          estimateData.estimate_number || ""
        );

        setEstimateDate(
          formatDateForInput(
            estimateData.estimate_date
          )
        );

        setValidUntil(
          formatDateForInput(
            estimateData.valid_until
          )
        );

        setDiscountPercent(
          String(
            estimateData.discount_percent ?? 0
          )
        );

        setNotes(
          estimateData.notes || ""
        );

        const selected =
          estimateData.customer_id
            ? customerData.find(
                (customer) =>
                  Number(customer.id) ===
                  Number(estimateData.customer_id)
              ) || null
            : null;

        setSelectedCustomer(selected);

        setCustomerSearch(
          selected?.name || ""
        );

        const patchedRows: EstimateRow[] =
          (estimateData.items || []).map(
            (item) => {
              const product =
                productData.find(
                  (p) =>
                    Number(p.id) ===
                    Number(item.product_id)
                );

              const p =
                product as
                  | (Product &
                      Record<string, unknown>)
                  | undefined;

              return {
                product_id:
                  Number(item.product_id),

                product_name: String(
                  p?.name ??
                    p?.product_name ??
                    ""
                ),

                unit: String(
                  p?.unit ?? ""
                ),

                quantity: String(
                  item.quantity ?? ""
                ),

                unit_price: String(
                  item.unit_price ?? ""
                ),
              };
            }
          );

        setRows(
          patchedRows.length
            ? patchedRows
            : [emptyRow()]
        );
      } catch (err) {
        console.error(
          "Edit estimate load error:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Failed to load estimate data"
        );
      } finally {
        setLoadingData(false);
      }
    }

    loadData();
  }, [estimateId]);

  /* ============================================================
     CALCULATIONS
  ============================================================ */

  const subtotal = useMemo(() => {
    return rows.reduce(
      (sum, row) => {
        const quantity =
          Number(row.quantity) || 0;

        const rate =
          Number(row.unit_price) || 0;

        return (
          sum +
          quantity * rate
        );
      },
      0
    );
  }, [rows]);

  const discountAmount = useMemo(() => {
    const discount =
      Number(discountPercent) || 0;

    return (
      subtotal *
      (discount / 100)
    );
  }, [
    subtotal,
    discountPercent,
  ]);

  const totalAmount = Math.max(
    0,
    subtotal - discountAmount
  );

  /* ============================================================
     FILTER CUSTOMERS
  ============================================================ */

  const filteredCustomers =
    useMemo(() => {
      if (!customerSearch.trim()) {
        return customers.slice(0, 8);
      }

      const search =
        customerSearch
          .toLowerCase()
          .trim();

      return customers
        .filter((customer) => {
          return (
            customer.name
              .toLowerCase()
              .includes(search) ||
            customer.phone
              ?.toLowerCase()
              .includes(search)
          );
        })
        .slice(0, 8);
    }, [
      customers,
      customerSearch,
    ]);

  /* ============================================================
     SELECT CUSTOMER
  ============================================================ */

  const selectCustomer = (
    customer: Customer
  ) => {
    setSelectedCustomer(customer);

    setCustomerSearch(
      customer.name
    );

    setShowCustomerSearch(false);

    setHighlightedCustomer(0);

    setShowProductSearch(false);
  };

  /* ============================================================
     CLEAR CUSTOMER
  ============================================================ */

  const clearCustomer = () => {
    setSelectedCustomer(null);

    setCustomerSearch("");

    setShowCustomerSearch(true);

    setShowProductSearch(false);

    setHighlightedCustomer(0);

    setTimeout(() => {
      customerInputRef.current?.focus();
    }, 50);
  };

  /* ============================================================
     CUSTOMER KEYBOARD
  ============================================================ */

  const handleCustomerKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (!showCustomerSearch) {
      if (
        event.key === "ArrowDown" ||
        event.key === "Enter"
      ) {
        event.preventDefault();

        setShowProductSearch(false);

        setShowCustomerSearch(true);

        setHighlightedCustomer(0);
      }

      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();

      setHighlightedCustomer(
        (current) =>
          Math.min(
            current + 1,
            Math.max(
              filteredCustomers.length - 1,
              0
            )
          )
      );

      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();

      setHighlightedCustomer(
        (current) =>
          Math.max(
            current - 1,
            0
          )
      );

      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();

      const customer =
        filteredCustomers[
          highlightedCustomer
        ];

      if (customer) {
        selectCustomer(customer);
      }

      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();

      setShowCustomerSearch(false);
    }
  };

  /* ============================================================
     FILTER PRODUCTS
  ============================================================ */

  const filteredProducts =
    useMemo(() => {
      if (!productSearch.trim()) {
        return products.slice(0, 8);
      }

      const search =
        productSearch
          .toLowerCase()
          .trim();

      return products
        .filter((product) => {
          const p =
            product as Product &
              Record<string, unknown>;

          const name = String(
            p.name ??
              p.product_name ??
              ""
          );

          const sku = String(
            p.sku ??
              p.code ??
              p.product_code ??
              ""
          );

          const barcode = String(
            p.barcode ?? ""
          );

          return (
            name
              .toLowerCase()
              .includes(search) ||
            sku
              .toLowerCase()
              .includes(search) ||
            barcode
              .toLowerCase()
              .includes(search)
          );
        })
        .slice(0, 8);
    }, [
      products,
      productSearch,
    ]);

  /* ============================================================
     SELECT PRODUCT
  ============================================================ */

  const selectProduct = (
    rowIndex: number,
    product: Product
  ) => {
    const p =
      product as Product &
        Record<string, unknown>;

    const name = String(
      p.name ??
        p.product_name ??
        ""
    );

    const unit = String(
      p.unit ?? ""
    );

    const sellingPrice =
      p.selling_price != null
        ? Number(p.selling_price)
        : p.sellingPrice != null
        ? Number(p.sellingPrice)
        : 0;

    setRows((current) =>
      current.map(
        (row, index) =>
          index === rowIndex
            ? {
                ...row,
                product_id:
                  Number(product.id),
                product_name: name,
                unit,
                unit_price:
                  row.unit_price.trim() !== ""
                    ? row.unit_price
                    : String(
                        sellingPrice
                      ),
              }
            : row
      )
    );

    setShowProductSearch(false);

    setActiveProductRow(null);

    setProductSearch("");

    setHighlightedProduct(0);

    setTimeout(() => {
      quantityInputRefs.current[
        rowIndex
      ]?.focus();

      quantityInputRefs.current[
        rowIndex
      ]?.select();
    }, 50);
  };

  /* ============================================================
     PRODUCT INPUT
  ============================================================ */

  const handleProductInput = (
    rowIndex: number,
    value: string
  ) => {
    setRows((current) =>
      current.map(
        (row, index) =>
          index === rowIndex
            ? {
                ...row,
                product_id: "",
                product_name: value,
                unit: "",
              }
            : row
      )
    );

    setActiveProductRow(rowIndex);

    setProductSearch(value);

    setShowCustomerSearch(false);

    setShowProductSearch(true);

    setHighlightedProduct(0);
  };

  /* ============================================================
     PRODUCT KEYBOARD
  ============================================================ */

  const handleProductKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
    rowIndex: number
  ) => {
    if (!showProductSearch) {
      if (event.key === "Enter") {
        event.preventDefault();

        setActiveProductRow(rowIndex);

        setProductSearch(
          rows[rowIndex]
            ?.product_name || ""
        );

        setShowCustomerSearch(false);

        setShowProductSearch(true);

        setHighlightedProduct(0);
      }

      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();

      setHighlightedProduct(
        (current) =>
          Math.min(
            current + 1,
            Math.max(
              filteredProducts.length - 1,
              0
            )
          )
      );

      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();

      setHighlightedProduct(
        (current) =>
          Math.max(
            current - 1,
            0
          )
      );

      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();

      const product =
        filteredProducts[
          highlightedProduct
        ];

      if (product) {
        selectProduct(
          rowIndex,
          product
        );
      }

      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();

      setShowProductSearch(false);

      setActiveProductRow(null);

      setProductSearch("");
    }
  };

  /* ============================================================
     QUANTITY KEYBOARD
  ============================================================ */

  const handleQuantityKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
    rowIndex: number
  ) => {
    if (event.key === "Enter") {
      event.preventDefault();

      rateInputRefs.current[
        rowIndex
      ]?.focus();

      rateInputRefs.current[
        rowIndex
      ]?.select();
    }
  };

  /* ============================================================
     RATE KEYBOARD
  ============================================================ */

  const handleRateKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
    rowIndex: number
  ) => {
    if (event.key === "Enter") {
      event.preventDefault();

      if (
        rowIndex ===
        rows.length - 1
      ) {
        addLine();

        setTimeout(() => {
          productInputRefs.current[
            rowIndex + 1
          ]?.focus();
        }, 50);
      } else {
        productInputRefs.current[
          rowIndex + 1
        ]?.focus();
      }
    }
  };

  /* ============================================================
     ADD LINE
  ============================================================ */

  const addLine = () => {
    setRows((current) => [
      ...current,
      emptyRow(),
    ]);

    setTimeout(() => {
      productInputRefs.current[
        rows.length
      ]?.focus();
    }, 50);
  };

  /* ============================================================
     DELETE LINE
  ============================================================ */

  const deleteLine = (
    rowIndex: number
  ) => {
    setRows((current) => {
      if (current.length === 1) {
        return [emptyRow()];
      }

      return current.filter(
        (_, index) =>
          index !== rowIndex
      );
    });

    if (
      activeProductRow ===
      rowIndex
    ) {
      setActiveProductRow(null);

      setShowProductSearch(false);

      setProductSearch("");
    }
  };

  /* ============================================================
     VALIDATION
  ============================================================ */

  const validateForm = () => {
    setError("");

    if (!estimateNumber.trim()) {
      setError(
        "Estimate number is required"
      );

      return false;
    }

    if (!estimateDate) {
      setError(
        "Estimate date is required"
      );

      return false;
    }

    if (
      validUntil &&
      validUntil < estimateDate
    ) {
      setError(
        "Valid until date cannot be before estimate date"
      );

      return false;
    }

    const validRows =
      rows.filter(
        (row) =>
          row.product_id !== "" &&
          Number(row.quantity) > 0
      );

    if (
      validRows.length === 0
    ) {
      setError(
        "At least one valid product is required"
      );

      return false;
    }

    for (const row of validRows) {
      if (
        Number(row.quantity) <= 0
      ) {
        setError(
          "Quantity must be greater than 0"
        );

        return false;
      }

      if (
        Number(row.unit_price) < 0
      ) {
        setError(
          "Rate cannot be negative"
        );

        return false;
      }
    }

    const discount =
      Number(discountPercent) || 0;

    if (
      discount < 0 ||
      discount > 100
    ) {
      setError(
        "Discount must be between 0 and 100"
      );

      return false;
    }

    return true;
  };

  /* ============================================================
     BUILD PAYLOAD
  ============================================================ */

  const buildPayload =
    (): UpdateEstimateInput => {
      const validRows =
        rows.filter(
          (row) =>
            row.product_id !== "" &&
            Number(row.quantity) > 0
        );

      return {
        estimate_number:
          estimateNumber.trim(),

        customer_id:
          selectedCustomer?.id ??
          null,

        estimate_date:
          estimateDate,

        valid_until:
          validUntil || null,

        discount_percent:
          Number(discountPercent) || 0,

        notes:
          notes.trim() || null,

        items: validRows.map(
          (row) => ({
            product_id:
              Number(row.product_id),

            quantity:
              Number(row.quantity),

            unit_price:
              Number(row.unit_price) || 0,
          })
        ),
      };
    };

  /* ============================================================
     UPDATE ESTIMATE
  ============================================================ */

  const handleSave = async () => {
    setError("");

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      await updateEstimate(
        estimateId,
        buildPayload()
      );

      router.push(
        `/estimates/${estimateId}`
      );
    } catch (err) {
      console.error(
        "Update estimate error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to update estimate"
      );
    } finally {
      setLoading(false);
    }
  };

  /* ============================================================
     GLOBAL KEYBOARD SHORTCUTS
  ============================================================ */

  useEffect(() => {
    const handler = (
      event: KeyboardEvent
    ) => {
      /* F4 - Customer */

      if (event.key === "F4") {
        event.preventDefault();

        setShowProductSearch(false);

        customerInputRef.current?.focus();

        setShowCustomerSearch(true);

        return;
      }

      /* F7 - Product */

      if (event.key === "F7") {
        event.preventDefault();

        setShowCustomerSearch(false);

        productInputRefs.current[
          0
        ]?.focus();

        return;
      }

      /* F9 - Save */

      if (event.key === "F9") {
        event.preventDefault();

        handleSave();

        return;
      }

      /* Ctrl + S */

      if (
        event.ctrlKey &&
        event.key.toLowerCase() ===
          "s"
      ) {
        event.preventDefault();

        handleSave();

        return;
      }

      /* Ctrl + A */

      if (
        event.ctrlKey &&
        event.key.toLowerCase() ===
          "a"
      ) {
        event.preventDefault();

        addLine();

        return;
      }

      /* Ctrl + D */

      if (
        event.ctrlKey &&
        event.key.toLowerCase() ===
          "d"
      ) {
        event.preventDefault();

        if (
          activeProductRow !== null
        ) {
          deleteLine(
            activeProductRow
          );
        }

        return;
      }

      /* Escape */

      if (
        event.key === "Escape"
      ) {
        if (
          showProductSearch
        ) {
          setShowProductSearch(false);

          return;
        }

        if (
          showCustomerSearch
        ) {
          setShowCustomerSearch(false);

          return;
        }

        router.push(
          "/estimates"
        );
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
  }, [
    activeProductRow,
    showProductSearch,
    showCustomerSearch,
    rows,
    estimateNumber,
    estimateDate,
    validUntil,
    discountPercent,
    selectedCustomer,
    notes,
  ]);

  /* ============================================================
     LOADING
  ============================================================ */

  if (loadingData) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Sidebar />

        <main className="ml-0 min-h-screen lg:ml-[260px]">
          <div className="flex min-h-screen items-center justify-center">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
              <Loader2
                size={20}
                className="animate-spin text-teal-700"
              />

              Loading estimate...
            </div>
          </div>
        </main>
      </div>
    );
  }

  /* ============================================================
     UI
  ============================================================ */

  return (
    <div className="min-h-screen bg-slate-50 pb-40">

      <Sidebar />

      <main className="ml-0 min-h-screen lg:ml-[260px]">

        <div className="p-4 sm:p-6 lg:p-8">

          {/* ==================================================
              HEADER
          ================================================== */}

          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">

                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      "/estimates"
                    )
                  }
                  className="hover:text-teal-700"
                >
                  Estimates
                </button>

                <span>›</span>

                <span>
                  Edit Estimate
                </span>

              </div>

              <div className="flex items-center gap-3">

                <div className="rounded-lg bg-teal-50 p-2.5 text-teal-700">
                  <FileText
                    size={21}
                  />
                </div>

                <div>

                  <h1 className="text-2xl font-bold text-slate-900">
                    Edit Estimate
                  </h1>

                  <p className="mt-1 text-sm text-slate-500">
                    Update the customer quotation.
                  </p>

                </div>

              </div>

            </div>

            <button
              type="button"
              onClick={() =>
                router.push(
                  "/estimates"
                )
              }
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              <ArrowLeft
                size={17}
              />

              Back to Estimates
            </button>

          </div>

          {/* ==================================================
              ERROR
          ================================================== */}

          {error && (
            <div className="mb-6 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">

              <span>
                {error}
              </span>

              <button
                type="button"
                onClick={() =>
                  setError("")
                }
                className="rounded-md p-1 hover:bg-red-100"
              >
                <X size={17} />
              </button>

            </div>
          )}

          {/* ==================================================
              ESTIMATE DETAILS
          ================================================== */}

          <section className="mb-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="mb-5 flex items-center justify-between">

              <h2 className="text-[17px] font-bold text-slate-900">
                Estimate Details
              </h2>


            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">

              {/* ESTIMATE NUMBER */}

              <Field
                label="Estimate No."
                required
              >
                <input
                  value={
                    estimateNumber
                  }
                  readOnly
                  className="h-10 w-full rounded-md border border-slate-300 bg-slate-50 px-3 text-sm font-bold text-slate-900 outline-none"
                />
              </Field>

              {/* ESTIMATE DATE */}

              <Field
                label="Estimate Date"
                required
              >
                <input
                  type="date"
                  value={
                    estimateDate
                  }
                  onChange={(e) =>
                    setEstimateDate(
                      e.target.value
                    )
                  }
                  className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-900 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                />
              </Field>

              {/* VALID UNTIL */}

              <Field label="Valid Until">

                <input
                  type="date"
                  value={
                    validUntil
                  }
                  min={
                    estimateDate
                  }
                  onChange={(e) =>
                    setValidUntil(
                      e.target.value
                    )
                  }
                  className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-900 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                />

              </Field>

              {/* CUSTOMER */}

              <Field
                label="Customer"
                required
              >

                <div className="relative">

                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 z-10 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    ref={
                      customerInputRef
                    }
                    type="text"
                    value={
                      customerSearch
                    }
                    onChange={(e) => {
                      const value =
                        e.target.value;

                      setSelectedCustomer(
                        null
                      );

                      setCustomerSearch(
                        value
                      );

                      setShowProductSearch(
                        false
                      );

                      setShowCustomerSearch(
                        true
                      );

                      setHighlightedCustomer(
                        0
                      );
                    }}
                    onFocus={() => {
                      setShowProductSearch(
                        false
                      );

                      if (
                        !selectedCustomer
                      ) {
                        setShowCustomerSearch(
                          true
                        );
                      }
                    }}
                    onKeyDown={
                      handleCustomerKeyDown
                    }
                    placeholder="Search customer..."
                    className="h-10 w-full rounded-md border border-slate-300 bg-white pl-9 pr-9 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                  />

                  {selectedCustomer && (
                    <button
                      type="button"
                      onMouseDown={(
                        event
                      ) => {
                        event.preventDefault();
                        event.stopPropagation();

                        clearCustomer();
                      }}
                      className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 hover:bg-red-50 hover:text-red-500"
                      title="Clear customer"
                    >
                      <X size={14} />
                    </button>
                  )}

                  {/* CUSTOMER DROPDOWN */}

                  {showCustomerSearch &&
                    !selectedCustomer && (
                      <div className="absolute left-0 right-0 top-[46px] z-[9999] overflow-hidden rounded-lg border border-slate-300 bg-white text-slate-900 shadow-2xl">

                        <div className="border-b bg-slate-50 px-3 py-2 text-[11px] text-slate-500">
                          Customer Search

                          <span className="float-right">
                            ↑ ↓ Enter
                          </span>
                        </div>

                        {filteredCustomers.length ===
                        0 ? (
                          <div className="px-4 py-5 text-center text-sm text-slate-500">
                            No customers found
                          </div>
                        ) : (
                          filteredCustomers.map(
                            (
                              customer,
                              index
                            ) => (
                              <button
                                type="button"
                                key={
                                  customer.id
                                }
                                onMouseDown={(
                                  event
                                ) => {
                                  event.preventDefault();
                                  event.stopPropagation();

                                  selectCustomer(
                                    customer
                                  );
                                }}
                                className={`block w-full cursor-pointer border-b border-slate-200 px-3 py-3 text-left last:border-0 transition hover:bg-teal-50 ${
                                  index ===
                                  highlightedCustomer
                                    ? "bg-teal-50"
                                    : "bg-white"
                                }`}
                              >

                                <div className="flex items-center justify-between">

                                  <span className="text-sm font-semibold text-slate-900">
                                    {
                                      customer.name
                                    }
                                  </span>

                                  <span className="text-xs text-slate-400">
                                    #
                                    {
                                      customer.id
                                    }
                                  </span>

                                </div>

                                <div className="mt-1 text-xs text-slate-500">
                                  {
                                    customer.phone ||
                                    "No phone"
                                  }
                                </div>

                                <div className="mt-1 text-xs font-semibold text-orange-600">
                                  Balance: ₹
                                  {Number(
                                    customer.current_balance ??
                                      0
                                  ).toLocaleString(
                                    "en-IN",
                                    {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2,
                                    }
                                  )}
                                </div>

                              </button>
                            )
                          )
                        )}

                      </div>
                    )}

                </div>

              </Field>

            </div>

            {/* SELECTED CUSTOMER */}

            {selectedCustomer && (
              <div className="mt-4 rounded-lg border border-teal-100 bg-teal-50 px-4 py-3">

                <div className="flex flex-wrap items-center justify-between gap-3">

                  <div>

                    <p className="text-xs font-semibold text-teal-700">
                      Selected Customer
                    </p>

                    <p className="mt-1 text-sm font-bold text-slate-900">
                      {
                        selectedCustomer.name
                      }
                    </p>

                  </div>

                  <div className="text-right">

                    <p className="text-xs text-slate-500">
                      Phone
                    </p>

                    <p className="text-sm font-medium text-slate-900">
                      {
                        selectedCustomer.phone ||
                        "-"
                      }
                    </p>

                  </div>

                </div>

              </div>
            )}

          </section>

          {/* ==================================================
              ITEM ENTRY
          ================================================== */}

          <section className="rounded-xl border border-slate-200 bg-white shadow-sm">

            <div className="flex items-center justify-between border-b border-slate-200 p-5">

              <div>

                <h2 className="text-[17px] font-bold text-slate-900">
                  Item Entry
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Search products and enter quotation quantity and rate.
                </p>

              </div>

              <button
                type="button"
                onClick={
                  addLine
                }
                className="h-9 rounded-md bg-teal-700 px-3 text-sm font-semibold text-white hover:bg-teal-800"
              >
                <Plus
                  size={15}
                  className="mr-1 inline"
                />

                Add Line
              </button>

            </div>

            {/* TABLE HEADER */}

            <div className="grid grid-cols-[minmax(260px,1fr)_100px_150px_150px_100px] border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700">

              <div className="px-3 py-3">
                Product
              </div>

              <div className="px-3 py-3">
                Unit
              </div>

              <div className="px-3 py-3 text-right">
                Qty
              </div>

              <div className="px-3 py-3 text-right">
                Rate
              </div>

              <div className="px-3 py-3 text-right">
                Amount
              </div>

            </div>

            {/* ROWS */}

            {rows.map(
              (row, index) => {
                const amount =
                  (Number(
                    row.quantity
                  ) || 0) *
                  (Number(
                    row.unit_price
                  ) || 0);

                return (
                  <div
                    key={index}
                    className="grid grid-cols-[minmax(260px,1fr)_100px_150px_150px_100px] items-center border-b border-slate-100"
                  >

                    {/* PRODUCT */}

                    <div className="relative px-2 py-2">

                      <div className="relative">

                        <Search
                          size={15}
                          className="absolute left-3 top-3 text-slate-400"
                        />

                        <input
                          ref={(element) => {
                            productInputRefs.current[
                              index
                            ] =
                              element;
                          }}
                          value={
                            row.product_name
                          }
                          onChange={(
                            e
                          ) =>
                            handleProductInput(
                              index,
                              e.target.value
                            )
                          }
                          onFocus={() => {
                            setActiveProductRow(
                              index
                            );

                            setShowCustomerSearch(
                              false
                            );
                          }}
                          onKeyDown={(
                            e
                          ) =>
                            handleProductKeyDown(
                              e,
                              index
                            )
                          }
                          placeholder="Search product..."
                          className="h-10 w-full rounded-md border border-slate-300 bg-white pl-9 pr-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                        />

                      </div>

                      {/* PRODUCT DROPDOWN */}

                      {showProductSearch &&
                        activeProductRow ===
                          index && (
                          <div className="absolute left-2 right-2 top-[54px] z-[9999] overflow-hidden rounded-lg border border-slate-300 bg-white text-slate-900 shadow-xl">

                            <div className="border-b bg-slate-50 px-3 py-2 text-[11px] text-slate-500">

                              Product Search

                              <span className="float-right">
                                ↑ ↓ Enter
                              </span>

                            </div>

                            {filteredProducts.length ===
                            0 ? (
                              <div className="px-4 py-5 text-center text-sm text-slate-500">
                                No products found
                              </div>
                            ) : (
                              filteredProducts.map(
                                (
                                  product,
                                  productIndex
                                ) => {
                                  const p =
                                    product as Product &
                                      Record<
                                        string,
                                        unknown
                                      >;

                                  const productName =
                                    String(
                                      p.name ??
                                        p.product_name ??
                                        ""
                                    );

                                  const unit =
                                    String(
                                      p.unit ??
                                        ""
                                    );

                                  const price =
                                    p.selling_price !=
                                    null
                                      ? Number(
                                          p.selling_price
                                        )
                                      : 0;

                                  const stock =
                                    p.current_stock !=
                                    null
                                      ? Number(
                                          p.current_stock
                                        )
                                      : 0;

                                  return (
                                    <button
                                      type="button"
                                      key={
                                        product.id
                                      }
                                      onMouseDown={(
                                        event
                                      ) => {
                                        event.preventDefault();
                                        event.stopPropagation();

                                        selectProduct(
                                          index,
                                          product
                                        );
                                      }}
                                      className={`w-full border-b border-slate-200 px-3 py-3 text-left last:border-0 hover:bg-teal-50 ${
                                        productIndex ===
                                        highlightedProduct
                                          ? "bg-teal-50"
                                          : "bg-white"
                                      }`}
                                    >

                                      <div className="flex items-center justify-between gap-4">

                                        <div>

                                          <div className="text-sm font-semibold text-slate-900">
                                            {
                                              productName
                                            }
                                          </div>

                                          <div className="mt-1 text-xs text-slate-500">
                                            Unit:{" "}
                                            {
                                              unit ||
                                              "-"
                                            }

                                            {" • "}

                                            Stock:{" "}
                                            {
                                              stock
                                            }
                                          </div>

                                        </div>

                                        <div className="text-sm font-semibold text-slate-900">
                                          ₹
                                          {money(
                                            price
                                          )}
                                        </div>

                                      </div>

                                    </button>
                                  );
                                }
                              )
                            )}

                          </div>
                        )}

                    </div>

                    {/* UNIT */}

                    <div className="px-2 py-2">

                      <input
                        value={
                          row.unit
                        }
                        readOnly
                        className="h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-2 text-sm font-medium text-slate-800 outline-none"
                      />

                    </div>

                    {/* QUANTITY */}

                    <div className="px-2 py-2">

                      <input
                        ref={(element) => {
                          quantityInputRefs.current[
                            index
                          ] =
                            element;
                        }}
                        type="number"
                        min="0"
                        step="0.001"
                        value={
                          row.quantity
                        }
                        onChange={(e) => {
                          const value =
                            e.target
                              .value;

                          setRows(
                            (
                              current
                            ) =>
                              current.map(
                                (
                                  currentRow,
                                  currentIndex
                                ) =>
                                  currentIndex ===
                                  index
                                    ? {
                                        ...currentRow,
                                        quantity:
                                          value,
                                      }
                                    : currentRow
                              )
                          );
                        }}
                        onKeyDown={(
                          e
                        ) =>
                          handleQuantityKeyDown(
                            e,
                            index
                          )
                        }
                        className="h-10 w-full rounded-md border border-slate-300 bg-white px-2 text-right text-sm font-medium text-slate-900 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                      />

                    </div>

                    {/* RATE */}

                    <div className="px-2 py-2">

                      <input
                        ref={(element) => {
                          rateInputRefs.current[
                            index
                          ] =
                            element;
                        }}
                        type="number"
                        min="0"
                        step="0.01"
                        value={
                          row.unit_price
                        }
                        onChange={(e) => {
                          const value =
                            e.target
                              .value;

                          setRows(
                            (
                              current
                            ) =>
                              current.map(
                                (
                                  currentRow,
                                  currentIndex
                                ) =>
                                  currentIndex ===
                                  index
                                    ? {
                                        ...currentRow,
                                        unit_price:
                                          value,
                                      }
                                    : currentRow
                              )
                          );
                        }}
                        onKeyDown={(
                          e
                        ) =>
                          handleRateKeyDown(
                            e,
                            index
                          )
                        }
                        className="h-10 w-full rounded-md border border-slate-300 bg-white px-2 text-right text-sm font-medium text-slate-900 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                      />

                    </div>

                    {/* AMOUNT + DELETE */}

                    <div className="flex items-center justify-end gap-2 px-2 py-2">

                      <span className="text-sm font-semibold text-slate-900">
                        ₹
                        {money(
                          amount
                        )}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          deleteLine(
                            index
                          )
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-md bg-red-50 text-red-500 hover:bg-red-100"
                        title="Delete item"
                      >
                        <Trash2
                          size={15}
                        />
                      </button>

                    </div>

                  </div>
                );
              }
            )}

            <div className="flex h-14 items-center justify-center text-xs text-slate-400">
              Press Enter after Rate to move to the next line
            </div>

            {/* NOTES */}

            <div className="border-t border-slate-200 p-5">

              <label className="mb-2 block text-sm font-semibold text-slate-900">
                Notes
              </label>

              <textarea
                value={notes}
                onChange={(e) =>
                  setNotes(
                    e.target.value
                  )
                }
                rows={3}
                placeholder="Enter estimate notes..."
                className="w-full resize-none rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-900 placeholder:text-slate-400 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
              />

            </div>

          </section>

        </div>

      </main>

      {/* ========================================================
          FIXED ESTIMATE VOUCHER
          ALWAYS VISIBLE
      ======================================================== */}

      <div className="fixed bottom-0 left-0 right-0 z-[100] border-t border-slate-300 bg-white shadow-[0_-6px_25px_rgba(0,0,0,0.12)] lg:left-[260px]">

        {/* MAIN VOUCHER */}

        <div className="mx-auto flex max-w-[1600px] flex-col gap-3 px-4 py-3 sm:px-6 lg:px-8 xl:flex-row xl:items-center xl:justify-between">

          {/* LEFT */}

          <div className="flex items-center gap-4">

            <div className="hidden rounded-lg bg-teal-50 p-2.5 text-teal-700 sm:block">

              <FileText
                size={19}
              />

            </div>

            <div>

              <div className="flex items-center gap-2">

                <h2 className="text-sm font-bold text-slate-900">
                  Estimate Voucher
                </h2>

                <span className="rounded-full bg-teal-50 px-2.5 py-1 text-[11px] font-bold text-teal-700">
                  {estimateNumber}
                </span>

              </div>

              <p className="mt-0.5 text-[11px] text-slate-500">
                Final quotation amount
              </p>

            </div>

          </div>

          {/* AMOUNTS */}

          <div className="flex flex-1 items-center justify-end gap-4 sm:gap-6">

            {/* SUBTOTAL */}

            <div className="hidden sm:block">

              <p className="text-[11px] font-medium text-slate-500">
                Subtotal
              </p>

              <p className="mt-0.5 text-sm font-bold text-slate-900">
                ₹
                {money(
                  subtotal
                )}
              </p>

            </div>

            {/* DISCOUNT */}

            <div className="flex items-center gap-2">

              <div>

                <p className="text-[11px] font-medium text-slate-500">
                  Discount
                </p>

                <div className="mt-0.5 flex items-center gap-2">

                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={
                      discountPercent
                    }
                    onChange={(e) =>
                      setDiscountPercent(
                        e.target.value
                      )
                    }
                    className="h-8 w-16 rounded-md border border-slate-300 bg-white px-2 text-right text-sm font-semibold text-slate-900 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                  />

                  <span className="text-xs text-slate-500">
                    %
                  </span>

                </div>

              </div>

              <div className="hidden sm:block">

                <p className="text-[11px] text-slate-500">
                  Discount Amount
                </p>

                <p className="mt-0.5 text-sm font-semibold text-red-600">
                  - ₹
                  {money(
                    discountAmount
                  )}
                </p>

              </div>

            </div>

            {/* TOTAL */}

            <div className="min-w-[145px] rounded-lg border border-teal-200 bg-teal-50 px-4 py-2">

              <p className="text-[10px] font-bold uppercase tracking-wide text-teal-700">
                Total Estimate
              </p>

              <p className="mt-0.5 text-xl font-bold text-teal-800">
                ₹
                {money(
                  totalAmount
                )}
              </p>

            </div>

            {/* ACTIONS */}

            <div className="flex items-center gap-2">

              <button
                type="button"
                onClick={() =>
                  router.push(
                    "/estimates"
                  )
                }
                className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={
                  loading ||
                  loadingData
                }
                onClick={
                  handleSave
                }
                className="inline-flex h-9 items-center rounded-lg bg-teal-700 px-4 text-sm font-semibold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
              >

                {loading ? (
                  <Loader2
                    size={15}
                    className="mr-2 animate-spin"
                  />
                ) : (
                  <Save
                    size={15}
                    className="mr-2"
                  />
                )}

                {loading
                  ? "Saving..."
                  : "Update Estimate"}

              </button>

            </div>

          </div>

        </div>

        {/* SHORTCUT BAR */}

        <div className="hidden border-t border-slate-100 bg-slate-50 px-4 py-1.5 lg:block">

          <div className="mx-auto flex max-w-[1600px] items-center gap-5 px-4 text-[11px] text-slate-500 lg:px-4">

            <div className="flex items-center gap-2 font-semibold">
              <Keyboard
                size={13}
              />
              Shortcuts
            </div>

            <Shortcut
              keyName="F4"
              label="Customer"
            />

            <Shortcut
              keyName="F7"
              label="Product"
            />

            <Shortcut
              keyName="F9"
              label="Save"
            />

            <Shortcut
              keyName="Ctrl + S"
              label="Save"
            />

            <Shortcut
              keyName="Ctrl + A"
              label="Add Line"
            />

            <Shortcut
              keyName="Ctrl + D"
              label="Delete Line"
            />

            <Shortcut
              keyName="Esc"
              label="Cancel"
            />

          </div>

        </div>

      </div>

    </div>
  );
}

/* ============================================================
   FIELD
============================================================ */

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>

      <label className="mb-2 block text-sm font-medium text-slate-700">

        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}

      </label>

      {children}

    </div>
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

      <span className="rounded border border-slate-300 bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-700">
        {keyName}
      </span>

      <span>
        {label}
      </span>

    </div>
  );
}