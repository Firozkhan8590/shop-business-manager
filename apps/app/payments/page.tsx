"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  CalendarDays,
  CreditCard,
  FileText,
  IndianRupee,
  Plus,
  RefreshCw,
  Search,
  Truck,
  Users,
  Wallet,
} from "lucide-react";



import {
  createCustomerPayment,
  createSupplierPayment,
  getPayments,
  type Payment,
} from "@/src/lib/payment";

import {
  getCustomers,
  type Customer,
} from "@/src/lib/customer";

import {
  getSuppliers,
  type Supplier,
} from "@/src/lib/supplier";

import {
  getSales,
  type Sale,
} from "@/src/lib/sales";

import {
  getPurchases,
  type Purchase,
} from "@/src/lib/purchase";
import Sidebar from "../components/Sidebar";


/* =========================================================
   TYPES
========================================================= */

type PaymentType =
  | "customer"
  | "supplier";

type DateFilter =
  | "today"
  | "all"
  | "custom";


/* =========================================================
   HELPERS
========================================================= */

function getTodayDate(): string {
  const now = new Date();

  const year = now.getFullYear();

  const month = String(
    now.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    now.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}


function formatDate(
  date: string
): string {
  if (!date) return "-";

  const parts = date.split("-");

  if (parts.length === 3) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }

  return new Date(
    date
  ).toLocaleDateString("en-IN");
}


function formatCurrency(
  value: string | number
): string {
  const amount =
    Number(value) || 0;

  return `₹${amount.toLocaleString(
    "en-IN",
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  )}`;
}


/* =========================================================
   PAGE
========================================================= */

