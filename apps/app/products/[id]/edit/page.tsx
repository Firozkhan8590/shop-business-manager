"use client";

import {
  AlertTriangle,
  ArrowLeft,
  ImagePlus,
  Package,
  Save,
  Tag,
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";

import Sidebar from "../../../components/Sidebar";

import {
  getProduct,
  updateProduct,
  type Product,
  type UpdateProductInput,
} from "../../../../src/lib/products";

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();

  const productId = Number(params.id);

  const [product, setProduct] = useState<Product | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    name: "",
    sku: "",
    barcode: "",
    unit: "pcs",
    category_id: "",
    purchase_price: "",
    selling_price: "",
    current_stock: "",
    minimum_stock: "",
  });

  /* ====================================================================== */
  /* LOAD PRODUCT                                                            */
  /* ====================================================================== */

  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true);
        setError("");

        if (!Number.isInteger(productId) || productId <= 0) {
          setError("Invalid product ID");
          return;
        }

        const data = await getProduct(productId);

        setProduct(data);

        setForm({
          name: data.name,
          sku: data.sku ?? "",
          barcode: data.barcode ?? "",
          unit: data.unit || "pcs",
          category_id:
            data.category_id !== null
              ? String(data.category_id)
              : "",
          purchase_price: data.purchase_price ?? "0",
          selling_price: data.selling_price ?? "0",
          current_stock: data.current_stock ?? "0",
          minimum_stock: data.minimum_stock ?? "0",
        });
      } catch (error) {
        console.error("Failed to load product:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load product"
        );
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [productId]);

  /* ====================================================================== */
  /* FIELD UPDATE                                                            */
  /* ====================================================================== */

  function updateField(
    field: keyof typeof form,
    value: string
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  /* ====================================================================== */
  /* CALCULATED VALUES                                                       */
  /* ====================================================================== */

  const purchasePrice = Number(form.purchase_price) || 0;
  const sellingPrice = Number(form.selling_price) || 0;
  const currentStock = Number(form.current_stock) || 0;
  const minimumStock = Number(form.minimum_stock) || 0;

  const margin = sellingPrice - purchasePrice;

  const marginPercent =
    purchasePrice > 0
      ? (margin / purchasePrice) * 100
      : 0;

  const previousStock = Number(product?.current_stock ?? 0);

  const stockAdjustment = currentStock - previousStock;

  const stockStatus =
    currentStock <= minimumStock ? "Low Stock" : "In Stock";

  /* ====================================================================== */
  /* SUBMIT                                                                  */
  /* ====================================================================== */

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      if (!form.name.trim()) {
        setError("Product name is required");
        return;
      }

      if (purchasePrice < 0) {
        setError("Purchase price cannot be negative");
        return;
      }

      if (sellingPrice < 0) {
        setError("Selling price cannot be negative");
        return;
      }

      if (currentStock < 0) {
        setError("Current stock cannot be negative");
        return;
      }

      if (minimumStock < 0) {
        setError("Minimum stock cannot be negative");
        return;
      }

      const data: UpdateProductInput = {
        name: form.name.trim(),
        sku: form.sku.trim() || null,
        barcode: form.barcode.trim() || null,
        unit: form.unit.trim() || "pcs",

        category_id: form.category_id
          ? Number(form.category_id)
          : null,

        purchase_price: purchasePrice,
        selling_price: sellingPrice,
        current_stock: currentStock,
        minimum_stock: minimumStock,
      };

      await updateProduct(productId, data);

      setSuccess("Product updated successfully");

      setTimeout(() => {
        router.push("/products");
      }, 700);
    } catch (error) {
      console.error("Failed to update product:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to update product"
      );
    } finally {
      setSaving(false);
    }
  }

  /* ====================================================================== */
  /* LOADING                                                                 */
  /* ====================================================================== */

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Sidebar />

        <div className="lg:pl-[260px]">
          <div className="flex min-h-screen items-center justify-center">
            <div className="text-sm font-medium text-slate-500">
              Loading product...
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ====================================================================== */
  /* ERROR                                                                   */
  /* ====================================================================== */

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Sidebar />

        <div className="lg:pl-[260px]">
          <div className="flex min-h-screen items-center justify-center p-6">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
                <AlertTriangle size={26} />
              </div>

              <h2 className="mt-4 text-lg font-semibold text-slate-800">
                Product not found
              </h2>

              <p className="mt-2 text-sm text-red-500">
                {error || "Unable to load this product."}
              </p>

              <Link
                href="/products"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#063f3d] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#052f2d]"
              >
                <ArrowLeft size={17} />
                Back to Products
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ====================================================================== */
  /* PAGE                                                                    */
  /* ====================================================================== */

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />

      <div className="lg:pl-[260px]">
        {/* ================================================================= */}
        {/* HEADER                                                              */}
        {/* ================================================================= */}

        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white">
          <div className="flex h-20 items-center justify-between px-6 lg:px-8">
            <div className="flex items-center gap-4">
              <Link
                href="/products"
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-[#063f3d]"
              >
                <ArrowLeft size={20} />
              </Link>

              <div>
                <h1 className="text-2xl font-bold text-slate-800">
                  Edit Product
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Update product details, pricing and stock
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* ================================================================= */}
        {/* MAIN                                                                */}
        {/* ================================================================= */}

        <main className="p-6 lg:p-8">
          <form
            onSubmit={handleSubmit}
            className="mx-auto max-w-6xl"
          >
            {/* ============================================================= */}
            {/* ALERTS                                                           */}
            {/* ============================================================= */}

            {error && (
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-600">
                {success}
              </div>
            )}

            {/* ============================================================= */}
            {/* TWO COLUMN LAYOUT                                                */}
            {/* ============================================================= */}

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
              {/* =========================================================== */}
              {/* LEFT COLUMN                                                    */}
              {/* =========================================================== */}

              <div className="space-y-6">
                {/* ========================================================= */}
                {/* BASIC INFORMATION                                            */}
                {/* ========================================================= */}

                <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="border-b border-slate-100 px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#063f3d]/10 text-[#063f3d]">
                        <Package size={20} />
                      </div>

                      <div>
                        <h2 className="font-semibold text-slate-800">
                          Basic Information
                        </h2>

                        <p className="text-sm text-slate-500">
                          Product identification details
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-5 p-6 md:grid-cols-2">
                    {/* Product Name */}

                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Product Name
                      </label>

                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) =>
                          updateField("name", e.target.value)
                        }
                        className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#063f3d] focus:ring-2 focus:ring-[#063f3d]/10"
                      />
                    </div>

                    {/* SKU */}

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        SKU
                      </label>

                      <input
                        type="text"
                        value={form.sku}
                        onChange={(e) =>
                          updateField("sku", e.target.value)
                        }
                        placeholder="Enter SKU"
                        className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#063f3d] focus:ring-2 focus:ring-[#063f3d]/10"
                      />
                    </div>

                    {/* Barcode */}

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Barcode
                      </label>

                      <input
                        type="text"
                        value={form.barcode}
                        onChange={(e) =>
                          updateField(
                            "barcode",
                            e.target.value
                          )
                        }
                        placeholder="Enter barcode"
                        className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#063f3d] focus:ring-2 focus:ring-[#063f3d]/10"
                      />
                    </div>

                    {/* Unit */}

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Unit
                      </label>

                      <select
                        value={form.unit}
                        onChange={(e) =>
                          updateField(
                            "unit",
                            e.target.value
                          )
                        }
                        className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 outline-none transition focus:border-[#063f3d] focus:ring-2 focus:ring-[#063f3d]/10"
                      >
                        <option value="pcs">Pieces</option>
                        <option value="box">Box</option>
                        <option value="kg">Kilogram</option>
                        <option value="g">Gram</option>
                        <option value="ltr">Litre</option>
                        <option value="ml">Millilitre</option>
                        <option value="set">Set</option>
                      </select>
                    </div>

                    {/* Category */}

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Category ID
                      </label>

                      <input
                        type="number"
                        min="1"
                        value={form.category_id}
                        onChange={(e) =>
                          updateField(
                            "category_id",
                            e.target.value
                          )
                        }
                        placeholder="Leave empty if none"
                        className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#063f3d] focus:ring-2 focus:ring-[#063f3d]/10"
                      />

                      <p className="mt-2 text-xs text-slate-400">
                        Category selection will be replaced with
                        the category dropdown when the Categories
                        module is completed.
                      </p>
                    </div>
                  </div>
                </section>

                {/* ========================================================= */}
                {/* PRICING                                                      */}
                {/* ========================================================= */}

                <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="border-b border-slate-100 px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#063f3d]/10 text-[#063f3d]">
                        <Tag size={20} />
                      </div>

                      <div>
                        <h2 className="font-semibold text-slate-800">
                          Pricing
                        </h2>

                        <p className="text-sm text-slate-500">
                          Purchase and selling prices
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-5 p-6 md:grid-cols-2">
                    {/* Purchase Price */}

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Purchase Price
                      </label>

                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400">
                          ₹
                        </span>

                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={form.purchase_price}
                          onChange={(e) =>
                            updateField(
                              "purchase_price",
                              e.target.value
                            )
                          }
                          className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-[#063f3d] focus:ring-2 focus:ring-[#063f3d]/10"
                        />
                      </div>
                    </div>

                    {/* Selling Price */}

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Selling Price
                      </label>

                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400">
                          ₹
                        </span>

                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={form.selling_price}
                          onChange={(e) =>
                            updateField(
                              "selling_price",
                              e.target.value
                            )
                          }
                          className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-[#063f3d] focus:ring-2 focus:ring-[#063f3d]/10"
                        />
                      </div>
                    </div>
                  </div>
                </section>

                {/* ========================================================= */}
                {/* STOCK                                                        */}
                {/* ========================================================= */}

                <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="border-b border-slate-100 px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#063f3d]/10 text-[#063f3d]">
                        <Package size={20} />
                      </div>

                      <div>
                        <h2 className="font-semibold text-slate-800">
                          Stock
                        </h2>

                        <p className="text-sm text-slate-500">
                          Current inventory information
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-5 p-6 md:grid-cols-2">
                    {/* Current Stock */}

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Current Stock
                      </label>

                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.current_stock}
                        onChange={(e) =>
                          updateField(
                            "current_stock",
                            e.target.value
                          )
                        }
                        className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-[#063f3d] focus:ring-2 focus:ring-[#063f3d]/10"
                      />
                    </div>

                    {/* Minimum Stock */}

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Minimum Stock
                      </label>

                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.minimum_stock}
                        onChange={(e) =>
                          updateField(
                            "minimum_stock",
                            e.target.value
                          )
                        }
                        className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none transition focus:border-[#063f3d] focus:ring-2 focus:ring-[#063f3d]/10"
                      />
                    </div>
                  </div>
                </section>
              </div>

              {/* =========================================================== */}
              {/* RIGHT COLUMN                                                   */}
              {/* =========================================================== */}

              <div className="space-y-6">
                {/* ========================================================= */}
                {/* PRODUCT IMAGE                                                */}
                {/* ========================================================= */}

                <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="border-b border-slate-100 px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#063f3d]/10 text-[#063f3d]">
                        <ImagePlus size={20} />
                      </div>

                      <div>
                        <h2 className="font-semibold text-slate-800">
                          Product Image
                        </h2>

                        <p className="text-sm text-slate-500">
                          Product image
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    {product.image ? (
                      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                        <img
                          src={
                            product.image.startsWith("http")
                              ? product.image
                              : `http://localhost:4000${product.image}`
                          }
                          alt={product.name}
                          className="h-64 w-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="flex h-64 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50">
                        <ImagePlus
                          size={42}
                          className="text-slate-300"
                        />

                        <p className="mt-3 text-sm font-medium text-slate-600">
                          No product image
                        </p>

                        <p className="mt-1 text-center text-xs text-slate-400">
                          Image upload will be connected to local
                          storage next.
                        </p>
                      </div>
                    )}
                  </div>
                </section>

                {/* ========================================================= */}
                {/* PRODUCT SUMMARY                                              */}
                {/* ========================================================= */}

                <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="border-b border-slate-100 px-6 py-5">
                    <h2 className="font-semibold text-slate-800">
                      Product Summary
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Current product overview
                    </p>
                  </div>

                  <div className="space-y-4 p-6">
                    <SummaryRow
                      label="Purchase Price"
                      value={`₹${purchasePrice.toLocaleString(
                        "en-IN",
                        {
                          minimumFractionDigits: 2,
                        }
                      )}`}
                    />

                    <SummaryRow
                      label="Selling Price"
                      value={`₹${sellingPrice.toLocaleString(
                        "en-IN",
                        {
                          minimumFractionDigits: 2,
                        }
                      )}`}
                    />

                    <SummaryRow
                      label="Margin"
                      value={`₹${margin.toLocaleString(
                        "en-IN",
                        {
                          minimumFractionDigits: 2,
                        }
                      )}`}
                      strong
                    />

                    <SummaryRow
                      label="Margin %"
                      value={`${marginPercent.toFixed(1)}%`}
                    />

                    <SummaryRow
                      label="Current Stock"
                      value={`${currentStock} ${form.unit}`}
                    />

                    <SummaryRow
                      label="Minimum Stock"
                      value={`${minimumStock} ${form.unit}`}
                    />

                    <div className="border-t border-slate-100 pt-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500">
                          Stock Status
                        </span>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            stockStatus === "Low Stock"
                              ? "bg-amber-50 text-amber-600"
                              : "bg-emerald-50 text-emerald-700"
                          }`}
                        >
                          {stockStatus}
                        </span>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>

            {/* ============================================================= */}
            {/* STOCK MOVEMENT — LAST SECTION                                   */}
            {/* ============================================================= */}

            

            {/* ============================================================= */}
            {/* ACTIONS                                                         */}
            {/* ============================================================= */}

            <div className="flex items-center justify-end gap-3 py-6">
              <Link
                href="/products"
                className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-[#063f3d] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#052f2d] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save size={18} />

                {saving
                  ? "Updating..."
                  : "Update Product"}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}

/* ========================================================================== */
/* SUMMARY ROW                                                                */
/* ========================================================================== */

function SummaryRow({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-slate-500">
        {label}
      </span>

      <span
        className={`text-sm ${
          strong
            ? "font-bold text-[#063f3d]"
            : "font-semibold text-slate-700"
        }`}
      >
        {value}
      </span>
    </div>
  );
}