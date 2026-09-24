"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft,
    Loader2,
    Save,
    AlertCircle,
} from "lucide-react";



import {
    Expense,
    UpdateExpenseInput,
    getExpense,
    updateExpense,
} from "@/src/lib/expense";
import Sidebar from "@/app/components/Sidebar";

const EXPENSE_CATEGORIES = [
    "Rent",
    "Electricity",
    "Water",
    "Salary",
    "Transport",
    "Maintenance",
    "Office",
    "Food",
    "Purchase Related",
    "Other",
];

const PAYMENT_METHODS = [
    "cash",
    "upi",
    "bank",
    "card",
    "other",
];

function getTodayDate() {
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

function formatPaymentMethod(
    method: string
) {
    return method
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) =>
            char.toUpperCase()
        );
}

export default function EditExpensePage() {
    const router = useRouter();

    const params = useParams();

    const id = Number(params.id);

    const [expense, setExpense] =
        useState<Expense | null>(null);

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");

    const [formData, setFormData] =
        useState<UpdateExpenseInput>({
            category: "",
            description: "",
            amount: undefined,
            expense_date: getTodayDate(),
            payment_method: "cash",
            notes: "",
        });

    // ==========================================
    // LOAD EXPENSE
    // ==========================================

    useEffect(() => {
        if (!id || Number.isNaN(id)) {
            setError("Invalid expense ID.");
            setLoading(false);
            return;
        }

        loadExpense();
    }, [id]);

    async function loadExpense() {
        try {
            setLoading(true);
            setError("");

            const data =
                await getExpense(id);

            setExpense(data);

            setFormData({
                category:
                    data.category,

                description:
                    data.description,

                amount: Number(
                    data.amount
                ),

                expense_date:
                    data.expense_date.substring(
                        0,
                        10
                    ),

                payment_method:
                    data.payment_method ||
                    "cash",

                notes:
                    data.notes || "",
            });
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to load expense"
            );
        } finally {
            setLoading(false);
        }
    }

    // ==========================================
    // FORM FIELD
    // ==========================================

    function updateField(
        field: keyof UpdateExpenseInput,
        value: string | number | null
    ) {
        setFormData((current) => ({
            ...current,
            [field]: value,
        }));
    }

    // ==========================================
    // SUBMIT
    // ==========================================

    async function handleSubmit(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            if (
                !formData.category?.trim()
            ) {
                setError(
                    "Category is required."
                );
                return;
            }

            if (
                !formData.description?.trim()
            ) {
                setError(
                    "Description is required."
                );
                return;
            }

            if (
                formData.amount ===
                    undefined ||
                Number(formData.amount) <= 0
            ) {
                setError(
                    "Amount must be greater than 0."
                );
                return;
            }

            if (
                !formData.expense_date
            ) {
                setError(
                    "Expense date is required."
                );
                return;
            }

            const updateData:
                UpdateExpenseInput = {
                category:
                    formData.category.trim(),

                description:
                    formData.description.trim(),

                amount: Number(
                    formData.amount
                ),

                expense_date:
                    formData.expense_date,

                payment_method:
                    formData.payment_method ||
                    "cash",

                notes:
                    formData.notes?.trim() ||
                    null,
            };

            const updated =
                await updateExpense(
                    id,
                    updateData
                );

            setExpense(updated);

            setSuccess(
                "Expense updated successfully."
            );

            // Give user a moment to see success
            setTimeout(() => {
                router.push(
                    "/expenses"
                );
            }, 700);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to update expense"
            );
        } finally {
            setSaving(false);
        }
    }

    // ==========================================
    // LOADING
    // ==========================================

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50">
                <Sidebar />

                <main className="ml-0 min-h-screen lg:ml-[260px]">
                    <div className="flex min-h-screen items-center justify-center">

                        <div className="flex items-center gap-2 text-sm text-slate-500">

                            <Loader2
                                size={20}
                                className="animate-spin"
                            />

                            Loading expense...
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    // ==========================================
    // ERROR / NOT FOUND
    // ==========================================

    if (!expense) {
        return (
            <div className="min-h-screen bg-slate-50">
                <Sidebar />

                <main className="ml-0 min-h-screen lg:ml-[260px]">
                    <div className="p-4 sm:p-6 lg:p-8">

                        <button
                            type="button"
                            onClick={() =>
                                router.push(
                                    "/expenses"
                                )
                            }
                            className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
                        >
                            <ArrowLeft
                                size={17}
                            />

                            Back to Expenses
                        </button>

                        <div className="rounded-xl border border-red-200 bg-red-50 p-6">

                            <div className="flex items-start gap-3">

                                <AlertCircle
                                    size={21}
                                    className="mt-0.5 text-red-600"
                                />

                                <div>
                                    <h2 className="font-semibold text-red-800">
                                        Expense not found
                                    </h2>

                                    <p className="mt-1 text-sm text-red-700">
                                        {error ||
                                            "The requested expense could not be found."}
                                    </p>
                                </div>

                            </div>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    // ==========================================
    // PAGE
    // ==========================================

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar />

            <main className="ml-0 min-h-screen lg:ml-[260px]">
                <div className="p-4 sm:p-6 lg:p-8">

                    {/* ==========================================
                        HEADER
                    ========================================== */}

                    <div className="mb-8">

                        <button
                            type="button"
                            onClick={() =>
                                router.push(
                                    "/expenses"
                                )
                            }
                            className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
                        >
                            <ArrowLeft
                                size={17}
                            />

                            Back to Expenses
                        </button>

                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">
                                Edit Expense
                            </h1>

                            <p className="mt-1 text-sm text-slate-500">
                                Update expense
                                #{expense.id}
                            </p>
                        </div>
                    </div>

                    {/* ==========================================
                        ALERTS
                    ========================================== */}

                    {error && (
                        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3">

                            <div className="flex items-center gap-2 text-sm text-red-700">

                                <AlertCircle
                                    size={18}
                                />

                                {error}
                            </div>
                        </div>
                    )}

                    {success && (
                        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                            {success}
                        </div>
                    )}

                    {/* ==========================================
                        FORM
                    ========================================== */}

                    <div className="max-w-5xl rounded-xl border border-slate-200 bg-white shadow-sm">

                        <div className="border-b border-slate-200 px-5 py-5 sm:px-6">

                            <h2 className="text-lg font-semibold text-slate-900">
                                Expense Details
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Modify the expense information below.
                            </p>
                        </div>

                        <form
                            onSubmit={
                                handleSubmit
                            }
                        >
                            <div className="p-5 sm:p-6">

                                <div className="grid gap-5 md:grid-cols-2">

                                    {/* ==================================
                                        CATEGORY
                                    ================================== */}

                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                            Category
                                        </label>

                                        <select
                                            value={
                                                formData.category ||
                                                ""
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                updateField(
                                                    "category",
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                                            required
                                        >
                                            <option value="">
                                                Select category
                                            </option>

                                            {EXPENSE_CATEGORIES.map(
                                                (
                                                    item
                                                ) => (
                                                    <option
                                                        key={
                                                            item
                                                        }
                                                        value={
                                                            item
                                                        }
                                                    >
                                                        {
                                                            item
                                                        }
                                                    </option>
                                                )
                                            )}
                                        </select>
                                    </div>

                                    {/* ==================================
                                        DESCRIPTION
                                    ================================== */}

                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                            Description
                                        </label>

                                        <input
                                            type="text"
                                            value={
                                                formData.description ||
                                                ""
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                updateField(
                                                    "description",
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                            placeholder="e.g. Electricity bill"
                                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                                            required
                                        />
                                    </div>

                                    {/* ==================================
                                        AMOUNT
                                    ================================== */}

                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                            Amount
                                        </label>

                                        <div className="relative">

                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">
                                                ₹
                                            </span>

                                            <input
                                                type="number"
                                                min="0.01"
                                                step="0.01"
                                                value={
                                                    formData.amount ??
                                                    ""
                                                }
                                                onChange={(
                                                    event
                                                ) =>
                                                    updateField(
                                                        "amount",
                                                        event
                                                            .target
                                                            .value ===
                                                            ""
                                                            ? null
                                                            : Number(
                                                                  event
                                                                      .target
                                                                      .value
                                                              )
                                                    )
                                                }
                                                placeholder="0.00"
                                                className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-8 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* ==================================
                                        DATE
                                    ================================== */}

                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                            Expense Date
                                        </label>

                                        <input
                                            type="date"
                                            value={
                                                formData.expense_date ||
                                                ""
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                updateField(
                                                    "expense_date",
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                                            required
                                        />
                                    </div>

                                    {/* ==================================
                                        PAYMENT METHOD
                                    ================================== */}

                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                            Payment Method
                                        </label>

                                        <select
                                            value={
                                                formData.payment_method ||
                                                "cash"
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                updateField(
                                                    "payment_method",
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                                        >
                                            {PAYMENT_METHODS.map(
                                                (
                                                    method
                                                ) => (
                                                    <option
                                                        key={
                                                            method
                                                        }
                                                        value={
                                                            method
                                                        }
                                                    >
                                                        {formatPaymentMethod(
                                                            method
                                                        )}
                                                    </option>
                                                )
                                            )}
                                        </select>
                                    </div>

                                    {/* ==================================
                                        NOTES
                                    ================================== */}

                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                            Notes
                                        </label>

                                        <input
                                            type="text"
                                            value={
                                                formData.notes ||
                                                ""
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                updateField(
                                                    "notes",
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                            placeholder="Optional notes"
                                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                                        />
                                    </div>
                                </div>

                                {/* ==================================
                                    EXISTING RECORD INFO
                                ================================== */}

                                <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">

                                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                        Record Information
                                    </p>

                                    <div className="mt-3 grid gap-3 text-sm sm:grid-cols-3">

                                        <div>
                                            <p className="text-slate-400">
                                                Expense ID
                                            </p>

                                            <p className="font-medium text-slate-700">
                                                #
                                                {
                                                    expense.id
                                                }
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-slate-400">
                                                Created At
                                            </p>

                                            <p className="font-medium text-slate-700">
                                                {expense.created_at
                                                    ? new Date(
                                                          expense.created_at
                                                      ).toLocaleString(
                                                          "en-IN"
                                                      )
                                                    : "-"}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-slate-400">
                                                Created By
                                            </p>

                                            <p className="font-medium text-slate-700">
                                                {expense.created_by ??
                                                    "-"}
                                            </p>
                                        </div>

                                    </div>
                                </div>
                            </div>

                            {/* ==========================================
                                ACTIONS
                            ========================================== */}

                            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">

                                <button
                                    type="button"
                                    onClick={() =>
                                        router.push(
                                            "/expenses"
                                        )
                                    }
                                    disabled={
                                        saving
                                    }
                                    className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={
                                        saving
                                    }
                                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {saving ? (
                                        <>
                                            <Loader2
                                                size={
                                                    17
                                                }
                                                className="animate-spin"
                                            />

                                            Updating...
                                        </>
                                    ) : (
                                        <>
                                            <Save
                                                size={
                                                    17
                                                }
                                            />

                                            Update Expense
                                        </>
                                    )}
                                </button>

                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}