export default function PaymentsPage() {

  /* =======================================================
     DATE FILTER
  ======================================================= */

  const [dateFilter, setDateFilter] =
    useState<DateFilter>("today");

  const [customDate, setCustomDate] =
    useState<string>(
      getTodayDate()
    );


  /* =======================================================
     PAYMENT TYPE
  ======================================================= */

  const [paymentType, setPaymentType] =
    useState<PaymentType>("customer");


  /* =======================================================
     DATA
  ======================================================= */

  const [payments, setPayments] =
    useState<Payment[]>([]);

  const [customers, setCustomers] =
    useState<Customer[]>([]);

  const [suppliers, setSuppliers] =
    useState<Supplier[]>([]);

  const [sales, setSales] =
    useState<Sale[]>([]);

  const [purchases, setPurchases] =
    useState<Purchase[]>([]);


  /* =======================================================
     FORM
  ======================================================= */

  const [customerId, setCustomerId] =
    useState<string>("");

  const [saleId, setSaleId] =
    useState<string>("");

  const [supplierId, setSupplierId] =
    useState<string>("");

  const [purchaseId, setPurchaseId] =
    useState<string>("");

  const [paymentDate, setPaymentDate] =
    useState<string>(
      getTodayDate()
    );

  const [amount, setAmount] =
    useState<string>("");

  const [paymentMethod, setPaymentMethod] =
    useState<string>("cash");

  const [referenceNumber, setReferenceNumber] =
    useState<string>("");

  const [notes, setNotes] =
    useState<string>("");


  /* =======================================================
     UI STATE
  ======================================================= */

  const [loading, setLoading] =
    useState<boolean>(true);

  const [submitting, setSubmitting] =
    useState<boolean>(false);

  const [error, setError] =
    useState<string>("");

  const [successMessage, setSuccessMessage] =
    useState<string>("");

  const [search, setSearch] =
    useState<string>("");


  /* =======================================================
     ACTIVE DATE
  ======================================================= */

  const activeDate = useMemo(() => {

    if (
      dateFilter === "today"
    ) {
      return getTodayDate();
    }

    if (
      dateFilter === "custom"
    ) {
      return customDate;
    }

    return undefined;

  }, [
    dateFilter,
    customDate,
  ]);


  /* =======================================================
     LOAD PAYMENTS
  ======================================================= */

  const loadPayments =
    useCallback(async () => {

      try {

        setLoading(true);
        setError("");

        const data =
          await getPayments(
            activeDate
          );

        setPayments(data);

      } catch (err: any) {

        setError(
          err?.message ||
            "Failed to load payments"
        );

      } finally {

        setLoading(false);

      }

    }, [activeDate]);


  /* =======================================================
     LOAD MASTER DATA
  ======================================================= */

  const loadMasterData =
    useCallback(async () => {

      try {

        const [
          customerData,
          supplierData,
          salesData,
          purchaseData,
        ] = await Promise.all([
          getCustomers(),
          getSuppliers(),
          getSales(),
          getPurchases(),
        ]);

        setCustomers(
          customerData.filter(
            (customer) =>
              customer.is_active
          )
        );

        setSuppliers(
          supplierData.filter(
            (supplier) =>
              supplier.is_active
          )
        );

        setSales(
          salesData
        );

        setPurchases(
          purchaseData
        );

      } catch (err: any) {

        setError(
          err?.message ||
            "Failed to load payment data"
        );

      }

    }, []);


  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    loadMasterData();
  }, [loadMasterData]);


  useEffect(() => {
    loadPayments();
  }, [loadPayments]);


  /* =======================================================
     MIDNIGHT REFRESH
  ======================================================= */

  useEffect(() => {

    const interval =
      setInterval(() => {

        const today =
          getTodayDate();

        setPaymentDate(today);

        if (
          dateFilter === "today"
        ) {
          loadPayments();
        }

      }, 60 * 1000);

    return () =>
      clearInterval(interval);

  }, [
    dateFilter,
    loadPayments,
  ]);


  /* =======================================================
     RESET FORM
  ======================================================= */

  const resetForm = () => {

    setCustomerId("");
    setSaleId("");

    setSupplierId("");
    setPurchaseId("");

    setPaymentDate(
      getTodayDate()
    );

    setAmount("");
    setPaymentMethod("cash");
    setReferenceNumber("");
    setNotes("");

    setError("");
    setSuccessMessage("");
  };


  /* =======================================================
     PAYMENT TYPE CHANGE
  ======================================================= */

  const handlePaymentTypeChange = (
    type: PaymentType
  ) => {

    setPaymentType(type);

    setCustomerId("");
    setSaleId("");

    setSupplierId("");
    setPurchaseId("");

    setAmount("");
    setReferenceNumber("");
    setNotes("");

    setError("");
    setSuccessMessage("");
  };


  /* =======================================================
     CUSTOMER SALES
  ======================================================= */

  const customerSales =
    useMemo(() => {

      if (!customerId) {
        return [];
      }

      return sales.filter(
        (sale) =>
          Number(
            sale.customer_id
          ) ===
            Number(customerId) &&
          Number(
            sale.balance_amount
          ) > 0 &&
          sale.status !==
            "cancelled"
      );

    }, [
      customerId,
      sales,
    ]);


  /* =======================================================
     SUPPLIER PURCHASES
  ======================================================= */

  const supplierPurchases =
    useMemo(() => {

      if (!supplierId) {
        return [];
      }

      return purchases.filter(
        (purchase) =>
          Number(
            purchase.supplier_id
          ) ===
            Number(supplierId) &&
          Number(
            purchase.balance_amount
          ) > 0 &&
          purchase.status !==
            "cancelled"
      );

    }, [
      supplierId,
      purchases,
    ]);


  /* =======================================================
     SELECTED SALE
  ======================================================= */

  const selectedSale =
    useMemo(() => {

      if (!saleId) {
        return null;
      }

      return (
        sales.find(
          (sale) =>
            Number(sale.id) ===
            Number(saleId)
        ) || null
      );

    }, [
      saleId,
      sales,
    ]);


  /* =======================================================
     SELECTED PURCHASE
  ======================================================= */

  const selectedPurchase =
    useMemo(() => {

      if (!purchaseId) {
        return null;
      }

      return (
        purchases.find(
          (purchase) =>
            Number(purchase.id) ===
            Number(purchaseId)
        ) || null
      );

    }, [
      purchaseId,
      purchases,
    ]);


  /* =======================================================
     SALE CHANGE
  ======================================================= */

  const handleSaleChange = (
    value: string
  ) => {

    setSaleId(value);

    if (!value) {
      setAmount("");
      return;
    }

    const sale =
      sales.find(
        (item) =>
          Number(item.id) ===
          Number(value)
      );

    if (sale) {

      setAmount(
        Number(
          sale.balance_amount
        ).toFixed(2)
      );

    }

  };


  /* =======================================================
     PURCHASE CHANGE
  ======================================================= */

  const handlePurchaseChange = (
    value: string
  ) => {

    setPurchaseId(value);

    if (!value) {
      setAmount("");
      return;
    }

    const purchase =
      purchases.find(
        (item) =>
          Number(item.id) ===
          Number(value)
      );

    if (purchase) {

      setAmount(
        Number(
          purchase.balance_amount
        ).toFixed(2)
      );

    }

  };


  /* =======================================================
     SUBMIT PAYMENT
  ======================================================= */

  const handleSubmit = async (
    e: React.FormEvent
  ) => {

    e.preventDefault();

    try {

      setSubmitting(true);
      setError("");
      setSuccessMessage("");

      const paymentAmount =
        Number(amount);

      if (
        !paymentAmount ||
        paymentAmount <= 0
      ) {
        throw new Error(
          "Payment amount must be greater than zero"
        );
      }


      /* -----------------------------------------------
         CUSTOMER PAYMENT
      ----------------------------------------------- */

      if (
        paymentType ===
        "customer"
      ) {

        if (!customerId) {
          throw new Error(
            "Please select a customer"
          );
        }

        if (
          selectedSale &&
          paymentAmount >
            Number(
              selectedSale.balance_amount
            )
        ) {
          throw new Error(
            "Payment amount cannot exceed outstanding balance"
          );
        }

        await createCustomerPayment({

          customerId:
            Number(customerId),

          saleId:
            saleId
              ? Number(saleId)
              : null,

          paymentDate,

          amount:
            paymentAmount,

          paymentMethod,

          referenceNumber:
            referenceNumber.trim() ||
            null,

          notes:
            notes.trim() ||
            null,

        });

        setSuccessMessage(
          "Customer payment recorded successfully"
        );

      }


      /* -----------------------------------------------
         SUPPLIER PAYMENT
      ----------------------------------------------- */

      else {

        if (!supplierId) {
          throw new Error(
            "Please select a supplier"
          );
        }

        if (
          selectedPurchase &&
          paymentAmount >
            Number(
              selectedPurchase.balance_amount
            )
        ) {
          throw new Error(
            "Payment amount cannot exceed outstanding balance"
          );
        }

        await createSupplierPayment({

          supplierId:
            Number(supplierId),

          purchaseId:
            purchaseId
              ? Number(purchaseId)
              : null,

          paymentDate,

          amount:
            paymentAmount,

          paymentMethod,

          referenceNumber:
            referenceNumber.trim() ||
            null,

          notes:
            notes.trim() ||
            null,

        });

        setSuccessMessage(
          "Supplier payment recorded successfully"
        );
      }

      resetForm();

      await Promise.all([
        loadPayments(),
        loadMasterData(),
      ]);

    } catch (err: any) {

      setError(
        err?.message ||
          "Failed to record payment"
      );

    } finally {

      setSubmitting(false);

    }

  };


  /* =======================================================
     SEARCH FILTER
  ======================================================= */

  const filteredPayments =
    useMemo(() => {

      const keyword =
        search
          .trim()
          .toLowerCase();

      if (!keyword) {
        return payments;
      }

      return payments.filter(
        (payment: any) => {

          const party =
            payment.payment_type ===
            "customer"
              ? payment.customer_name
              : payment.supplier_name;

          const invoice =
            payment.payment_type ===
            "customer"
              ? payment.invoice_no
              : payment.purchase_number;

          return (
            String(
              party || ""
            )
              .toLowerCase()
              .includes(keyword) ||

            String(
              invoice || ""
            )
              .toLowerCase()
              .includes(keyword) ||

            String(
              payment.payment_method ||
                ""
            )
              .toLowerCase()
              .includes(keyword) ||

            String(
              payment.reference_number ||
                ""
            )
              .toLowerCase()
              .includes(keyword)
          );

        }
      );

    }, [
      payments,
      search,
    ]);


  /* =======================================================
     SUMMARY
  ======================================================= */

  const summary =
    useMemo(() => {

      let totalReceived = 0;

      let customerTotal = 0;

      let supplierTotal = 0;

      filteredPayments.forEach(
        (payment: any) => {

          const value =
            Number(
              payment.amount
            ) || 0;

          totalReceived +=
            value;

          if (
            payment.payment_type ===
            "customer"
          ) {

            customerTotal +=
              value;

          } else {

            supplierTotal +=
              value;

          }

        }
      );

      return {
        totalReceived,
        customerTotal,
        supplierTotal,
        count:
          filteredPayments.length,
      };

    }, [
      filteredPayments,
    ]);


  /* =======================================================
     UI
  ======================================================= */

  return (
    <div className="min-h-screen bg-slate-50">

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <Sidebar />


      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <main className="lg:pl-[260px]">

        <div className="min-h-screen p-6">

          {/* =============================================
              HEADER
          ============================================= */}

          <div className="mb-6 flex items-center justify-between">

            <div>

              <h1 className="text-2xl font-bold text-gray-900">
                Payments
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Manage customer and supplier payments
              </p>

            </div>

            <button
              type="button"
              onClick={() => {
                loadPayments();
                loadMasterData();
              }}
              className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
            >

              <RefreshCw className="h-4 w-4" />

              Refresh

            </button>

          </div>


          {/* =============================================
              ALERTS
          ============================================= */}

          {error && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="mb-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {successMessage}
            </div>
          )}


          {/* =============================================
              PAYMENT TYPE
          ============================================= */}

          <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

            <div className="mb-4 flex items-center gap-2">

              <CreditCard className="h-5 w-5 text-green-600" />

              <h2 className="text-base font-semibold text-gray-900">
                Payment Type
              </h2>

            </div>

            <div className="flex flex-wrap gap-6">

              <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-700">

                <input
                  type="radio"
                  name="paymentType"
                  value="customer"
                  checked={
                    paymentType ===
                    "customer"
                  }
                  onChange={() =>
                    handlePaymentTypeChange(
                      "customer"
                    )
                  }
                  className="h-4 w-4 accent-green-600"
                />

                Customer Payment

              </label>


              <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-700">

                <input
                  type="radio"
                  name="paymentType"
                  value="supplier"
                  checked={
                    paymentType ===
                    "supplier"
                  }
                  onChange={() =>
                    handlePaymentTypeChange(
                      "supplier"
                    )
                  }
                  className="h-4 w-4 accent-green-600"
                />

                Supplier Payment

              </label>

            </div>

          </div>


          {/* =============================================
              PAYMENT FORM
          ============================================= */}

          <form
            onSubmit={handleSubmit}
            className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
          >

            <div className="mb-5 flex items-center gap-2">

              {paymentType ===
              "customer" ? (
                <Users className="h-5 w-5 text-green-600" />
              ) : (
                <Truck className="h-5 w-5 text-green-600" />
              )}

              <h2 className="text-lg font-semibold text-gray-900">

                {paymentType ===
                "customer"
                  ? "Customer Payment"
                  : "Supplier Payment"}

              </h2>

            </div>


            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">

              {/* =========================================
                  CUSTOMER
              ========================================= */}

              {paymentType ===
                "customer" && (

                <div>

                  <label className="mb-1.5 block text-sm font-medium text-gray-700">

                    Customer

                    <span className="text-red-500">
                      {" "}*
                    </span>

                  </label>

                  <select
                    value={customerId}
                    onChange={(e) => {

                      setCustomerId(
                        e.target.value
                      );

                      setSaleId("");

                      setAmount("");

                    }}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-black outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
                  >

                    <option
                      value=""
                      className="text-black"
                    >
                      Select customer
                    </option>

                    {customers.map(
                      (customer) => (

                        <option
                          key={
                            customer.id
                          }
                          value={
                            customer.id
                          }
                          className="text-black"
                        >
                          {customer.name}

                          {customer.phone
                            ? ` - ${customer.phone}`
                            : ""}

                        </option>

                      )
                    )}

                  </select>

                </div>

              )}


              {/* =========================================
                  SALE INVOICE
              ========================================= */}

              {paymentType ===
                "customer" && (

                <div>

                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Sale Invoice
                  </label>

                  <select
                    value={saleId}
                    onChange={(e) =>
                      handleSaleChange(
                        e.target.value
                      )
                    }
                    disabled={
                      !customerId
                    }
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-black outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-black"
                  >

                    <option
                      value=""
                      className="text-black"
                    >
                      General payment
                    </option>

                    {customerSales.map(
                      (sale) => (

                        <option
                          key={
                            sale.id
                          }
                          value={
                            sale.id
                          }
                          className="text-black"
                        >
                          {
                            sale.invoice_number
                          }

                          {" - "}

                          Balance{" "}

                          {formatCurrency(
                            sale.balance_amount
                          )}

                        </option>

                      )
                    )}

                  </select>

                </div>

              )}


              {/* =========================================
                  SUPPLIER
              ========================================= */}

              {paymentType ===
                "supplier" && (

                <div>

                  <label className="mb-1.5 block text-sm font-medium text-gray-700">

                    Supplier

                    <span className="text-red-500">
                      {" "}*
                    </span>

                  </label>

                  <select
                    value={supplierId}
                    onChange={(e) => {

                      setSupplierId(
                        e.target.value
                      );

                      setPurchaseId("");

                      setAmount("");

                    }}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-black outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
                  >

                    <option
                      value=""
                      className="text-black"
                    >
                      Select supplier
                    </option>

                    {suppliers.map(
                      (supplier) => (

                        <option
                          key={
                            supplier.id
                          }
                          value={
                            supplier.id
                          }
                          className="text-black"
                        >
                          {supplier.name}

                          {supplier.phone
                            ? ` - ${supplier.phone}`
                            : ""}

                        </option>

                      )
                    )}

                  </select>

                </div>

              )}


              {/* =========================================
                  PURCHASE
              ========================================= */}

              {paymentType ===
                "supplier" && (

                <div>

                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Purchase Invoice
                  </label>

                  <select
                    value={purchaseId}
                    onChange={(e) =>
                      handlePurchaseChange(
                        e.target.value
                      )
                    }
                    disabled={
                      !supplierId
                    }
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-black outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-black"
                  >

                    <option
                      value=""
                      className="text-black"
                    >
                      General payment
                    </option>

                    {supplierPurchases.map(
                      (purchase) => (

                        <option
                          key={
                            purchase.id
                          }
                          value={
                            purchase.id
                          }
                          className="text-black"
                        >
                          {
                            purchase.purchase_number
                          }

                          {" - "}

                          Balance{" "}

                          {formatCurrency(
                            purchase.balance_amount
                          )}

                        </option>

                      )
                    )}

                  </select>

                </div>

              )}


              {/* =========================================
                  PAYMENT DATE
              ========================================= */}

              <div>

                <label className="mb-1.5 block text-sm font-medium text-gray-700">

                  Payment Date

                  <span className="text-red-500">
                    {" "}*
                  </span>

                </label>

                <input
                  type="date"
                  value={
                    paymentDate
                  }
                  onChange={(e) =>
                    setPaymentDate(
                      e.target.value
                    )
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-black outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
                  required
                />

              </div>


              {/* =========================================
                  AMOUNT
              ========================================= */}

              <div>

                <label className="mb-1.5 block text-sm font-medium text-gray-700">

                  Amount

                  <span className="text-red-500">
                    {" "}*
                  </span>

                </label>

                <div className="relative">

                  <IndianRupee className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />

                  <input
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={amount}
                    onChange={(e) =>
                      setAmount(
                        e.target.value
                      )
                    }
                    placeholder="0.00"
                    className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-9 pr-3 text-sm text-black outline-none transition placeholder:text-black focus:border-green-500 focus:ring-2 focus:ring-green-100"
                    required
                  />

                </div>


                {paymentType ===
                  "customer" &&
                  selectedSale && (

                    <p className="mt-1.5 text-xs text-gray-600">

                      Outstanding:{" "}

                      <span className="font-semibold text-orange-600">

                        {formatCurrency(
                          selectedSale.balance_amount
                        )}

                      </span>

                    </p>

                  )}


                {paymentType ===
                  "supplier" &&
                  selectedPurchase && (

                    <p className="mt-1.5 text-xs text-gray-600">

                      Outstanding:{" "}

                      <span className="font-semibold text-orange-600">

                        {formatCurrency(
                          selectedPurchase.balance_amount
                        )}

                      </span>

                    </p>

                  )}

              </div>


              {/* =========================================
                  PAYMENT METHOD
              ========================================= */}

              <div>

                <label className="mb-1.5 block text-sm font-medium text-gray-700">

                  Payment Method

                  <span className="text-red-500">
                    {" "}*
                  </span>

                </label>

                <select
                  value={
                    paymentMethod
                  }
                  onChange={(e) =>
                    setPaymentMethod(
                      e.target.value
                    )
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-black outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-100"
                >

                  <option
                    value="cash"
                    className="text-black"
                  >
                    Cash
                  </option>

                  <option
                    value="upi"
                    className="text-black"
                  >
                    UPI
                  </option>

                  <option
                    value="bank"
                    className="text-black"
                  >
                    Bank Transfer
                  </option>

                  <option
                    value="card"
                    className="text-black"
                  >
                    Card
                  </option>

                  <option
                    value="cheque"
                    className="text-black"
                  >
                    Cheque
                  </option>

                </select>

              </div>


              {/* =========================================
                  REFERENCE NUMBER
              ========================================= */}

              <div>

                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Reference Number
                </label>

                <input
                  type="text"
                  value={
                    referenceNumber
                  }
                  onChange={(e) =>
                    setReferenceNumber(
                      e.target.value
                    )
                  }
                  placeholder="Optional"
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-black outline-none transition placeholder:text-black focus:border-green-500 focus:ring-2 focus:ring-green-100"
                />

              </div>


              {/* =========================================
                  NOTES
              ========================================= */}

              <div className="md:col-span-2 lg:col-span-3">

                <label className="mb-1.5 block text-sm font-medium text-gray-700">
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
                  placeholder="Optional notes"
                  className="w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-black outline-none transition placeholder:text-black focus:border-green-500 focus:ring-2 focus:ring-green-100"
                />

              </div>

            </div>


            {/* =========================================
                ACTION BUTTONS
            ========================================= */}

            <div className="mt-5 flex justify-end gap-3">

              <button
                type="button"
                onClick={
                  resetForm
                }
                disabled={
                  submitting
                }
                className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
              >
                Clear
              </button>


              <button
                type="submit"
                disabled={
                  submitting
                }
                className="flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
              >

                {submitting ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Recording...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Record Payment
                  </>
                )}

              </button>

            </div>

          </form>


          {/* =============================================
              DATE FILTER
          ============================================= */}

          <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

            <div className="mb-4 flex items-center gap-2">

              <CalendarDays className="h-5 w-5 text-green-600" />

              <h2 className="text-base font-semibold text-gray-900">
                Payment History Filter
              </h2>

            </div>


            <div className="flex flex-wrap items-center gap-2">

              <button
                type="button"
                onClick={() =>
                  setDateFilter(
                    "today"
                  )
                }
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  dateFilter ===
                  "today"
                    ? "bg-green-600 text-white"
                    : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
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
                    ? "bg-green-600 text-white"
                    : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                All Payments
              </button>


              <button
                type="button"
                onClick={() =>
                  setDateFilter(
                    "custom"
                  )
                }
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  dateFilter ===
                  "custom"
                    ? "bg-green-600 text-white"
                    : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                Custom Date
              </button>


              {dateFilter ===
                "custom" && (

                <input
                  type="date"
                  value={
                    customDate
                  }
                  onChange={(e) =>
                    setCustomDate(
                      e.target.value
                    )
                  }
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-black outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                />

              )}

            </div>


            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">

              <p className="text-sm text-gray-600">

                Showing{" "}

                <span className="font-medium text-gray-900">

                  {dateFilter ===
                  "today"
                    ? "today's payments"
                    : dateFilter ===
                      "all"
                    ? "all payments"
                    : formatDate(
                        customDate
                      )}

                </span>

              </p>


              <div className="relative w-full sm:w-72">

                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />

                <input
                  type="text"
                  value={
                    search
                  }
                  onChange={(e) =>
                    setSearch(
                      e.target.value
                    )
                  }
                  placeholder="Search payments..."
                  className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-black outline-none placeholder:text-black focus:border-green-500 focus:ring-2 focus:ring-green-100"
                />

              </div>

            </div>

          </div>


          {/* =============================================
              SUMMARY CARDS
          ============================================= */}

          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

            {/* TOTAL */}

            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm text-gray-500">
                    Total Payments
                  </p>

                  <h3 className="mt-1 text-2xl font-bold text-gray-900">
                    {formatCurrency(
                      summary.totalReceived
                    )}
                  </h3>

                </div>

                <div className="rounded-lg bg-green-50 p-3">

                  <Wallet className="h-5 w-5 text-green-600" />

                </div>

              </div>

            </div>


            {/* CUSTOMER */}

            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm text-gray-500">
                    Customer Payments
                  </p>

                  <h3 className="mt-1 text-2xl font-bold text-gray-900">
                    {formatCurrency(
                      summary.customerTotal
                    )}
                  </h3>

                </div>

                <div className="rounded-lg bg-blue-50 p-3">

                  <Users className="h-5 w-5 text-blue-600" />

                </div>

              </div>

            </div>


            {/* SUPPLIER */}

            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm text-gray-500">
                    Supplier Payments
                  </p>

                  <h3 className="mt-1 text-2xl font-bold text-gray-900">
                    {formatCurrency(
                      summary.supplierTotal
                    )}
                  </h3>

                </div>

                <div className="rounded-lg bg-orange-50 p-3">

                  <Truck className="h-5 w-5 text-orange-600" />

                </div>

              </div>

            </div>


            {/* COUNT */}

            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-sm text-gray-500">
                    Payment Transactions
                  </p>

                  <h3 className="mt-1 text-2xl font-bold text-gray-900">
                    {summary.count}
                  </h3>

                </div>

                <div className="rounded-lg bg-purple-50 p-3">

                  <FileText className="h-5 w-5 text-purple-600" />

                </div>

              </div>

            </div>

          </div>


          {/* =============================================
              PAYMENT HISTORY
          ============================================= */}

          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">

            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">

              <div>

                <h2 className="text-lg font-semibold text-gray-900">
                  Payment History
                </h2>

                <p className="mt-1 text-sm text-gray-500">

                  {filteredPayments.length} transaction

                  {filteredPayments.length !==
                  1
                    ? "s"
                    : ""}

                </p>

              </div>


              <button
                type="button"
                onClick={
                  loadPayments
                }
                className="rounded-lg border border-gray-200 p-2 text-gray-600 transition hover:bg-gray-50"
                title="Refresh payments"
              >

                <RefreshCw
                  className={`h-4 w-4 ${
                    loading
                      ? "animate-spin"
                      : ""
                  }`}
                />

              </button>

            </div>


            {/* =========================================
                LOADING
            ========================================= */}

            {loading ? (

              <div className="flex items-center justify-center px-6 py-16">

                <RefreshCw className="h-6 w-6 animate-spin text-green-600" />

                <span className="ml-3 text-sm text-gray-500">
                  Loading payments...
                </span>

              </div>

            ) : filteredPayments.length ===
              0 ? (

              /* =======================================
                 EMPTY
              ======================================= */

              <div className="flex flex-col items-center justify-center px-6 py-16 text-center">

                <div className="mb-3 rounded-full bg-gray-100 p-4">

                  <CreditCard className="h-7 w-7 text-gray-400" />

                </div>

                <h3 className="text-sm font-semibold text-gray-900">
                  No payments found
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  No payment transactions match the selected filter.
                </p>

              </div>

            ) : (

              /* =======================================
                 TABLE
              ======================================= */

              <div className="overflow-x-auto">

                <table className="w-full min-w-[1000px]">

                  <thead className="bg-gray-50">

                    <tr>

                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Date
                      </th>

                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Type
                      </th>

                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Customer / Supplier
                      </th>

                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Invoice
                      </th>

                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Amount
                      </th>

                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Method
                      </th>

                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Reference
                      </th>

                    </tr>

                  </thead>


                  <tbody className="divide-y divide-gray-100">

                    {filteredPayments.map(
                      (payment: any) => {

                        const isCustomer =
                          payment.payment_type ===
                          "customer";

                        const partyName =
                          isCustomer
                            ? payment.customer_name
                            : payment.supplier_name;

                        const invoice =
                          isCustomer
                            ? payment.invoice_no
                            : payment.purchase_number;

                        return (

                          <tr
                            key={`${payment.payment_type}-${payment.id}`}
                            className="transition hover:bg-gray-50"
                          >

                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                              {formatDate(
                                payment.payment_date
                              )}
                            </td>


                            <td className="whitespace-nowrap px-6 py-4">

                              <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                                  isCustomer
                                    ? "bg-blue-50 text-blue-700"
                                    : "bg-orange-50 text-orange-700"
                                }`}
                              >
                                {isCustomer
                                  ? "Customer"
                                  : "Supplier"}
                              </span>

                            </td>


                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                              {partyName ||
                                "-"}
                            </td>


                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                              {invoice ||
                                "General Payment"}
                            </td>


                            <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-semibold text-gray-900">
                              {formatCurrency(
                                payment.amount
                              )}
                            </td>


                            <td className="whitespace-nowrap px-6 py-4">

                              <span className="text-sm capitalize text-gray-700">
                                {payment.payment_method ||
                                  "-"}
                              </span>

                            </td>


                            <td className="px-6 py-4 text-sm text-gray-600">
                              {payment.reference_number ||
                                "-"}
                            </td>

                          </tr>

                        );

                      }
                    )}

                  </tbody>

                </table>

              </div>

            )}

          </div>

        </div>

      </main>

    </div>
  );
}