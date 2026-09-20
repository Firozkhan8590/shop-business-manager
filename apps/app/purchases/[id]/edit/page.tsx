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
  Edit3,
  Keyboard,
  Plus,
  Save,
  Search,
  ShoppingCart,
  Trash2,
  X,
} from "lucide-react";

import Sidebar from "../../../components/Sidebar";

import {
  getProducts,
  Product,
} from "@/src/lib/products";



import {
  getSupplier,
  getSuppliers,
  Supplier,
} from "@/src/lib/supplier";
import { getPurchase, PurchaseDetails, updatePurchase, UpdatePurchaseInput } from "@/src/lib/purchase";

/* ============================================================
   TYPES
============================================================ */

interface PurchaseRow {
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

const emptyRow = (): PurchaseRow => ({
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

export default function EditPurchasePage() {
  const router = useRouter();
  const params = useParams();

  const purchaseId = Number(params.id);

  /* ==========================================================
     PURCHASE
  ========================================================== */

  const [purchase, setPurchase] =
    useState<PurchaseDetails | null>(
      null
    );

  /* ==========================================================
     SUPPLIER
  ========================================================== */

  const [suppliers, setSuppliers] =
    useState<Supplier[]>([]);

  const [selectedSupplier, setSelectedSupplier] =
    useState<Supplier | null>(null);

  const [supplierId, setSupplierId] =
    useState<number | "">("");

  const [supplierSearch, setSupplierSearch] =
    useState("");

  const [showSupplierSearch, setShowSupplierSearch] =
    useState(false);

  const [highlightedSupplier, setHighlightedSupplier] =
    useState(0);

  /* ==========================================================
     PRODUCTS
  ========================================================== */

  const [products, setProducts] =
    useState<ProductInfo[]>([]);

  /* ==========================================================
     VOUCHER
  ========================================================== */

  const [purchaseNumber, setPurchaseNumber] =
    useState("");

  const [purchaseDate, setPurchaseDate] =
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
    useState<PurchaseRow[]>([]);

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

  const supplierInputRef =
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
     LOAD PURCHASE
  ========================================================== */

  useEffect(() => {
    if (
      !purchaseId ||
      Number.isNaN(purchaseId)
    ) {
      setError(
        "Invalid purchase ID"
      );
      setLoading(false);
      return;
    }

    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const [
          purchaseData,
          supplierData,
          productData,
        ] = await Promise.all([
          getPurchase(purchaseId),
          getSuppliers(),
          getProducts(),
        ]);

        if (!purchaseData) {
          throw new Error(
            "Purchase not found"
          );
        }

        setPurchase(
          purchaseData
        );

        setSuppliers(
          supplierData.filter(
            (supplier) =>
              supplier.is_active ||
              Number(
                supplier.id
              ) ===
                Number(
                  purchaseData.supplier_id
                )
          )
        );

        const normalizedProducts =
          productData.map(
            normalizeProduct
          );

        setProducts(
          normalizedProducts
        );

        /* ------------------------------------------------------
           PURCHASE HEADER
        ------------------------------------------------------ */

        setPurchaseNumber(
          purchaseData.purchase_number
        );

        /* ------------------------------------------------------
           PURCHASE DATE
        ------------------------------------------------------ */

        const rawPurchaseDate =
          purchaseData.purchase_date;

        let formattedPurchaseDate =
          "";

        if (rawPurchaseDate) {
          if (
            /^\d{4}-\d{2}-\d{2}$/.test(
              rawPurchaseDate
            )
          ) {
            formattedPurchaseDate =
              rawPurchaseDate;
          } else {
            const date =
              new Date(
                rawPurchaseDate
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

              formattedPurchaseDate =
                `${year}-${month}-${day}`;
            }
          }
        }

        setPurchaseDate(
          formattedPurchaseDate
        );

        /* ------------------------------------------------------
           SUPPLIER ID
        ------------------------------------------------------ */

        const existingSupplierId =
          purchaseData.supplier_id !=
          null
            ? Number(
                purchaseData.supplier_id
              )
            : "";

        setSupplierId(
          existingSupplierId
        );

        /* ------------------------------------------------------
           LOAD EXACT SUPPLIER
        ------------------------------------------------------ */

        if (
          existingSupplierId !== ""
        ) {
          try {
            const exactSupplier =
              await getSupplier(
                Number(
                  existingSupplierId
                )
              );

            if (exactSupplier) {
              setSelectedSupplier(
                exactSupplier
              );

              setSupplierSearch(
                exactSupplier.name
              );
            } else {
              const fallback =
                supplierData.find(
                  (supplier) =>
                    Number(
                      supplier.id
                    ) ===
                    Number(
                      existingSupplierId
                    )
                );

              if (fallback) {
                setSelectedSupplier(
                  fallback
                );

                setSupplierSearch(
                  fallback.name
                );
              }
            }
          } catch {
            const fallback =
              supplierData.find(
                (supplier) =>
                  Number(
                    supplier.id
                  ) ===
                  Number(
                    existingSupplierId
                  )
              );

            if (fallback) {
              setSelectedSupplier(
                fallback
              );

              setSupplierSearch(
                fallback.name
              );
            }
          }
        }

        /* ------------------------------------------------------
           OTHER VOUCHER FIELDS
        ------------------------------------------------------ */

        setPaymentMethod(
          purchaseData.payment_method ||
            "cash"
        );

        setDiscountPercent(
          String(
            purchaseData.discount_percent ??
              0
          )
        );

        setPaidAmount(
          String(
            purchaseData.paid_amount ??
              0
          )
        );

        setNotes(
          purchaseData.notes ||
            ""
        );

        /* ------------------------------------------------------
           EXISTING ITEMS
        ------------------------------------------------------ */

        const existingRows =
          purchaseData.items.map(
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
                id: Number(
                  item.id
                ),

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
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load purchase"
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [purchaseId]);

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

  const discountAmount = useMemo(() => {
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
    Number(
      paidAmount
    ) || 0;

  const balanceAmount =
    Math.max(
      0,
      totalAmount - paid
    );

  /* ==========================================================
     SUPPLIER FILTER
  ========================================================== */

  const filteredSuppliers =
    useMemo(() => {
      if (
        !supplierSearch.trim()
      ) {
        return suppliers.slice(
          0,
          8
        );
      }

      const search =
        supplierSearch
          .toLowerCase()
          .trim();

      return suppliers
        .filter(
          (supplier) =>
            supplier.name
              .toLowerCase()
              .includes(search) ||
            supplier.phone
              ?.toLowerCase()
              .includes(search)
        )
        .slice(0, 8);
    }, [
      suppliers,
      supplierSearch,
    ]);

  /* ==========================================================
     SELECT SUPPLIER
  ========================================================== */

  const selectSupplier = (
    supplier: Supplier
  ) => {
    setSupplierId(
      Number(
        supplier.id
      )
    );

    setSelectedSupplier(
      supplier
    );

    setSupplierSearch(
      supplier.name
    );

    setShowSupplierSearch(
      false
    );

    setShowProductSearch(
      false
    );

    setHighlightedSupplier(
      0
    );
  };

  /* ==========================================================
     SUPPLIER INPUT
  ========================================================== */

  const handleSupplierInput = (
    value: string
  ) => {
    setSupplierId("");

    setSelectedSupplier(
      null
    );

    setSupplierSearch(
      value
    );

    setShowProductSearch(
      false
    );

    setShowSupplierSearch(
      true
    );

    setHighlightedSupplier(
      0
    );
  };

  /* ==========================================================
     CLEAR SUPPLIER
  ========================================================== */

  const clearSupplier = () => {
    setSupplierId("");

    setSelectedSupplier(
      null
    );

    setSupplierSearch("");

    setShowSupplierSearch(
      true
    );

    setShowProductSearch(
      false
    );

    setHighlightedSupplier(
      0
    );

    setTimeout(() => {
      supplierInputRef.current?.focus();
    }, 50);
  };

  /* ==========================================================
     SUPPLIER KEYBOARD
  ========================================================== */

  const handleSupplierKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (
      !showSupplierSearch
    ) {
      if (
        event.key ===
          "ArrowDown" ||
        event.key ===
          "Enter"
      ) {
        event.preventDefault();

        setShowProductSearch(
          false
        );

        setShowSupplierSearch(
          true
        );

        setHighlightedSupplier(
          0
        );
      }

      return;
    }

    if (
      event.key ===
      "ArrowDown"
    ) {
      event.preventDefault();

      setHighlightedSupplier(
        (current) =>
          Math.min(
            current + 1,
            Math.max(
              filteredSuppliers.length -
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

      setHighlightedSupplier(
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

      const supplier =
        filteredSuppliers[
          highlightedSupplier
        ];

      if (supplier) {
        selectSupplier(
          supplier
        );
      }

      return;
    }

    if (
      event.key ===
      "Escape"
    ) {
      event.preventDefault();

      setShowSupplierSearch(
        false
      );
    }
  };

  /* ==========================================================
     PRODUCT FILTER
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
          .toLowerCase()
          .trim();

      return products
        .filter(
          (product) =>
            product.name
              .toLowerCase()
              .includes(search) ||
            product.code
              ?.toLowerCase()
              .includes(search) ||
            product.hsn
              ?.toLowerCase()
              .includes(search)
        )
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
                  product.purchasePrice !=
                  null
                    ? String(
                        product.purchasePrice
                      )
                    : row.unit_price,
              }
            : row
      )
    );

    setShowProductSearch(
      false
    );

    setShowSupplierSearch(
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

    setShowSupplierSearch(
      false
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
    event: React.KeyboardEvent<HTMLInputElement>,
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

      setProductSearch("");
    }
  };

  /* ==========================================================
     UPDATE ROW
  ========================================================== */

  const updateRow = (
    index: number,
    field:
      | "quantity"
      | "unit_price",
    value: string
  ) => {
    setRows((current) =>
      current.map(
        (row, rowIndex) =>
          rowIndex === index
            ? {
                ...row,
                [field]:
                  value,
              }
            : row
      )
    );
  };

  /* ==========================================================
     QUANTITY KEYBOARD
  ========================================================== */

  const handleQuantityKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
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
     RATE KEYBOARD
  ========================================================== */

  const handleRateKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
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

  /* ==========================================================
     ADD LINE
  ========================================================== */

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

    if (
      activeProductRow ===
      index
    ) {
      setActiveProductRow(
        null
      );

      setShowProductSearch(
        false
      );
    }

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
    setError("");

    if (
      !purchaseNumber.trim()
    ) {
      setError(
        "Purchase number is required"
      );

      return false;
    }

    if (!purchaseDate) {
      setError(
        "Purchase date is required"
      );

      return false;
    }

    if (
      supplierId === "" ||
      !selectedSupplier
    ) {
      setError(
        "Please select a supplier"
      );

      supplierInputRef.current?.focus();

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
      if (
        !row.product_id
      ) {
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
          "Purchase price cannot be negative"
        );

        return false;
      }
    }

    const discount =
      Number(
        discountPercent
      ) || 0;

    if (
      discount < 0 ||
      discount > 100
    ) {
      setError(
        "Discount must be between 0 and 100"
      );

      return false;
    }

    if (paid < 0) {
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
     UPDATE PURCHASE
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

        const payload:
          UpdatePurchaseInput = {
          purchase_number:
            purchaseNumber.trim(),

          supplier_id:
            Number(
              supplierId
            ),

          purchase_date:
            purchaseDate,

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
            purchase?.status ||
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

        await updatePurchase(
          purchaseId,
          payload
        );

        router.push(
          `/purchases/${purchaseId}`
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to update purchase"
        );
      } finally {
        setSaving(false);
      }
    };

  /* ==========================================================
     GLOBAL KEYBOARD
  ========================================================== */

  useEffect(() => {
    const handler = (
      event: KeyboardEvent
    ) => {
      /* F4 Supplier */

      if (
        event.key ===
        "F4"
      ) {
        event.preventDefault();

        setShowProductSearch(
          false
        );

        supplierInputRef.current?.focus();

        if (
          !selectedSupplier
        ) {
          setShowSupplierSearch(
            true
          );
        }

        return;
      }

      /* F7 Product */

      if (
        event.key ===
        "F7"
      ) {
        event.preventDefault();

        setShowSupplierSearch(
          false
        );

        productInputRefs.current[
          0
        ]?.focus();

        return;
      }

      /* F9 Update */

      if (
        event.key ===
        "F9"
      ) {
        event.preventDefault();

        handleUpdate();

        return;
      }

      /* Ctrl + S */

      if (
        event.ctrlKey &&
        event.key.toLowerCase() ===
          "s"
      ) {
        event.preventDefault();

        handleUpdate();

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
          activeProductRow !==
          null
        ) {
          deleteLine(
            activeProductRow
          );
        }

        return;
      }

      /* Escape */

      if (
        event.key ===
        "Escape"
      ) {
        if (
          showProductSearch
        ) {
          setShowProductSearch(
            false
          );

          return;
        }

        if (
          showSupplierSearch
        ) {
          setShowSupplierSearch(
            false
          );

          return;
        }

        event.preventDefault();

        router.push(
          `/purchases/${purchaseId}`
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
    showSupplierSearch,
    rows,
    purchase,
    supplierId,
    selectedSupplier,
    purchaseNumber,
    purchaseDate,
    paymentMethod,
    discountPercent,
    paidAmount,
  ]);

  /* ==========================================================
     SELECTED PRODUCT
  ========================================================== */

  const selectedProduct =
    activeProductRow !== null
      ? products.find(
          (product) =>
            product.id ===
            rows[
              activeProductRow
            ]?.product_id
        )
      : rows.some(
          (row) =>
            row.product_id !==
            ""
        )
      ? products.find(
          (product) =>
            product.id ===
            Number(
              rows.find(
                (row) =>
                  row.product_id !==
                  ""
              )?.product_id
            )
        )
      : undefined;

  /* ==========================================================
     LOADING
  ========================================================== */

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Sidebar />

        <main className="ml-0 min-h-screen lg:ml-[260px]">
          <div className="flex min-h-screen items-center justify-center">

            <div className="text-center">

              <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-teal-700" />

              <p className="text-sm text-slate-500">
                Loading purchase...
              </p>

            </div>

          </div>
        </main>
      </div>
    );
  }

  /* ==========================================================
     UI
  ========================================================== */

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

              <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">

                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      `/purchases/${purchaseId}`
                    )
                  }
                  className="hover:text-teal-700"
                >
                  Purchases
                </button>

                <span>›</span>

                <span>
                  {purchaseNumber}
                </span>

                <span>›</span>

                <span>
                  Edit
                </span>

              </div>

              <div className="flex items-center gap-3">

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-700">

                  <Edit3
                    size={24}
                  />

                </div>

                <div>

                  <h1 className="text-2xl font-bold text-slate-900">
                    Edit Purchase
                  </h1>

                  <p className="mt-1 text-sm text-slate-500">
                    Modify purchase invoice details and items.
                  </p>

                </div>

              </div>

            </div>

            <button
              type="button"
              onClick={() =>
                router.push(
                  `/purchases/${purchaseId}`
                )
              }
              className="inline-flex h-10 items-center rounded-lg border border-slate-300 bg-white px-4 font-semibold text-slate-800 hover:bg-slate-50"
            >

              <ArrowLeft
                size={16}
                className="mr-2"
              />

              Back to Purchase

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
              >
                <X size={17} />
              </button>

            </div>
          )}

          {/* ==================================================
              VOUCHER DETAILS
          ================================================== */}

          <section className="mb-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="mb-5 flex items-center justify-between">

              <h2 className="text-[17px] font-bold text-slate-900">
                Voucher Details
              </h2>

              <span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs text-amber-700">
                Editing Purchase
              </span>

            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">

              {/* PURCHASE NUMBER */}

              <Field
                label="Purchase No."
                required
              >
                <input
                  value={
                    purchaseNumber
                  }
                  onChange={(e) =>
                    setPurchaseNumber(
                      e.target.value
                    )
                  }
                  className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                />
              </Field>

              {/* DATE */}

              <Field
                label="Purchase Date"
                required
              >
                <input
                  type="date"
                  value={
                    purchaseDate
                  }
                  onChange={(e) =>
                    setPurchaseDate(
                      e.target.value
                    )
                  }
                  className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                />
              </Field>

              {/* ==================================================
                  SUPPLIER SEARCH
              ================================================== */}

              <Field
                label="Supplier"
                required
              >

                <div className="relative">

                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 z-10 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    ref={
                      supplierInputRef
                    }
                    type="text"
                    value={
                      supplierSearch
                    }
                    onChange={(e) =>
                      handleSupplierInput(
                        e.target.value
                      )
                    }
                    onFocus={() => {
                      setShowProductSearch(
                        false
                      );

                      if (
                        !selectedSupplier
                      ) {
                        setShowSupplierSearch(
                          true
                        );
                      }
                    }}
                    onKeyDown={
                      handleSupplierKeyDown
                    }
                    placeholder="Search supplier..."
                    className="h-10 w-full rounded-md border border-slate-300 bg-white pl-9 pr-9 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                  />

                  {selectedSupplier && (
                    <button
                      type="button"
                      onMouseDown={(
                        event
                      ) => {
                        event.preventDefault();
                        event.stopPropagation();

                        clearSupplier();
                      }}
                      className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 hover:bg-red-50 hover:text-red-500"
                      title="Change supplier"
                    >
                      <X
                        size={14}
                      />
                    </button>
                  )}

                  {/* SUPPLIER DROPDOWN */}

                  {showSupplierSearch &&
                    !selectedSupplier && (
                      <div className="absolute left-0 right-0 top-[46px] z-[9999] overflow-hidden rounded-lg border border-slate-300 bg-white text-slate-900 shadow-2xl">

                        <div className="border-b bg-slate-50 px-3 py-2 text-[11px] text-slate-500">

                          Supplier Search

                          <span className="float-right">
                            ↑ ↓ Enter
                          </span>

                        </div>

                        {filteredSuppliers.length ===
                        0 ? (
                          <div className="px-4 py-5 text-center text-sm text-slate-500">
                            No suppliers found
                          </div>
                        ) : (
                          filteredSuppliers.map(
                            (
                              supplier,
                              index
                            ) => (
                              <button
                                type="button"
                                key={
                                  supplier.id
                                }
                                onMouseDown={(
                                  event
                                ) => {
                                  event.preventDefault();
                                  event.stopPropagation();

                                  selectSupplier(
                                    supplier
                                  );
                                }}
                                className={`block w-full border-b border-slate-200 px-3 py-3 text-left last:border-0 hover:bg-teal-50 ${
                                  index ===
                                  highlightedSupplier
                                    ? "bg-teal-50"
                                    : "bg-white"
                                }`}
                              >

                                <div className="flex items-center justify-between">

                                  <span className="text-sm font-semibold text-slate-900">
                                    {
                                      supplier.name
                                    }
                                  </span>

                                  <span className="text-xs text-slate-400">
                                    #
                                    {
                                      supplier.id
                                    }
                                  </span>

                                </div>

                                <div className="mt-1 text-xs text-slate-500">
                                  {
                                    supplier.phone ||
                                    "No phone"
                                  }
                                </div>

                                <div className="mt-1 text-xs font-semibold text-orange-600">
                                  Balance: ₹
                                  {Number(
                                    supplier.current_balance ??
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
                  className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
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

                  <option value="card">
                    Card
                  </option>

                  <option value="credit">
                    Credit
                  </option>
                </select>

              </Field>

            </div>

          </section>

          {/* ==================================================
              CONTENT
          ================================================== */}

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">

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
                    Search products and edit quantity and purchase price.
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

              <div className="grid grid-cols-[minmax(260px,1fr)_120px_150px_150px_60px] border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700">

                <div className="px-3 py-3">
                  Product
                </div>

                <div className="px-3 py-3 text-right">
                  Qty
                </div>

                <div className="px-3 py-3 text-right">
                  Purchase Price
                </div>

                <div className="px-3 py-3 text-right">
                  Amount
                </div>

                <div className="px-3 py-3 text-center">
                  Delete
                </div>

              </div>

              {/* ROWS */}

              {rows.map(
                (
                  row,
                  index
                ) => {
                  const amount =
                    (Number(
                      row.quantity
                    ) || 0) *
                    (Number(
                      row.unit_price
                    ) || 0);

                  return (
                    <div
                      key={
                        row.id ??
                        `new-${index}`
                      }
                      className="grid grid-cols-[minmax(260px,1fr)_120px_150px_150px_60px] items-center border-b border-slate-100"
                    >

                      {/* PRODUCT */}

                      <div className="relative px-2 py-2">

                        <div className="relative">

                          <Search
                            size={15}
                            className="absolute left-3 top-3 text-slate-400"
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
                                e.target
                                  .value
                              )
                            }
                            onFocus={() => {
                              setActiveProductRow(
                                index
                              );

                              setShowSupplierSearch(
                                false
                              );

                              setShowProductSearch(
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
                            className="h-10 w-full rounded-md border border-slate-300 bg-white pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                          />

                        </div>

                        {/* PRODUCT SEARCH */}

                        {showProductSearch &&
                          activeProductRow ===
                            index && (
                            <div className="absolute left-2 right-2 top-[54px] z-[999] overflow-hidden rounded-lg border border-slate-300 bg-white shadow-xl">

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
                                  ) => (
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

                                      <div className="flex justify-between">

                                        <span className="text-sm font-semibold text-slate-900">
                                          {
                                            product.name
                                          }
                                        </span>

                                        <span className="text-sm font-semibold text-slate-900">
                                          {product.purchasePrice !=
                                          null
                                            ? `₹${money(
                                                product.purchasePrice
                                              )}`
                                            : "-"}
                                        </span>

                                      </div>

                                      <div className="mt-1 text-xs text-slate-500">

                                        {product.code ||
                                          "No code"}

                                        {" • "}

                                        HSN:{" "}
                                        {product.hsn ||
                                          "-"}

                                        {" • "}

                                        Stock:{" "}
                                        {product.stock !=
                                        null
                                          ? product.stock
                                          : "-"}

                                      </div>

                                    </button>
                                  )
                                )
                              )}

                            </div>
                          )}

                      </div>

                      {/* QUANTITY */}

                      <div className="px-2 py-2">

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
                              e.target
                                .value
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
                          className="h-10 w-full rounded-md border border-slate-300 bg-white px-2 text-right text-sm text-slate-900 outline-none focus:border-teal-600"
                        />

                      </div>

                      {/* PURCHASE PRICE */}

                      <div className="px-2 py-2">

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
                              e.target
                                .value
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
                          className="h-10 w-full rounded-md border border-slate-300 bg-white px-2 text-right text-sm text-slate-900 outline-none focus:border-teal-600"
                        />

                      </div>

                      {/* AMOUNT */}

                      <div className="px-3 text-right text-sm font-semibold text-slate-900">
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
                        className="mx-auto flex h-8 w-8 items-center justify-center rounded-md bg-red-50 text-red-500 hover:bg-red-100"
                      >

                        <Trash2
                          size={15}
                        />

                      </button>

                    </div>
                  );
                }
              )}

              <div className="flex h-14 items-center justify-center text-xs text-slate-400">
                Press Enter after Purchase Price to move to the next line
              </div>

              {/* NARRATION */}

              <div className="border-t border-slate-200 p-5">

                <label className="mb-2 block text-sm font-semibold text-slate-900">
                  Narration
                </label>

                <textarea
                  value={
                    notes
                  }
                  onChange={(e) =>
                    setNotes(
                      e.target
                        .value
                    )
                  }
                  rows={3}
                  placeholder="Enter purchase notes..."
                  className="w-full resize-none rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-teal-600"
                />

              </div>

            </section>

            {/* ==================================================
                RIGHT SIDE
            ================================================== */}

            <div className="space-y-5">

              {/* ==================================================
                  SUPPLIER DETAILS
              ================================================== */}

              <section className="rounded-xl border border-slate-200 bg-white shadow-sm">

                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">

                  <h2 className="text-base font-semibold text-slate-900">
                    Supplier Details
                  </h2>

                  <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700">
                    {selectedSupplier
                      ? "Selected"
                      : "No Supplier"}
                  </span>

                </div>

                <div className="p-5">

                  {selectedSupplier ? (
                    <div className="space-y-4">

                      <div>

                        <p className="text-base font-semibold text-slate-900">
                          {
                            selectedSupplier.name
                          }
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          Supplier ID:{" "}
                          {
                            selectedSupplier.id
                          }
                        </p>

                      </div>

                      <div className="space-y-3">

                        <DetailRow
                          label="Phone"
                          value={
                            selectedSupplier.phone ||
                            "-"
                          }
                        />

                        <DetailRow
                          label="Address"
                          value={
                            selectedSupplier.address ||
                            "-"
                          }
                        />

                        <DetailRow
                          label="Opening Balance"
                          value={`₹${money(
                            Number(
                              selectedSupplier.opening_balance ??
                                0
                            )
                          )}`}
                        />

                        <DetailRow
                          label="Opening Balance Remaining"
                          value={`₹${money(
                            Number(
                              selectedSupplier.opening_balance_remaining ??
                                0
                            )
                          )}`}
                        />

                        <DetailRow
                          label="Purchase Outstanding"
                          value={`₹${money(
                            Number(
                              selectedSupplier.purchases_outstanding ??
                                0
                            )
                          )}`}
                        />

                        <div className="mt-3 rounded-lg border border-orange-200 bg-orange-50 px-3 py-3">

                          <div className="flex items-center justify-between">

                            <span className="text-sm font-medium text-slate-600">
                              Current Balance
                            </span>

                            <span
                              className={`text-lg font-bold ${
                                Number(
                                  selectedSupplier.current_balance ??
                                    0
                                ) > 0
                                  ? "text-orange-600"
                                  : "text-green-600"
                              }`}
                            >
                              ₹
                              {money(
                                Number(
                                  selectedSupplier.current_balance ??
                                    0
                                )
                              )}
                            </span>

                          </div>

                        </div>

                      </div>

                    </div>
                  ) : (
                    <div className="flex min-h-[190px] flex-col items-center justify-center text-center">

                      <Search
                        size={30}
                        className="mb-3 text-slate-300"
                      />

                      <p className="text-sm font-medium text-slate-600">
                        Select a supplier
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        Supplier balance details will appear here.
                      </p>

                    </div>
                  )}

                </div>

              </section>

              {/* ==================================================
                  PRODUCT DETAILS
              ================================================== */}

              <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

                <div className="mb-5 flex items-center justify-between">

                  <h2 className="font-bold text-slate-900">
                    Product Details
                  </h2>

                  <span className="rounded-full bg-teal-50 px-2 py-1 text-[11px] text-teal-700">
                    Auto-filled
                  </span>

                </div>

                {selectedProduct ? (
                  <div>

                    <div className="mb-4 text-[16px] font-bold text-slate-900">
                      {
                        selectedProduct.name
                      }
                    </div>

                    <DetailRow
                      label="Product Code"
                      value={
                        selectedProduct.code ||
                        "-"
                      }
                    />

                    <DetailRow
                      label="HSN"
                      value={
                        selectedProduct.hsn ||
                        "-"
                      }
                    />

                    <DetailRow
                      label="Category"
                      value={
                        selectedProduct.category ||
                        "-"
                      }
                    />

                    <DetailRow
                      label="Unit"
                      value={
                        selectedProduct.unit ||
                        "-"
                      }
                    />

                    <DetailRow
                      label="Purchase Price"
                      value={
                        selectedProduct.purchasePrice !=
                        null
                          ? `₹${money(
                              selectedProduct.purchasePrice
                            )}`
                          : "-"
                      }
                    />

                    <DetailRow
                      label="Selling Price"
                      value={
                        selectedProduct.sellingPrice !=
                        null
                          ? `₹${money(
                              selectedProduct.sellingPrice
                            )}`
                          : "-"
                      }
                    />

                    <DetailRow
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
                  <div className="py-10 text-center text-sm text-slate-500">

                    <Search
                      size={30}
                      className="mx-auto mb-3 opacity-40"
                    />

                    <p className="text-slate-600">
                      Select a product.
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Product details will appear here automatically.
                    </p>

                  </div>
                )}

              </section>

              {/* ==================================================
                  SUMMARY
              ================================================== */}

              <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

                <h2 className="mb-5 font-bold text-slate-900">
                  Voucher Summary
                </h2>

                <SummaryRow
                  label="Sub Total"
                  value={`₹${money(
                    subtotal
                  )}`}
                />

                <div className="flex items-center justify-between border-b border-slate-200 py-3">

                  <span className="text-sm text-slate-600">
                    Discount (%)
                  </span>

                  <div className="flex items-center gap-3">

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
                          e.target
                            .value
                        )
                      }
                      className="h-9 w-20 rounded-md border border-slate-300 bg-white px-2 text-right text-sm text-slate-900 outline-none focus:border-teal-600"
                    />

                    <span className="text-sm text-slate-600">
                      ₹
                      {money(
                        discountAmount
                      )}
                    </span>

                  </div>

                </div>

                <SummaryRow
                  label="Total"
                  value={`₹${money(
                    totalAmount
                  )}`}
                />

                <div className="flex items-center justify-between border-b border-slate-200 py-3">

                  <span className="text-sm text-slate-600">
                    Paid
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
                        e.target
                          .value
                      )
                    }
                    className="h-9 w-32 rounded-md border border-slate-300 bg-white px-2 text-right text-sm text-slate-900 outline-none focus:border-teal-600"
                  />

                </div>

                <div className="flex justify-between py-4">

                  <span className="font-bold text-slate-900">
                    Balance
                  </span>

                  <span className="font-bold text-red-600">
                    ₹
                    {money(
                      balanceAmount
                    )}
                  </span>

                </div>

              </section>

            </div>

          </div>

          {/* ==================================================
              SHORTCUTS
          ================================================== */}

          <div className="mt-5">

            <div className="flex flex-wrap items-center gap-5 rounded-xl border border-slate-200 bg-white px-5 py-3 text-xs text-slate-600 shadow-sm">

              <div className="flex items-center gap-2 font-semibold">

                <Keyboard
                  size={15}
                />

                Shortcuts

              </div>

              <Shortcut
                keyName="F4"
                label="Supplier"
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
                keyName="Ctrl + S"
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
                label="Back"
              />

            </div>

          </div>

          {/* ==================================================
              FOOTER
          ================================================== */}

          <div className="mt-5 flex items-center justify-end gap-3 border-t border-slate-200 bg-white py-4">

            <button
              type="button"
              onClick={() =>
                router.push(
                  `/purchases/${purchaseId}`
                )
              }
              className="h-10 rounded-lg border border-slate-300 px-5 font-semibold text-slate-800 hover:bg-slate-50"
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
              className="inline-flex h-10 items-center rounded-lg bg-teal-700 px-5 font-semibold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
            >

              <Save
                size={16}
                className="mr-2"
              />

              {saving
                ? "Updating..."
                : "Update Purchase"}

            </button>

          </div>

        </div>

      </main>

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
   DETAIL ROW
============================================================ */

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex justify-between border-b border-slate-100 py-2 text-sm">

      <span className="text-slate-500">
        {label}
      </span>

      <span className="max-w-[180px] truncate text-right font-medium text-slate-900">
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
    <div className="flex justify-between border-b border-slate-200 py-3">

      <span className="text-sm text-slate-600">
        {label}
      </span>

      <span className="font-semibold text-slate-900">
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

      <span className="rounded border border-slate-300 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-700">
        {keyName}
      </span>

      <span>
        {label}
      </span>

    </div>
  );
}