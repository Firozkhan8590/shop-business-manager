"use client";

import {
  ArrowLeft,
  ImagePlus,
  Package,
  Save,
  Tag,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Sidebar from "../../components/Sidebar";
import {
  createProduct,
  type CreateProductInput,
} from "@/src/lib/products";

export default function CreateProductPage() {
  const router = useRouter();

  const [form, setForm] = useState<CreateProductInput>({
    name: "",
    sku: "",
    barcode: "",
    unit: "pcs",
    purchase_price: 0,
    selling_price: 0,
    current_stock: 0,
    minimum_stock: 0,
    category_id: null,
    image: null,
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function updateField(
    field: keyof CreateProductInput,
    value: string | number | null
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    if (!form.name?.trim()) {
      setError("Product name is required.");
      return;
    }

    try {
      setSaving(true);

      await createProduct({
        ...form,
        name: form.name.trim(),
        sku: form.sku?.trim() || null,
        barcode: form.barcode?.trim() || null,
      });

      // Product created successfully.
      // Navigate back to the product list.
      router.push("/products");
    } catch (err) {
      console.error("Create product error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to create product."
      );

      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />

      <div className="lg:pl-[260px]">
        {/* Header */}
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white">
          <div className="flex min-h-20 items-center gap-4 px-6 lg:px-8">
            <Link
              href="/products"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-[#063f3d]"
            >
              <ArrowLeft size={19} />
            </Link>

            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                Create Product
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Add a new product to your catalogue
              </p>
            </div>
          </div>
        </header>

        <main className="p-6 lg:p-8">
          <form
            onSubmit={handleSubmit}
            className="mx-auto max-w-5xl"
          >
            {/* Error Message */}
            {error && (
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
              {/* Main Details */}
              <div className="space-y-6 xl:col-span-2">
                {/* Basic Information */}
                <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="border-b border-slate-200 px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#063f3d]/10 text-[#063f3d]">
                        <Package size={20} />
                      </div>

                      <div>
                        <h2 className="font-semibold text-slate-800">
                          Basic Information
                        </h2>

                        <p className="text-sm text-slate-400">
                          Enter the main product details
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">
                    <InputField
                      label="Product Name"
                      required
                      placeholder="Example: Plastic Bucket"
                      value={form.name ?? ""}
                      onChange={(value) =>
                        updateField("name", value)
                      }
                    />

                    <InputField
                      label="SKU"
                      placeholder="Example: PB-001"
                      value={form.sku ?? ""}
                      onChange={(value) =>
                        updateField("sku", value)
                      }
                    />

                    <InputField
                      label="Barcode"
                      placeholder="Enter barcode"
                      value={form.barcode ?? ""}
                      onChange={(value) =>
                        updateField("barcode", value)
                      }
                    />

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Unit
                      </label>

                      <select
                        value={form.unit ?? "pcs"}
                        onChange={(event) =>
                          updateField(
                            "unit",
                            event.target.value
                          )
                        }
                        className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-[#063f3d] focus:ring-2 focus:ring-[#063f3d]/10"
                      >
                        <option value="pcs">
                          Pieces (pcs)
                        </option>
                        <option value="box">Box</option>
                        <option value="set">Set</option>
                        <option value="kg">
                          Kilogram (kg)
                        </option>
                        <option value="g">
                          Gram (g)
                        </option>
                        <option value="ltr">
                          Litre (ltr)
                        </option>
                        <option value="ml">
                          Millilitre (ml)
                        </option>
                        <option value="meter">
                          Meter
                        </option>
                      </select>
                    </div>

                    <InputField
                      label="Category ID"
                      placeholder="Leave empty for now"
                      type="number"
                      value={
                        form.category_id === null ||
                        form.category_id === undefined
                          ? ""
                          : String(form.category_id)
                      }
                      onChange={(value) =>
                        updateField(
                          "category_id",
                          value === ""
                            ? null
                            : Number(value)
                        )
                      }
                    />
                  </div>
                </section>

                {/* Pricing */}
                <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="border-b border-slate-200 px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#063f3d]/10 text-[#063f3d]">
                        <Tag size={20} />
                      </div>

                      <div>
                        <h2 className="font-semibold text-slate-800">
                          Pricing
                        </h2>

                        <p className="text-sm text-slate-400">
                          Set purchase and selling prices
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">
                    <InputField
                      label="Purchase Price"
                      required
                      type="number"
                      prefix="₹"
                      value={String(
                        form.purchase_price ?? 0
                      )}
                      onChange={(value) =>
                        updateField(
                          "purchase_price",
                          Number(value)
                        )
                      }
                    />

                    <InputField
                      label="Selling Price"
                      required
                      type="number"
                      prefix="₹"
                      value={String(
                        form.selling_price ?? 0
                      )}
                      onChange={(value) =>
                        updateField(
                          "selling_price",
                          Number(value)
                        )
                      }
                    />
                  </div>
                </section>

                {/* Stock */}
                <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="border-b border-slate-200 px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#063f3d]/10 text-[#063f3d]">
                        <Package size={20} />
                      </div>

                      <div>
                        <h2 className="font-semibold text-slate-800">
                          Stock
                        </h2>

                        <p className="text-sm text-slate-400">
                          Set the initial stock levels
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-2">
                    <InputField
                      label="Current Stock"
                      type="number"
                      value={String(
                        form.current_stock ?? 0
                      )}
                      onChange={(value) =>
                        updateField(
                          "current_stock",
                          Number(value)
                        )
                      }
                    />

                    <InputField
                      label="Minimum Stock"
                      type="number"
                      value={String(
                        form.minimum_stock ?? 0
                      )}
                      onChange={(value) =>
                        updateField(
                          "minimum_stock",
                          Number(value)
                        )
                      }
                    />
                  </div>
                </section>
              </div>

              {/* Right Side */}
              <div className="space-y-6">
                {/* Product Image */}
                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#063f3d]/10 text-[#063f3d]">
                      <ImagePlus size={20} />
                    </div>

                    <div>
                      <h2 className="font-semibold text-slate-800">
                        Product Image
                      </h2>

                      <p className="text-sm text-slate-400">
                        Optional
                      </p>
                    </div>
                  </div>

                  <div className="flex h-48 flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 text-center">
                    <ImagePlus
                      size={30}
                      className="mb-3 text-slate-300"
                    />

                    <p className="text-sm font-medium text-slate-500">
                      Image upload coming next
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      We will connect this to local image
                      storage
                    </p>
                  </div>
                </section>

                {/* Product Summary */}
                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="font-semibold text-slate-800">
                    Product Summary
                  </h2>

                  <div className="mt-5 space-y-4">
                    <SummaryRow
                      label="Purchase Price"
                      value={`₹${Number(
                        form.purchase_price ?? 0
                      ).toLocaleString("en-IN")}`}
                    />

                    <SummaryRow
                      label="Selling Price"
                      value={`₹${Number(
                        form.selling_price ?? 0
                      ).toLocaleString("en-IN")}`}
                    />

                    <SummaryRow
                      label="Initial Stock"
                      value={`${Number(
                        form.current_stock ?? 0
                      )} ${form.unit || "pcs"}`}
                    />

                    <div className="border-t border-slate-100 pt-4">
                      <SummaryRow
                        label="Margin"
                        value={`₹${(
                          Number(
                            form.selling_price ?? 0
                          ) -
                          Number(
                            form.purchase_price ?? 0
                          )
                        ).toLocaleString("en-IN")}`}
                        strong
                      />
                    </div>
                  </div>
                </section>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Link
                href="/products"
                className="flex h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={saving}
                className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#063f3d] px-7 text-sm font-semibold text-white shadow-sm transition hover:bg-[#052f2d] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Save size={18} />

                {saving ? "Saving..." : "Create Product"}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}

function InputField({
  label,
  required = false,
  placeholder,
  type = "text",
  prefix,
  value,
  onChange,
}: {
  label: string;
  required?: boolean;
  placeholder?: string;
  type?: string;
  prefix?: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}

        {required && (
          <span className="ml-1 text-red-500">*</span>
        )}
      </label>

      <div className="relative">
        {prefix && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400">
            {prefix}
          </span>
        )}

        <input
          type={type}
          min={type === "number" ? "0" : undefined}
          step={type === "number" ? "0.01" : undefined}
          placeholder={placeholder}
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          className={`h-12 w-full rounded-xl border border-slate-200 bg-white text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#063f3d] focus:ring-2 focus:ring-[#063f3d]/10 ${
            prefix ? "pl-9 pr-4" : "px-4"
          }`}
        />
      </div>
    </div>
  );
}

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