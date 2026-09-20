"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { KeyboardEvent } from "react";
import { useParams, useRouter } from "next/navigation";

import {
  ArrowLeft,
  Edit3,
  FileText,
  Keyboard,
  Plus,
  Save,
  Search,
  ShoppingCart,
  Trash2,
  UserRound,
  X,
} from "lucide-react";

import {
  getProducts,
  Product,
} from "@/src/lib/products";

import {
  getCustomers,
  getCustomer,
  Customer,
} from "@/src/lib/customer";

import {
  getSale,
  SaleDetails,
  updateSale,
  UpdateSaleInput,
} from "@/src/lib/sales";

/* ============================================================
   TYPES
============================================================ */

interface SaleRow {
  id?: number;
  product_id: number | "";
  product_name: string;
  quantity: string;
  unit_price: string;
}

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
   HELPERS
============================================================ */

const emptyRow = (): SaleRow => ({
  product_id: "",
  product_name: "",
  quantity: "",
  unit_price: "",
});

const money = (value: number) =>
  value.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

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

export default function EditSalePage() {
  const router = useRouter();
  const params = useParams();

  const saleId = Number(params.id);

  /* ==========================================================
     SALE
  ========================================================== */

  const [sale, setSale] =
    useState<SaleDetails | null>(null);

  /* ==========================================================
     CUSTOMER
  ========================================================== */

  const [customers, setCustomers] =
    useState<Customer[]>([]);

  const [selectedCustomer, setSelectedCustomer] =
    useState<Customer | null>(null);

  const [customerId, setCustomerId] =
    useState<number | "">("");

  const [customerSearch, setCustomerSearch] =
    useState("");

  const [showCustomerSearch, setShowCustomerSearch] =
    useState(false);

  const [highlightedCustomer, setHighlightedCustomer] =
    useState(0);

  /* ==========================================================
     PRODUCTS
  ========================================================== */

  const [products, setProducts] =
    useState<ProductInfo[]>([]);

  /* ==========================================================
     VOUCHER
  ========================================================== */

  const [invoiceNumber, setInvoiceNumber] =
    useState("");

  const [saleDate, setSaleDate] =
    useState("");

  const [paymentMethod, setPaymentMethod] =
    useState("cash");

  const [discountPercent, setDiscountPercent] =
    useState("0");

  const [paidAmount, setPaidAmount] =
    useState("0");

  const [notes, setNotes] =
    useState("");

  const [rows, setRows] =
    useState<SaleRow[]>([]);

  /* ==========================================================
     PRODUCT SEARCH
  ========================================================== */

  const [activeProductRow, setActiveProductRow] =
    useState<number | null>(null);

  const [productSearch, setProductSearch] =
    useState("");

  const [showProductSearch, setShowProductSearch] =
    useState(false);

  const [highlightedProduct, setHighlightedProduct] =
    useState(0);

  /* ==========================================================
     UI
  ========================================================== */

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  /* ==========================================================
     REFS
  ========================================================== */

  const customerRef =
    useRef<HTMLInputElement>(null);

  const productInputRefs =
    useRef<(HTMLInputElement | null)[]>(
      []
    );

  const quantityInputRefs =
    useRef<(HTMLInputElement | null)[]>(
      []
    );

  const rateInputRefs =
    useRef<(HTMLInputElement | null)[]>(
      []
    );

  const paidRef =
    useRef<HTMLInputElement>(null);

  /* ==========================================================
     LOAD SALE
  ========================================================== */

  useEffect(() => {
    if (
      !saleId ||
      Number.isNaN(saleId)
    ) {
      setError("Invalid sale ID");
      setLoading(false);
      return;
    }

    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const saleData =
          await getSale(saleId);

        const [
          customerList,
          productData,
        ] = await Promise.all([
          getCustomers(),
          getProducts(),
        ]);

        setSale(saleData);

        setCustomers(
          customerList
        );

        const normalizedProducts =
          productData.map(
            normalizeProduct
          );

        setProducts(
          normalizedProducts
        );

        /* ------------------------------------------------------
           FILL VOUCHER
        ------------------------------------------------------ */

        setInvoiceNumber(
          saleData.invoice_number
        );

        /* ------------------------------------------------------
           DATE
        ------------------------------------------------------ */

        const rawSaleDate =
          saleData.sale_date;

        let formattedSaleDate = "";

        if (rawSaleDate) {
          if (
            /^\d{4}-\d{2}-\d{2}$/.test(
              rawSaleDate
            )
          ) {
            formattedSaleDate =
              rawSaleDate;
          } else {
            const date =
              new Date(
                rawSaleDate
              );

            if (
              !Number.isNaN(
                date.getTime()
              )
            ) {
              const year =
                date.getFullYear();

              const month =
                String(
                  date.getMonth() + 1
                ).padStart(2, "0");

              const day =
                String(
                  date.getDate()
                ).padStart(2, "0");

              formattedSaleDate =
                `${year}-${month}-${day}`;
            }
          }
        }

        setSaleDate(
          formattedSaleDate
        );

        setPaymentMethod(
          saleData.payment_method
        );

        setDiscountPercent(
          String(
            saleData.discount_percent
          )
        );

        setPaidAmount(
          String(
            saleData.paid_amount
          )
        );

        setNotes(
          saleData.notes || ""
        );

        /* ------------------------------------------------------
           CUSTOMER
           
           IMPORTANT:
           Fetch exact customer using customer_id.
        ------------------------------------------------------ */

        if (
          saleData.customer_id
        ) {
          try {
            const customerData =
              await getCustomer(
                Number(
                  saleData.customer_id
                )
              );

            setSelectedCustomer(
              customerData
            );

            setCustomerId(
              customerData.id
            );

            setCustomerSearch(
              customerData.name
            );
          } catch {
            const fallbackCustomer =
              customerList.find(
                (customer) =>
                  customer.id ===
                  Number(
                    saleData.customer_id
                  )
              );

            if (
              fallbackCustomer
            ) {
              setSelectedCustomer(
                fallbackCustomer
              );

              setCustomerId(
                fallbackCustomer.id
              );

              setCustomerSearch(
                fallbackCustomer.name
              );
            }
          }
        } else {
          setSelectedCustomer(
            null
          );

          setCustomerId("");
          setCustomerSearch("");
        }

        /* ------------------------------------------------------
           EXISTING ITEMS
        ------------------------------------------------------ */

        const existingRows =
          saleData.items.map(
            (item) => {
              const product =
                normalizedProducts.find(
                  (p) =>
                    p.id ===
                    Number(
                      item.product_id
                    )
                );

              return {
                id: item.id,

                product_id:
                  Number(
                    item.product_id
                  ),

                product_name:
                  product?.name ||
                  `Product #${item.product_id}`,

                quantity:
                  String(
                    item.quantity
                  ),

                unit_price:
                  String(
                    item.unit_price
                  ),
              };
            }
          );

        setRows(
          existingRows.length
            ? existingRows
            : [emptyRow()]
        );
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

    loadData();
  }, [saleId]);

  /* ==========================================================
     CUSTOMER SEARCH
  ========================================================== */

  const filteredCustomers =
    useMemo(() => {
      const search =
        customerSearch
          .trim()
          .toLowerCase();

      if (!search) {
        return customers
          .filter(
            (customer) =>
              customer.is_active ||
              customer.id ===
                customerId
          )
          .slice(0, 8);
      }

      return customers
        .filter((customer) => {
          return (
            customer.is_active &&
            (customer.name
              .toLowerCase()
              .includes(search) ||
              customer.phone
                ?.toLowerCase()
                .includes(search))
          );
        })
        .slice(0, 8);
    }, [
      customers,
      customerSearch,
      customerId,
    ]);

  /* ==========================================================
     SELECT CUSTOMER
  ========================================================== */

  const selectCustomer = (
    customer: Customer
  ) => {
    setCustomerId(
      customer.id
    );

    setSelectedCustomer(
      customer
    );

    setCustomerSearch(
      customer.name
    );

    setShowCustomerSearch(
      false
    );

    setHighlightedCustomer(
      0
    );
  };

  /* ==========================================================
     WALK-IN CUSTOMER
  ========================================================== */

  const selectWalkInCustomer = () => {
    setCustomerId("");

    setSelectedCustomer(
      null
    );

    setCustomerSearch("");

    setShowCustomerSearch(
      false
    );

    setHighlightedCustomer(
      0
    );
  };

  /* ==========================================================
     CUSTOMER INPUT
  ========================================================== */

  const handleCustomerInput = (
    value: string
  ) => {
    setCustomerId("");

    setSelectedCustomer(
      null
    );

    setCustomerSearch(
      value
    );

    setShowCustomerSearch(
      true
    );

    setHighlightedCustomer(
      0
    );
  };

  /* ==========================================================
     CUSTOMER KEYBOARD
  ========================================================== */

  const handleCustomerKeyDown = (
    event: KeyboardEvent<HTMLInputElement>
  ) => {
    if (
      event.key ===
      "ArrowDown"
    ) {
      event.preventDefault();

      setHighlightedCustomer(
        (current) =>
          Math.min(
            current + 1,
            Math.max(
              filteredCustomers.length -
                1,
              0
            )
          )
      );

      return;
    }

    if (
      event.key ===
      "ArrowUp"
    ) {
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

    if (
      event.key ===
      "Enter"
    ) {
      event.preventDefault();

      const customer =
        filteredCustomers[
          highlightedCustomer
        ];

      if (customer) {
        selectCustomer(
          customer
        );
      }

      return;
    }

    if (
      event.key ===
      "Escape"
    ) {
      event.preventDefault();

      setShowCustomerSearch(
        false
      );

      return;
    }
  };

  /* ==========================================================
     CALCULATIONS
  ========================================================== */

  const subtotal = useMemo(() => {
    return rows.reduce(
      (sum, row) => {
        const quantity =
          Number(
            row.quantity
          ) || 0;

        const rate =
          Number(
            row.unit_price
          ) || 0;

        return (
          sum +
          quantity * rate
        );
      },
      0
    );
  }, [rows]);

  const discountAmount =
    useMemo(() => {
      const discount =
        Number(
          discountPercent
        ) || 0;

      return (
        subtotal *
        (discount / 100)
      );
    }, [
      subtotal,
      discountPercent,
    ]);

  const totalAmount =
    Math.max(
      0,
      subtotal -
        discountAmount
    );

  const paid =
    Number(paidAmount) || 0;

  const balanceAmount =
    Math.max(
      0,
      totalAmount - paid
    );

  /* ==========================================================
     PRODUCT SEARCH
  ========================================================== */

  const filteredProducts =
    useMemo(() => {
      if (
        !productSearch.trim()
      ) {
        return products.slice(
          0,
          8
        );
      }

      const search =
        productSearch
          .toLowerCase();

      return products
        .filter((product) => {
          return (
            product.name
              .toLowerCase()
              .includes(search) ||
            product.code
              ?.toLowerCase()
              .includes(search) ||
            product.hsn
              ?.toLowerCase()
              .includes(search)
          );
        })
        .slice(0, 8);
    }, [
      products,
      productSearch,
    ]);

  /* ==========================================================
     SELECT PRODUCT
  ========================================================== */

  const selectProduct = (
    rowIndex: number,
    product: ProductInfo
  ) => {
    setRows((current) =>
      current.map(
        (row, index) =>
          index === rowIndex
            ? {
                ...row,

                product_id:
                  product.id,

                product_name:
                  product.name,

                unit_price:
                  product.sellingPrice !=
                  null
                    ? String(
                        product.sellingPrice
                      )
                    : row.unit_price,
              }
            : row
      )
    );

    setShowProductSearch(
      false
    );

    setActiveProductRow(
      null
    );

    setProductSearch("");

    setHighlightedProduct(
      0
    );

    setTimeout(() => {
      quantityInputRefs.current[
        rowIndex
      ]?.focus();

      quantityInputRefs.current[
        rowIndex
      ]?.select();
    }, 50);
  };

  /* ==========================================================
     PRODUCT INPUT
  ========================================================== */

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
                product_name:
                  value,
              }
            : row
      )
    );

    setActiveProductRow(
      rowIndex
    );

    setProductSearch(
      value
    );

    setShowProductSearch(
      true
    );

    setHighlightedProduct(
      0
    );
  };

  /* ==========================================================
     PRODUCT KEYBOARD
  ========================================================== */

  const handleProductKeyDown = (
    event: KeyboardEvent<HTMLInputElement>,
    rowIndex: number
  ) => {
    if (
      event.key ===
      "ArrowDown"
    ) {
      event.preventDefault();

      setHighlightedProduct(
        (current) =>
          Math.min(
            current + 1,
            Math.max(
              filteredProducts.length -
                1,
              0
            )
          )
      );

      return;
    }

    if (
      event.key ===
      "ArrowUp"
    ) {
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

    if (
      event.key ===
      "Enter"
    ) {
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

    if (
      event.key ===
      "Escape"
    ) {
      event.preventDefault();

      setShowProductSearch(
        false
      );

      setActiveProductRow(
        null
      );
    }
  };

  /* ==========================================================
     ROW UPDATE
  ========================================================== */

  const updateRow = (
    index: number,
    field: keyof SaleRow,
    value: string
  ) => {
    setRows((current) =>
      current.map(
        (row, rowIndex) =>
          rowIndex === index
            ? {
                ...row,
                [field]: value,
              }
            : row
      )
    );
  };

  /* ==========================================================
     QUANTITY ENTER
  ========================================================== */

  const handleQuantityKeyDown = (
    event: KeyboardEvent<HTMLInputElement>,
    rowIndex: number
  ) => {
    if (
      event.key ===
      "Enter"
    ) {
      event.preventDefault();

      rateInputRefs.current[
        rowIndex
      ]?.focus();

      rateInputRefs.current[
        rowIndex
      ]?.select();
    }
  };

  /* ==========================================================
     RATE ENTER
  ========================================================== */

  const handleRateKeyDown = (
    event: KeyboardEvent<HTMLInputElement>,
    rowIndex: number
  ) => {
    if (
      event.key ===
      "Enter"
    ) {
      event.preventDefault();

      if (
        rowIndex ===
        rows.length - 1
      ) {
        setRows((current) => [
          ...current,
          emptyRow(),
        ]);

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

  /* ==========================================================
     ADD LINE
  ========================================================== */

  const addLine = () => {
    const newIndex =
      rows.length;

    setRows((current) => [
      ...current,
      emptyRow(),
    ]);

    setTimeout(() => {
      productInputRefs.current[
        newIndex
      ]?.focus();
    }, 50);
  };

  /* ==========================================================
     DELETE LINE
  ========================================================== */

  const deleteLine = (
    index: number
  ) => {
    setRows((current) => {
      if (
        current.length === 1
      ) {
        return [emptyRow()];
      }

      return current.filter(
        (_, rowIndex) =>
          rowIndex !== index
      );
    });

    setTimeout(() => {
      productInputRefs.current[
        Math.max(
          0,
          index - 1
        )
      ]?.focus();
    }, 50);
  };

  /* ==========================================================
     VALIDATE
  ========================================================== */

  const validateForm = () => {
    if (
      !invoiceNumber.trim()
    ) {
      setError(
        "Invoice number is required"
      );

      return false;
    }

    if (!saleDate) {
      setError(
        "Sale date is required"
      );

      return false;
    }

    const validRows =
      rows.filter(
        (row) =>
          row.product_id !==
            "" &&
          Number(
            row.quantity
          ) > 0
      );

    if (
      validRows.length === 0
    ) {
      setError(
        "Please enter at least one product"
      );

      return false;
    }

    for (
      const row of validRows
    ) {
      if (!row.product_id) {
        setError(
          "Please select a valid product"
        );

        return false;
      }

      if (
        Number(
          row.quantity
        ) <= 0
      ) {
        setError(
          "Quantity must be greater than 0"
        );

        return false;
      }

      if (
        Number(
          row.unit_price
        ) < 0
      ) {
        setError(
          "Rate cannot be negative"
        );

        return false;
      }
    }

    const discount =
      Number(
        discountPercent
      );

    if (
      discount < 0 ||
      discount > 100
    ) {
      setError(
        "Discount must be between 0 and 100"
      );

      return false;
    }

    if (
      paid < 0
    ) {
      setError(
        "Paid amount cannot be negative"
      );

      return false;
    }

    if (
      paid > totalAmount
    ) {
      setError(
        "Paid amount cannot exceed total amount"
      );

      paidRef.current?.focus();

      return false;
    }

    return true;
  };

  /* ==========================================================
     UPDATE SALE
  ========================================================== */

  const handleUpdate =
    async () => {
      setError("");

      if (
        !validateForm()
      ) {
        return;
      }

      try {
        setSaving(true);

        const validRows =
          rows.filter(
            (row) =>
              row.product_id !==
                "" &&
              Number(
                row.quantity
              ) > 0
          );

        const payload: UpdateSaleInput =
          {
            invoice_number:
              invoiceNumber.trim(),

            customer_id:
              customerId === ""
                ? null
                : Number(
                    customerId
                  ),

            sale_date:
              saleDate,

            payment_method:
              paymentMethod,

            discount_percent:
              Number(
                discountPercent
              ) || 0,

            paid_amount:
              Number(
                paidAmount
              ) || 0,

            status:
              sale?.status ||
              "completed",

            notes:
              notes.trim() ||
              null,

            items:
              validRows.map(
                (row) => ({
                  product_id:
                    Number(
                      row.product_id
                    ),

                  quantity:
                    Number(
                      row.quantity
                    ),

                  unit_price:
                    Number(
                      row.unit_price
                    ) || 0,
                })
              ),
          };

        await updateSale(
          saleId,
          payload
        );

        router.push(
          `/sales/${saleId}`
        );
      } catch (err: unknown) {
        console.error(
          "Failed to update sale:",
          err
        );

        setError(
          err instanceof Error
            ? err.message
            : "Failed to update sale"
        );
      } finally {
        setSaving(false);
      }
    };

  /* ==========================================================
     KEYBOARD SHORTCUTS
  ========================================================== */

  useEffect(() => {
    const handler = (
      event: globalThis.KeyboardEvent
    ) => {
      /* F4 → CUSTOMER */

      if (
        event.key ===
        "F4"
      ) {
        event.preventDefault();

        customerRef.current?.focus();

        setShowCustomerSearch(
          true
        );

        return;
      }

      /* F7 → PRODUCT */

      if (
        event.key ===
        "F7"
      ) {
        event.preventDefault();

        productInputRefs.current[
          0
        ]?.focus();

        return;
      }

      /* F9 → UPDATE */

      if (
        event.key ===
        "F9"
      ) {
        event.preventDefault();

        handleUpdate();

        return;
      }

      /* CTRL + S → UPDATE */

      if (
        event.ctrlKey &&
        event.key.toLowerCase() ===
          "s"
      ) {
        event.preventDefault();

        handleUpdate();

        return;
      }

      /* CTRL + A → ADD LINE */

      if (
        event.ctrlKey &&
        event.key.toLowerCase() ===
          "a"
      ) {
        event.preventDefault();

        addLine();

        return;
      }

      /* CTRL + D → DELETE ACTIVE LINE */

      if (
        event.ctrlKey &&
        event.key.toLowerCase() ===
          "d"
      ) {
        event.preventDefault();

        if (
          activeProductRow !==
          null
        ) {
          deleteLine(
            activeProductRow
          );
        }

        return;
      }

      /* ESC */

      if (
        event.key ===
        "Escape"
      ) {
        if (
          showCustomerSearch
        ) {
          setShowCustomerSearch(
            false
          );

          return;
        }

        if (
          showProductSearch
        ) {
          setShowProductSearch(
            false
          );

          return;
        }

        router.push(
          `/sales/${saleId}`
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
    rows,
    sale,
    invoiceNumber,
    saleDate,
    paymentMethod,
    discountPercent,
    paidAmount,
    notes,
    totalAmount,
    customerId,
    showCustomerSearch,
    showProductSearch,
  ]);

  /* ==========================================================
     LOADING
  ========================================================== */

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

  /* ==========================================================
     ERROR / NOT FOUND
  ========================================================== */

  if (
    error &&
    !sale
  ) {
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
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              router.push(
                "/sales"
              )
            }
            className="mt-5 bg-[#079b89] text-white px-5 py-2.5 rounded-lg font-semibold"
          >
            Back to Sales
          </button>

        </div>
      </div>
    );
  }

  /* ==========================================================
     UI
  ========================================================== */

  return (
    <div className="min-h-screen bg-[#f4f7f8] text-[#102a43] pb-[65px]">

      {/* ======================================================
          SIDEBAR
      ======================================================= */}

      <aside className="fixed left-0 top-0 bottom-0 w-[250px] bg-[#034f4a] text-white z-40">

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
            router.push(
              "/dashboard"
            )
          }
        />

        <SidebarItem
          label="Sales & Billing"
          icon="▣"
          active
          onClick={() =>
            router.push(
              "/sales"
            )
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
            router.push(
              "/products"
            )
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
            router.push(
              "/purchases"
            )
          }
        />

        <div className="px-6 pt-5 pb-2 text-[10px] tracking-[2px] text-emerald-300 font-semibold">
          PARTIES
        </div>

        <SidebarItem
          label="Customers"
          icon="♙"
          onClick={() =>
            router.push(
              "/customers"
            )
          }
        />

        <SidebarItem
          label="Suppliers"
          icon="▱"
          onClick={() =>
            router.push(
              "/suppliers"
            )
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

        <header className="h-[72px] bg-white border-b border-slate-200 flex items-center px-7 gap-5">

          <button
            type="button"
            onClick={() =>
              router.push(
                `/sales/${saleId}`
              )
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
            PAGE
        ===================================================== */}

        <main className="p-7">

          {/* PAGE HEADER */}

          <div className="flex items-center justify-between mb-6">

            <div>

              <div className="text-sm text-slate-500 mb-2">

                Sales

                <span className="mx-2">
                  ›
                </span>

                {invoiceNumber}

                <span className="mx-2">
                  ›
                </span>

                Edit

              </div>

              <div className="flex items-center gap-3">

                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#079b89] flex items-center justify-center">
                  <Edit3 size={24} />
                </div>

                <div>

                  <h1 className="text-[27px] font-bold">
                    Edit Sale
                  </h1>

                  <p className="text-sm text-slate-500 mt-1">
                    Modify sales invoice details and items.
                  </p>

                </div>

              </div>

            </div>

            <button
              type="button"
              onClick={() =>
                router.push(
                  `/sales/${saleId}`
                )
              }
              className="h-10 px-4 border border-slate-300 bg-white rounded-lg font-semibold hover:bg-slate-50"
            >
              <ArrowLeft
                size={16}
                className="inline mr-2"
              />

              Back to Sale
            </button>

          </div>

          {/* ERROR */}

          {error && (
            <div className="mb-5 px-4 py-3 rounded-lg border border-red-200 bg-red-50 text-red-700 flex justify-between">

              <span className="text-sm">
                {error}
              </span>

              <button
                type="button"
                onClick={() =>
                  setError("")
                }
              >
                <X size={17} />
              </button>

            </div>
          )}

          {/* ==================================================
              VOUCHER DETAILS
          =================================================== */}

          <section className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 mb-5">

            <div className="flex items-center justify-between mb-5">

              <div className="flex items-center gap-3">

                <FileIcon />

                <h2 className="font-bold text-[17px]">
                  Voucher Details
                </h2>

              </div>

              <span className="text-xs text-amber-700 bg-amber-50 px-3 py-1.5 rounded-full">
                Editing voucher
              </span>

            </div>

            <div className="grid grid-cols-4 gap-4">

              {/* INVOICE NUMBER */}

              <Field
                label="Invoice No."
                required
              >
                <input
                  value={
                    invoiceNumber
                  }
                  onChange={(e) =>
                    setInvoiceNumber(
                      e.target.value
                    )
                  }
                  className="input"
                />
              </Field>

              {/* SALE DATE */}

              <Field
                label="Sale Date"
                required
              >
                <input
                  type="date"
                  value={
                    saleDate
                  }
                  onChange={(e) =>
                    setSaleDate(
                      e.target.value
                    )
                  }
                  className="input"
                />
              </Field>

              {/* CUSTOMER */}

    <Field label="Customer">

    <div className="relative">

        {/* Search Icon */}
        <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10"
        />

        {/* Customer Input */}
        <input
            ref={customerRef}
            type="text"
            value={customerSearch}
            onChange={(e) => {
                handleCustomerInput(e.target.value);
            }}
            onFocus={() => {
                if (!selectedCustomer) {
                    setShowCustomerSearch(true);
                }
            }}
            onClick={() => {
                if (!selectedCustomer) {
                    setShowCustomerSearch(true);
                }
            }}
            onKeyDown={handleCustomerKeyDown}
            placeholder="Walk-in Customer"
            className="w-full h-10 rounded-lg border border-slate-300 bg-white pl-9 pr-9 text-sm text-slate-800 outline-none transition focus:border-[#079b89] focus:ring-2 focus:ring-[#079b89]/10"
        />

        {/* Clear Customer */}
        {selectedCustomer && (
            <button
                type="button"
                onMouseDown={(e) => {
                    e.preventDefault();

                    selectWalkInCustomer();

                    setTimeout(() => {
                        customerRef.current?.focus();
                    }, 50);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                title="Clear customer"
            >
                <X size={14} />
            </button>
        )}

        {/* Customer Search Dropdown */}
        {showCustomerSearch && !selectedCustomer && (
            <div className="absolute left-0 right-0 top-[44px] z-50 overflow-hidden rounded-lg border border-slate-300 bg-white shadow-xl">

                <div className="border-b bg-slate-50 px-3 py-2 text-[11px] text-slate-500">
                    Customer Search

                    <span className="float-right">
                        ↑ ↓ Enter
                    </span>
                </div>

                {/* Walk-in Customer */}
                <button
                    type="button"
                    onMouseDown={(e) => {
                        e.preventDefault();
                        selectWalkInCustomer();
                    }}
                    className={`w-full border-b px-3 py-2.5 text-left transition hover:bg-slate-50 ${
                        customerId === ""
                            ? "bg-[#e6f7f4]"
                            : ""
                    }`}
                >
                    <div className="text-sm font-semibold text-slate-800">
                        Walk-in Customer
                    </div>

                    <div className="mt-1 text-[11px] text-slate-500">
                        No customer account
                    </div>
                </button>

                {/* Customers */}
                {filteredCustomers.length === 0 ? (
                    <div className="px-4 py-4 text-sm text-slate-500">
                        No customer found
                    </div>
                ) : (
                    filteredCustomers.map(
                        (customer, customerIndex) => (
                            <button
                                type="button"
                                key={customer.id}
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    selectCustomer(customer);
                                }}
                                className={`w-full border-b px-3 py-2.5 text-left last:border-0 ${
                                    highlightedCustomer ===
                                    customerIndex
                                        ? "bg-[#e6f7f4]"
                                        : "hover:bg-slate-50"
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-semibold text-slate-800">
                                        {customer.name}
                                    </span>

                                    <span className="text-xs text-slate-400">
                                        #{customer.id}
                                    </span>
                                </div>

                                {customer.phone && (
                                    <div className="mt-1 text-[11px] text-slate-500">
                                        {customer.phone}
                                    </div>
                                )}
                            </button>
                        )
                    )
                )}
            </div>
        )}

    </div>

</Field>

              {/* PAYMENT METHOD */}

              <Field label="Payment Method">

                <select
                  value={
                    paymentMethod
                  }
                  onChange={(e) =>
                    setPaymentMethod(
                      e.target.value
                    )
                  }
                  className="input bg-white"
                >

                  <option value="cash">
                    Cash
                  </option>

                  <option value="upi">
                    UPI
                  </option>

                  <option value="bank">
                    Bank
                  </option>

                  <option value="credit">
                    Credit
                  </option>

                </select>

              </Field>

            </div>

          </section>

          {/* ==================================================
              ITEMS + RIGHT SIDE
          =================================================== */}

          <div className="grid grid-cols-[1fr_320px] gap-5">

            {/* =================================================
                ITEMS
            ================================================== */}

            <section className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">

              <div className="flex items-center justify-between mb-4">

                <div>

                  <h2 className="font-bold text-[17px]">
                    Item Entry
                  </h2>

                  <p className="text-xs text-slate-500 mt-1">
                    Type product name and press Enter.
                  </p>

                </div>

                <button
                  type="button"
                  onClick={
                    addLine
                  }
                  className="bg-[#079b89] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#078877]"
                >
                  <Plus
                    size={16}
                    className="inline mr-1"
                  />

                  Add Line
                </button>

              </div>

              {/* TABLE */}

              <div className="border border-slate-200 rounded-lg overflow-visible">

                <div className="grid grid-cols-[45px_minmax(260px,1fr)_105px_125px_135px_45px] bg-[#f0f5f6] border-b border-slate-200 h-11 items-center text-xs font-bold text-slate-600">

                  <div className="text-center">
                    #
                  </div>

                  <div className="px-3">
                    Product
                  </div>

                  <div className="text-center">
                    Qty
                  </div>

                  <div className="text-center">
                    Rate (₹)
                  </div>

                  <div className="text-right px-3">
                    Amount (₹)
                  </div>

                  <div />

                </div>

                {rows.map(
                  (
                    row,
                    index
                  ) => {

                    const quantity =
                      Number(
                        row.quantity
                      ) || 0;

                    const rate =
                      Number(
                        row.unit_price
                      ) || 0;

                    const amount =
                      quantity *
                      rate;

                    return (
                      <div
                        key={
                          row.id ??
                          `new-${index}`
                        }
                        className={`grid grid-cols-[45px_minmax(260px,1fr)_105px_125px_135px_45px] min-h-[58px] border-b border-slate-100 items-center ${
                          activeProductRow ===
                          index
                            ? "bg-[#fffdf0]"
                            : ""
                        }`}
                      >

                        {/* NUMBER */}

                        <div className="text-center text-sm text-slate-500">
                          {index + 1}
                        </div>

                        {/* PRODUCT */}

                        <div className="relative px-1">

                          <div className="relative">

                            <Search
                              size={15}
                              className="absolute left-3 top-[13px] text-slate-400"
                            />

                            <input
                              ref={(
                                element
                              ) => {
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

                                setProductSearch(
                                  row.product_name
                                );

                                if (
                                  row.product_id ===
                                  ""
                                ) {
                                  setShowProductSearch(
                                    true
                                  );
                                } else {
                                  setShowProductSearch(
                                    false
                                  );
                                }

                              }}
                              onKeyDown={(
                                e
                              ) =>
                                handleProductKeyDown(
                                  e,
                                  index
                                )
                              }
                              className="w-full h-10 border border-slate-300 rounded-md pl-9 pr-3 text-sm outline-none focus:border-[#079b89] focus:ring-1 focus:ring-[#079b89]/20"
                            />

                          </div>

                          {/* SEARCH RESULTS */}

                          {showProductSearch &&
                            activeProductRow ===
                              index && (

                              <div className="absolute left-1 right-1 top-[46px] bg-white border border-slate-300 rounded-lg shadow-xl z-50 overflow-hidden">

                                <div className="px-3 py-2 bg-slate-50 text-[11px] text-slate-500 border-b">

                                  Product Search

                                  <span className="float-right">
                                    ↑ ↓ Enter
                                  </span>

                                </div>

                                {filteredProducts.length ===
                                0 ? (

                                  <div className="px-4 py-4 text-sm text-slate-500">
                                    No product found
                                  </div>

                                ) : (

                                  filteredProducts.map(
                                    (
                                      product,
                                      productIndex
                                    ) => (

                                      <button
                                        type="button"
                                        key={
                                          product.id
                                        }
                                        onMouseDown={(
                                          e
                                        ) => {

                                          e.preventDefault();

                                          selectProduct(
                                            index,
                                            product
                                          );

                                        }}
                                        className={`w-full text-left px-3 py-2.5 border-b last:border-0 ${
                                          highlightedProduct ===
                                          productIndex
                                            ? "bg-[#e6f7f4]"
                                            : "hover:bg-slate-50"
                                        }`}
                                      >

                                        <div className="flex justify-between">

                                          <span className="font-semibold text-sm">
                                            {
                                              product.name
                                            }
                                          </span>

                                          {product.code && (
                                            <span className="text-xs text-slate-400">
                                              {
                                                product.code
                                              }
                                            </span>
                                          )}

                                        </div>

                                        <div className="flex gap-4 text-[11px] text-slate-500 mt-1">

                                          <span>
                                            Unit:{" "}
                                            {product.unit ||
                                              "-"}
                                          </span>

                                          <span>
                                            Rate: ₹
                                            {product.sellingPrice !=
                                            null
                                              ? money(
                                                  product.sellingPrice
                                                )
                                              : "0.00"}
                                          </span>

                                          {product.stock !=
                                            null && (
                                            <span>
                                              Stock:{" "}
                                              {
                                                product.stock
                                              }
                                            </span>
                                          )}

                                        </div>

                                      </button>

                                    )
                                  )

                                )}

                              </div>

                            )}

                        </div>

                        {/* QUANTITY */}

                        <div className="px-1">

                          <input
                            ref={(
                              element
                            ) => {
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
                            onChange={(
                              e
                            ) =>
                              updateRow(
                                index,
                                "quantity",
                                e.target.value
                              )
                            }
                            onKeyDown={(
                              e
                            ) =>
                              handleQuantityKeyDown(
                                e,
                                index
                              )
                            }
                            className="w-full h-10 border border-slate-300 rounded-md px-2 text-right outline-none focus:border-[#079b89]"
                          />

                        </div>

                        {/* RATE */}

                        <div className="px-1">

                          <input
                            ref={(
                              element
                            ) => {
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
                            onChange={(
                              e
                            ) =>
                              updateRow(
                                index,
                                "unit_price",
                                e.target.value
                              )
                            }
                            onKeyDown={(
                              e
                            ) =>
                              handleRateKeyDown(
                                e,
                                index
                              )
                            }
                            className="w-full h-10 border border-slate-300 rounded-md px-2 text-right outline-none focus:border-[#079b89]"
                          />

                        </div>

                        {/* AMOUNT */}

                        <div className="text-right px-3 font-bold text-sm">
                          {money(
                            amount
                          )}
                        </div>

                        {/* DELETE */}

                        <button
                          type="button"
                          onClick={() =>
                            deleteLine(
                              index
                            )
                          }
                          className="mx-auto w-8 h-8 rounded-md bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center"
                        >
                          <Trash2
                            size={15}
                          />
                        </button>

                      </div>
                    );
                  }
                )}

              </div>

            </section>

            {/* =================================================
                RIGHT SIDE
            ================================================== */}

            <div className="space-y-5">

              {/* CUSTOMER */}

              {/* CUSTOMER */}
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
                Current customer
            </p>
        </div>

    </div>

    {/* Customer Name */}
    <div className="font-bold text-slate-900">
        {selectedCustomer?.name ||
            "Walk-in Customer"}
    </div>

    {/* Phone */}
    {selectedCustomer?.phone && (
        <div className="text-sm text-slate-500 mt-2">
            {selectedCustomer.phone}
        </div>
    )}

    {/* Address */}
    {selectedCustomer?.address && (
        <div className="text-sm text-slate-500 mt-2">
            {selectedCustomer.address}
        </div>
    )}

    {/* Customer Balance */}
    {selectedCustomer && (
        <div className="mt-4 rounded-lg border border-orange-200 bg-orange-50 p-3">

            <div className="flex items-center justify-between">

                <span className="text-sm font-medium text-slate-600">
                    Current Balance
                </span>

                <span
                    className={`text-lg font-bold ${
                        Number(
                            selectedCustomer.current_balance ?? 0
                        ) > 0
                            ? "text-orange-600"
                            : "text-green-600"
                    }`}
                >
                    ₹
                    {Number(
                        selectedCustomer.current_balance ?? 0
                    ).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    })}
                </span>

            </div>

            {/* Opening balance remaining */}
            <div className="mt-2 flex items-center justify-between">

                <span className="text-xs text-slate-500">
                    Opening Balance Remaining
                </span>

                <span className="text-xs font-semibold text-slate-700">
                    ₹
                    {Number(
                        selectedCustomer.opening_balance_remaining ?? 0
                    ).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                    })}
                </span>

            </div>

        </div>
    )}

    {/* Walk-in */}
    {!selectedCustomer && (
        <div className="mt-2 text-xs text-slate-400">
            No customer account selected.
        </div>
    )}

</section>

              {/* SUMMARY */}

              <section className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">

                <h2 className="font-bold mb-5">
                  Voucher Summary
                </h2>

                <SummaryRow
                  label="Sub Total"
                  value={`₹${money(
                    subtotal
                  )}`}
                />

                <div className="flex items-center justify-between py-3 border-b border-slate-200">

                  <span className="text-sm text-slate-600">
                    Discount (%)
                  </span>

                  <div className="flex gap-3 items-center">

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
                      className="w-[75px] h-9 border border-slate-300 rounded-md px-2 text-right outline-none focus:border-[#079b89]"
                    />

                    <span className="w-[80px] text-right text-sm">
                      ₹
                      {money(
                        discountAmount
                      )}
                    </span>

                  </div>

                </div>

                <div className="flex justify-between py-4 text-[17px] font-bold border-b border-slate-200">

                  <span>
                    Total Amount
                  </span>

                  <span>
                    ₹
                    {money(
                      totalAmount
                    )}
                  </span>

                </div>

                <div className="flex items-center justify-between py-4 border-b border-slate-200">

                  <span className="text-sm text-slate-600">
                    Paid Amount
                  </span>

                  <input
                    ref={
                      paidRef
                    }
                    type="number"
                    min="0"
                    step="0.01"
                    value={
                      paidAmount
                    }
                    onChange={(e) =>
                      setPaidAmount(
                        e.target.value
                      )
                    }
                    className="w-[100px] h-9 border border-slate-300 rounded-md px-2 text-right outline-none focus:border-[#079b89]"
                  />

                </div>

                <div className="mt-3 bg-orange-50 rounded-lg px-3 py-3 flex justify-between">

                  <span className="font-bold">
                    Balance Amount
                  </span>

                  <span className="font-bold text-orange-600 text-[18px]">
                    ₹
                    {money(
                      balanceAmount
                    )}
                  </span>

                </div>

              </section>

              {/* NOTES */}

              <section className="bg-white border border-slate-200 rounded-xl shadow-sm p-5">

                <h2 className="font-bold mb-3">
                  Narration
                </h2>

                <textarea
                  value={
                    notes
                  }
                  onChange={(e) =>
                    setNotes(
                      e.target.value
                    )
                  }
                  rows={4}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 resize-none outline-none focus:border-[#079b89]"
                />

              </section>

            </div>

          </div>

        </main>

      </div>

      {/* ======================================================
          BOTTOM BAR
      ======================================================= */}

      <footer className="fixed bottom-0 left-[250px] right-0 h-[58px] bg-white border-t border-slate-200 flex items-center px-7 z-40">

        <div className="flex items-center gap-4 text-xs text-slate-500">

          <Keyboard size={17} />

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
            label="Update"
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

        <div className="ml-auto flex gap-3">

          <button
            type="button"
            onClick={() =>
              router.push(
                `/sales/${saleId}`
              )
            }
            className="h-10 px-6 rounded-lg border border-slate-300 bg-white font-semibold"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={
              saving
            }
            onClick={
              handleUpdate
            }
            className="h-10 px-7 rounded-lg bg-[#079b89] text-white font-bold disabled:opacity-50 hover:bg-[#078877]"
          >

            <Save
              size={15}
              className="inline mr-2"
            />

            {saving
              ? "Updating..."
              : "Update Sale"}

          </button>

        </div>

      </footer>

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

      <label className="block text-sm font-medium text-slate-700 mb-2">

        {label}

        {required && (
          <span className="text-red-500 ml-1">
            *
          </span>
        )}

      </label>

      {children}

    </div>
  );
}

/* ============================================================
   SIDEBAR
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
      onClick={
        onClick
      }
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
    <div className="flex justify-between py-3 border-b border-slate-200">

      <span className="text-sm text-slate-600">
        {label}
      </span>

      <span className="font-semibold">
        {value}
      </span>

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

      <span className="border border-slate-300 bg-slate-50 rounded px-2 py-1 font-semibold text-[11px]">
        {keyName}
      </span>

      <span>
        {label}
      </span>

    </div>
  );
}

/* ============================================================
   FILE ICON
============================================================ */

function FileIcon() {
  return (
    <div className="w-9 h-9 rounded-lg bg-emerald-50 text-[#079b89] flex items-center justify-center">
      <Edit3 size={18} />
    </div>
  );
}