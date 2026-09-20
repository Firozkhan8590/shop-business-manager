"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  UserPlus,
  Loader2,
} from "lucide-react";

import Sidebar from "../../components/Sidebar";
import { createCustomer, CreateCustomerInput } from "@/src/lib/customer";


export default function NewCustomerPage() {
  const router = useRouter();

  const [form, setForm] = useState<CreateCustomerInput>({
    name: "",
    phone: "",
    address: "",
    opening_balance: 0,
    notes: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(
    field: keyof CreateCustomerInput,
    value: string | number
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!form.name?.trim()) {
      setError("Customer name is required");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const customerData: CreateCustomerInput = {
        name: form.name.trim(),
        phone: form.phone?.trim() || null,
        address: form.address?.trim() || null,
        opening_balance:
          Number(form.opening_balance) || 0,
        notes: form.notes?.trim() || null,
      };

      await createCustomer(customerData);

      router.push("/customers");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create customer"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />

      <main className="ml-0 min-h-screen lg:ml-[260px]">
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/customers"
              className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800"
            >
              <ArrowLeft size={17} />
              Back to Customers
            </Link>

            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-teal-50 p-3 text-teal-700">
                <UserPlus size={22} />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Add Customer
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Create a new customer account.
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="max-w-3xl"
          >
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-6 py-5">
                <h2 className="font-semibold text-slate-900">
                  Customer Details
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Enter the basic information for this
                  customer.
                </p>
              </div>

              <div className="space-y-6 p-6">
                {/* Name */}
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Customer Name
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </label>

                  <input
                    id="name"
                    type="text"
                    value={form.name}
                    onChange={(event) =>
                      handleChange(
                        "name",
                        event.target.value
                      )
                    }
                    placeholder="Enter customer name"
                    className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label
                    htmlFor="phone"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Phone Number
                  </label>

                  <input
                    id="phone"
                    type="tel"
                    value={form.phone ?? ""}
                    onChange={(event) =>
                      handleChange(
                        "phone",
                        event.target.value
                      )
                    }
                    placeholder="Enter phone number"
                    className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                  />
                </div>

                {/* Address */}
                <div>
                  <label
                    htmlFor="address"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Address
                  </label>

                  <textarea
                    id="address"
                    value={form.address ?? ""}
                    onChange={(event) =>
                      handleChange(
                        "address",
                        event.target.value
                      )
                    }
                    placeholder="Enter customer address"
                    rows={3}
                    className="w-full resize-none rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                  />
                </div>

                {/* Opening Balance */}
                <div>
                  <label
                    htmlFor="opening_balance"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Opening Balance
                  </label>

                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-500">
                      ₹
                    </span>

                    <input
                      id="opening_balance"
                      type="number"
                      min="0"
                      step="0.01"
                      value={
                        form.opening_balance ?? 0
                      }
                      onChange={(event) =>
                        handleChange(
                          "opening_balance",
                          Number(event.target.value)
                        )
                      }
                      className="w-full rounded-lg border border-slate-200 py-2.5 pl-8 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                    />
                  </div>

                  <p className="mt-1.5 text-xs text-slate-400">
                    Amount already owed by the customer
                    when their account is created.
                  </p>
                </div>

                {/* Notes */}
                <div>
                  <label
                    htmlFor="notes"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Notes
                  </label>

                  <textarea
                    id="notes"
                    value={form.notes ?? ""}
                    onChange={(event) =>
                      handleChange(
                        "notes",
                        event.target.value
                      )
                    }
                    placeholder="Optional notes"
                    rows={3}
                    className="w-full resize-none rounded-lg border border-slate-200 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                  />
                </div>

                {/* Error */}
                {error && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row sm:justify-end">
                <Link
                  href="/customers"
                  className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </Link>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />
                      Saving...
                    </>
                  ) : (
                    <>
                      <UserPlus size={17} />
                      Save Customer
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}