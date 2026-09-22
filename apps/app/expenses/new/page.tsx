"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    Receipt,
    Save,
    Loader2,
} from "lucide-react";

import Sidebar from "../../components/Sidebar";
import {
    CreateExpenseInput,
    createExpense,
} from "@/src/lib/expense";

const PAYMENT_METHODS = [
    "cash",
    "upi",
    "bank",
    "card",
    "other",
];

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

function getTodayDate() {
    return new Date().toISOString().split("T")[0];
}

function formatPaymentMethod(method: string) {
    return method
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) =>
            char.toUpperCase()
        );
}

export default function NewExpensePage() {
    const router = useRouter();

    const [formData, setFormData] =
        useState<CreateExpenseInput>({
            category: "",
            description: "",
            amount: 0,
            expense_date: getTodayDate(),
            payment_method: "cash",
            notes: "",
        });

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    function updateField(
        field: keyof CreateExpenseInput,
        value: string | number | null
    ) {
        setFormData((current) => ({
            ...current,
            [field]: value,
        }));
    }

    async function handleSubmit(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        try {
            setLoading(true);
            setError("");

            if (!formData.category.trim()) {
                setError(
                    "Please select an expense category."
                );
                return;
            }

            if (!formData.description.trim()) {
                setError(
                    "Please enter an expense description."
                );
                return;
            }

            if (
                !formData.amount ||
                Number(formData.amount) <= 0
            ) {
                setError(
                    "Expense amount must be greater than 0."
                );
                return;
            }

            if (!formData.expense_date) {
                setError(
                    "Please select the expense date."
                );
                return;
            }

            const data: CreateExpenseInput = {
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

            await createExpense(data);

            router.push("/expenses");
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to create expense"
            );
        } finally {
            setLoading(false);
        }
    }

    function handleClear() {
        setFormData({
            category: "",
            description: "",
            amount: 0,
            expense_date: getTodayDate(),
            payment_method: "cash",
            notes: "",
        });

        setError("");
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar />

            <main className="ml-0 min-h-screen lg:ml-[260px]">
                <div className="p-4 sm:p-6 lg:p-8">

                    {/* Header */}
                    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                        <div>
                            <button
                                type="button"
                                onClick={() =>
                                    router.push(
                                        "/expenses"
                                    )
                                }
                                className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
                            >
                                <ArrowLeft
                                    size={17}
                                />
                                Back to Expenses
                            </button>

                            <h1 className="text-2xl font-bold text-slate-900">
                                Record Expense
                            </h1>

                            <p className="mt-1 text-sm text-slate-500">
                                Add a new shop expense
                                to your records.
                            </p>
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    {/* Form Card */}
                    <div className="max-w-4xl rounded-xl border border-slate-200 bg-white shadow-sm">

                        {/* Card Header */}
                        <div className="border-b border-slate-200 px-6 py-5">
                            <div className="flex items-center gap-3">

                                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                                    <Receipt
                                        size={22}
                                    />
                                </div>

                                <div>
                                    <h2 className="font-semibold text-slate-900">
                                        Expense Details
                                    </h2>

                                    <p className="mt-1 text-xs text-slate-500">
                                        Enter the expense
                                        information below.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Form */}
                        <form
                            onSubmit={
                                handleSubmit
                            }
                            className="p-6"
                        >
                            <div className="grid gap-5 md:grid-cols-2">

                                {/* Category */}
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Category
                                        <span className="ml-1 text-red-500">
                                            *
                                        </span>
                                    </label>

                                    <select
                                        value={
                                            formData.category
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
                                                category
                                            ) => (
                                                <option
                                                    key={
                                                        category
                                                    }
                                                    value={
                                                        category
                                                    }
                                                >
                                                    {
                                                        category
                                                    }
                                                </option>
                                            )
                                        )}
                                    </select>
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Description
                                        <span className="ml-1 text-red-500">
                                            *
                                        </span>
                                    </label>

                                    <input
                                        type="text"
                                        value={
                                            formData.description
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
                                        placeholder="e.g. Shop electricity bill"
                                        maxLength={
                                            255
                                        }
                                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                                        required
                                    />
                                </div>

                                {/* Amount */}
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Amount
                                        <span className="ml-1 text-red-500">
                                            *
                                        </span>
                                    </label>

                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-500">
                                            ₹
                                        </span>

                                        <input
                                            type="number"
                                            min="0.01"
                                            step="0.01"
                                            value={
                                                formData.amount ||
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
                                                        ? 0
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

                                {/* Date */}
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Expense Date
                                        <span className="ml-1 text-red-500">
                                            *
                                        </span>
                                    </label>

                                    <input
                                        type="date"
                                        value={
                                            formData.expense_date
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

                                {/* Payment Method */}
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

                                {/* Notes */}
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
                                        maxLength={
                                            1000
                                        }
                                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                                    />
                                </div>
                            </div>

                            {/* Bottom Summary */}
                            <div className="mt-6 rounded-xl border border-teal-100 bg-teal-50 p-4">
                                <div className="flex items-center justify-between">

                                    <div>
                                        <p className="text-sm font-medium text-teal-800">
                                            Expense Amount
                                        </p>

                                        <p className="mt-1 text-xs text-teal-600">
                                            This amount will be
                                            recorded as a shop
                                            expense.
                                        </p>
                                    </div>

                                    <p className="text-xl font-bold text-teal-800">
                                        ₹
                                        {Number(
                                            formData.amount ||
                                            0
                                        ).toLocaleString(
                                            "en-IN",
                                            {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            }
                                        )}
                                    </p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="mt-6 flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">

                                <button
                                    type="button"
                                    onClick={
                                        handleClear
                                    }
                                    disabled={
                                        loading
                                    }
                                    className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    Clear
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        router.push(
                                            "/expenses"
                                        )
                                    }
                                    disabled={
                                        loading
                                    }
                                    className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={
                                        loading
                                    }
                                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2
                                                size={
                                                    17
                                                }
                                                className="animate-spin"
                                            />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save
                                                size={
                                                    17
                                                }
                                            />
                                            Record Expense
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