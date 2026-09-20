"use client";

import {
  AlertTriangle,
  Barcode,
  ChevronDown,
  Edit,
  Package,
  Plus,
  Search,
  Tag,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import Sidebar from "../components/Sidebar";

import {
  deactivateProduct,
  getProducts,
  type Product as ApiProduct,
} from "../../src/lib/products";

type Product = {
  id: number;
  name: string;
  sku: string;
  barcode: string;
  category: string;
  unit: string;
  purchasePrice: number;
  sellingPrice: number;
  stock: number;
  minimumStock: number;
  status: "Active" | "Inactive";
};

const categories = ["All Categories"];

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All Categories");

  const [products, setProducts] = useState<Product[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [deletingId, setDeletingId] = useState<number | null>(
    null
  );

  const [deleteProduct, setDeleteProduct] =
  useState<Product | null>(null);

  /* ====================================================================== */
  /* LOAD PRODUCTS                                                          */
  /* ====================================================================== */

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        setError("");

        const apiProducts = await getProducts();

        const mappedProducts: Product[] = apiProducts.map(
          (product: ApiProduct) => ({
            id: product.id,
            name: product.name,
            sku: product.sku ?? "",
            barcode: product.barcode ?? "",
            category: product.category_id
              ? `Category ${product.category_id}`
              : "Uncategorized",
            unit: product.unit,
            purchasePrice: Number(product.purchase_price),
            sellingPrice: Number(product.selling_price),
            stock: Number(product.current_stock),
            minimumStock: Number(product.minimum_stock),
            status: product.is_active
              ? "Active"
              : "Inactive",
          })
        );

        setProducts(mappedProducts);
      } catch (error) {
        console.error(
          "Failed to load products:",
          error
        );

        setError("Failed to load products");
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  /* ====================================================================== */
  /* SEARCH + CATEGORY FILTER                                               */
  /* ====================================================================== */

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const searchValue = search.toLowerCase();

      const matchesSearch =
        product.name
          .toLowerCase()
          .includes(searchValue) ||
        product.sku
          .toLowerCase()
          .includes(searchValue) ||
        product.barcode.includes(search);

      const matchesCategory =
        category === "All Categories" ||
        product.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [products, search, category]);

  /* ====================================================================== */
  /* SUMMARY COUNTS                                                         */
  /* ====================================================================== */

  const lowStockCount = products.filter(
    (product) =>
      product.stock <= product.minimumStock
  ).length;

  const activeCount = products.filter(
    (product) => product.status === "Active"
  ).length;

  /* ====================================================================== */
  /* DELETE PRODUCT                                                         */
  /* ====================================================================== */

 async function handleDeleteProduct() {
  if (!deleteProduct) {
    return;
  }

  try {
    setDeletingId(deleteProduct.id);
    setError("");

    await deactivateProduct(deleteProduct.id);

    setProducts((previousProducts) =>
      previousProducts.filter(
        (item) => item.id !== deleteProduct.id
      )
    );

    setDeleteProduct(null);
  } catch (error) {
    console.error(
      "Failed to delete product:",
      error
    );

    setError(
      error instanceof Error
        ? error.message
        : "Failed to delete product"
    );
  } finally {
    setDeletingId(null);
  }
}

  /* ====================================================================== */
  /* PAGE                                                                    */
  /* ====================================================================== */

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />

      <div className="lg:pl-[260px]">
        {/* ================================================================= */}
        {/* HEADER                                                             */}
        {/* ================================================================= */}

        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white">
          <div className="flex h-20 items-center justify-between px-6 lg:px-8">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                Products
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Manage your products, prices and stock
              </p>
            </div>

            <Link
              href="/products/new"
              className="flex items-center gap-2 rounded-xl bg-[#063f3d] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#052f2d]"
            >
              <Plus size={18} />
              Add Product
            </Link>
          </div>
        </header>

        {/* ================================================================= */}
        {/* MAIN                                                               */}
        {/* ================================================================= */}

        <main className="p-6 lg:p-8">
          {/* =============================================================== */}
          {/* SUMMARY CARDS                                                     */}
          {/* =============================================================== */}

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {/* Total Products */}

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Total Products
                  </p>

                  <p className="mt-2 text-3xl font-bold text-slate-800">
                    {products.length}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#063f3d]/10 text-[#063f3d]">
                  <Package size={21} />
                </div>
              </div>
            </div>

            {/* Active Products */}

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Active Products
                  </p>

                  <p className="mt-2 text-3xl font-bold text-slate-800">
                    {activeCount}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <Tag size={21} />
                </div>
              </div>
            </div>

            {/* Low Stock */}

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Low Stock
                  </p>

                  <p className="mt-2 text-3xl font-bold text-slate-800">
                    {lowStockCount}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <AlertTriangle size={21} />
                </div>
              </div>
            </div>

            {/* Categories */}

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Categories
                  </p>

                  <p className="mt-2 text-3xl font-bold text-slate-800">
                    0
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Tag size={21} />
                </div>
              </div>
            </div>
          </div>

          {/* =============================================================== */}
          {/* SEARCH + FILTER                                                   */}
          {/* =============================================================== */}

          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
              {/* Search */}

              <div className="relative flex-1">
                <Search
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  placeholder="Search product, SKU or barcode..."
                  value={search}
                  onChange={(e) =>
                    setSearch(e.target.value)
                  }
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-900 focus:border-[#063f3d] focus:bg-white focus:ring-2 focus:ring-[#063f3d]/10"
                />
              </div>

              {/* Category */}

              <div className="relative lg:w-64">
                <select
                  value={category}
                  onChange={(e) =>
                    setCategory(e.target.value)
                  }
                  className="h-12 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 pr-10 text-sm font-medium text-slate-700 outline-none transition focus:border-[#063f3d] focus:bg-white focus:ring-2 focus:ring-[#063f3d]/10"
                >
                  {categories.map((item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  size={18}
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>
            </div>
          </div>

          {/* =============================================================== */}
          {/* ERROR                                                            */}
          {/* =============================================================== */}

          {error && (
            <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              {error}
            </div>
          )}

          {/* =============================================================== */}
          {/* PRODUCTS TABLE                                                   */}
          {/* =============================================================== */}

          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Product
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      SKU
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Barcode
                    </th>

                    <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Category
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Purchase
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Selling
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Stock
                    </th>

                    <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Status
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td
                        colSpan={9}
                        className="px-6 py-12 text-center text-sm text-slate-500"
                      >
                        Loading products...
                      </td>
                    </tr>
                  ) : filteredProducts.length === 0 ? (
                    <tr>
                      <td
                        colSpan={9}
                        className="px-6 py-12 text-center"
                      >
                        <Package
                          size={36}
                          className="mx-auto text-slate-300"
                        />

                        <p className="mt-3 text-sm font-medium text-slate-600">
                          No products found
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          Try changing your search or add a new
                          product.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((product) => {
                      const isDeleting =
                        deletingId === product.id;

                      const isLowStock =
                        product.stock <=
                        product.minimumStock;

                      return (
                        <tr
                          key={product.id}
                          className={`transition hover:bg-slate-50 ${
                            isDeleting
                              ? "opacity-50"
                              : ""
                          }`}
                        >
                          {/* Product */}

                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#063f3d]/10 text-[#063f3d]">
                                <Package size={18} />
                              </div>

                              <div>
                                <p className="text-sm font-semibold text-slate-800">
                                  {product.name}
                                </p>

                                <p className="mt-0.5 text-xs text-slate-400">
                                  {product.unit}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* SKU */}

                          <td className="px-6 py-4 text-sm text-slate-600">
                            {product.sku || "—"}
                          </td>

                          {/* Barcode */}

                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <Barcode
                                size={16}
                                className="text-slate-400"
                              />

                              {product.barcode || "—"}
                            </div>
                          </td>

                          {/* Category */}

                          <td className="px-6 py-4">
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                              {product.category}
                            </span>
                          </td>

                          {/* Purchase Price */}

                          <td className="px-6 py-4 text-right text-sm font-medium text-slate-700">
                            ₹
                            {product.purchasePrice.toLocaleString(
                              "en-IN",
                              {
                                minimumFractionDigits: 2,
                              }
                            )}
                          </td>

                          {/* Selling Price */}

                          <td className="px-6 py-4 text-right text-sm font-semibold text-slate-800">
                            ₹
                            {product.sellingPrice.toLocaleString(
                              "en-IN",
                              {
                                minimumFractionDigits: 2,
                              }
                            )}
                          </td>

                          {/* Stock */}

                          <td className="px-6 py-4 text-right">
                            <div>
                              <p
                                className={`text-sm font-semibold ${
                                  isLowStock
                                    ? "text-amber-600"
                                    : "text-slate-700"
                                }`}
                              >
                                {product.stock}
                              </p>

                              <p className="text-xs text-slate-400">
                                Min {product.minimumStock}
                              </p>
                            </div>
                          </td>

                          {/* Status */}

                          <td className="px-6 py-4 text-center">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                product.status ===
                                "Active"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              {product.status}
                            </span>
                          </td>

                          {/* Actions */}

                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-1">
                              {/* Edit */}

                              <Link
                                href={`/products/${product.id}/edit`}
                                title="Edit product"
                                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-[#063f3d]"
                              >
                                <Edit size={17} />
                              </Link>

                              {/* Delete */}

                              <button
  type="button"
  title="Delete product"
  onClick={() => setDeleteProduct(product)}
  className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
>
  <Trash2 size={17} />
</button>
                                
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* ============================================================= */}
            {/* TABLE FOOTER                                                    */}
            {/* ============================================================= */}

            <div className="border-t border-slate-100 px-6 py-4">
              <p className="text-xs text-slate-400">
                Showing{" "}
                <span className="font-semibold text-slate-600">
                  {filteredProducts.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-600">
                  {products.length}
                </span>{" "}
                products
              </p>
            </div>
          </div>
        </main>
      </div>
      {deleteProduct && (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
    onMouseDown={(e) => {
      if (e.target === e.currentTarget) {
        if (!deletingId) {
          setDeleteProduct(null);
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
              Delete Product?
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Are you sure you want to remove this product?
            </p>
          </div>
        </div>

        {/* Product */}

        <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#063f3d]/10 text-[#063f3d]">
              <Package size={20} />
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-800">
                {deleteProduct.name}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {deleteProduct.sku
                  ? `SKU: ${deleteProduct.sku}`
                  : "No SKU"}
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
                This product will be removed from active products.
              </p>

              <p className="mt-1 text-xs leading-5 text-amber-700">
                Existing sales and purchase history will be
                preserved. The product can no longer be used
                for new transactions.
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
          onClick={() => setDeleteProduct(null)}
          className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="button"
          disabled={deletingId === deleteProduct.id}
          onClick={handleDeleteProduct}
          className="flex items-center gap-2 rounded-xl bg-red-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Trash2
            size={17}
            className={
              deletingId === deleteProduct.id
                ? "animate-pulse"
                : ""
            }
          />

          {deletingId === deleteProduct.id
            ? "Deleting..."
            : "Delete Product"}
        </button>
      </div>
    </div>
  </div>
)}
    </div>
    
  );
}