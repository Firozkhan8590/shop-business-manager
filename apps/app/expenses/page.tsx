"use client";

import { useEffect, useState } from "react";
import {
    Search,
    Plus,
    Pencil,
    Trash2,
    Wallet,
    CalendarDays,
    Receipt,
    IndianRupee,
    Loader2,
    AlertTriangle,
    RefreshCw,
    X,
} from "lucide-react";

import Sidebar from "../components/Sidebar";

import {
    Expense,
    CreateExpenseInput,
    UpdateExpenseInput,
    createExpense,
    deleteExpense,
    getExpenses,
    updateExpense,
} from "@/src/lib/expense";

type DateFilter =
    | "today"
    | "all"
    | "custom";

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

function formatDate(date: string) {
    if (!date) return "-";

    const dateOnly = date.substring(0, 10);

    const parts = dateOnly.split("-");

    if (parts.length !== 3) {
        return date;
    }

    return `${parts[2]}-${parts[1]}-${parts[0]}`;
}

function formatCurrency(
    value: string | number
) {
    return `₹${Number(value || 0).toLocaleString(
        "en-IN",
        {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }
    )}`;
}

function formatPaymentMethod(
    method: string
) {
    if (!method) return "-";

    return method
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) =>
            char.toUpperCase()
        );
}

export default function ExpensesPage() {
    const [expenses, setExpenses] =
        useState<Expense[]>([]);

    // Backend summary
    const [summary, setSummary] = useState({
        totalAmount: 0,
        todayAmount: 0,
        monthAmount: 0,
        transactionCount: 0,
    });

    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");

    // ==========================================
    // FILTERS
    // ==========================================

    const [search, setSearch] =
        useState("");

    const [category, setCategory] =
        useState("");

    const [paymentMethod, setPaymentMethod] =
        useState("");

    const [dateFilter, setDateFilter] =
        useState<DateFilter>("today");

    const [customDate, setCustomDate] =
        useState(getTodayDate());

    // ==========================================
    // FORM
    // ==========================================

    const [showForm, setShowForm] =
        useState(false);

    const [editingExpense, setEditingExpense] =
        useState<Expense | null>(null);

    const [formData, setFormData] =
        useState<CreateExpenseInput>({
            category: "",
            description: "",
            amount: 0,
            expense_date: getTodayDate(),
            payment_method: "cash",
            notes: "",
        });

    const [formLoading, setFormLoading] =
        useState(false);

    // ==========================================
    // DELETE
    // ==========================================

    const [expenseToDelete, setExpenseToDelete] =
        useState<Expense | null>(null);

    const [deletingId, setDeletingId] =
        useState<number | null>(null);

    // ==========================================
    // LOAD EXPENSES
    // ==========================================

    async function loadExpenses(
        showRefreshLoader = false
    ) {
        try {
            if (showRefreshLoader) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");

            const query: {
                search?: string;
                category?: string;
                payment_method?: string;
                start_date?: string;
                end_date?: string;
                page?: number;
                limit?: number;
            } = {
                page: 1,
                limit: 100,
            };

            // Search
            if (search.trim()) {
                query.search =
                    search.trim();
            }

            // Category
            if (category) {
                query.category =
                    category;
            }

            // Payment method
            if (paymentMethod) {
                query.payment_method =
                    paymentMethod;
            }

            // Today filter
            if (dateFilter === "today") {
                const today =
                    getTodayDate();

                query.start_date =
                    today;

                query.end_date =
                    today;
            }

            // Custom date filter
            if (dateFilter === "custom") {
                query.start_date =
                    customDate;

                query.end_date =
                    customDate;
            }

            const result =
                await getExpenses(query);

            // ==========================================
            // TABLE DATA
            // ==========================================

            setExpenses(
                result.data || []
            );

            // ==========================================
            // BACKEND SUMMARY
            // Backend is the source of truth
            // ==========================================

            setSummary({
                totalAmount: Number(
                    result.summary
                        ?.totalAmount || 0
                ),

                todayAmount: Number(
                    result.summary
                        ?.todayAmount || 0
                ),

                monthAmount: Number(
                    result.summary
                        ?.monthAmount || 0
                ),

                transactionCount: Number(
                    result.summary
                        ?.transactionCount || 0
                ),
            });
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to load expenses"
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    async function handleRefresh() {
        await loadExpenses(true);
    }

    // ==========================================
    // LOAD WHEN FILTER CHANGES
    // ==========================================

    useEffect(() => {
        const timer = setTimeout(() => {
            loadExpenses();
        }, 300);

        return () =>
            clearTimeout(timer);
    }, [
        search,
        category,
        paymentMethod,
        dateFilter,
        customDate,
    ]);

    // ==========================================
    // SUCCESS MESSAGE
    // ==========================================

    useEffect(() => {
        if (!success) return;

        const timer = setTimeout(() => {
            setSuccess("");
        }, 3000);

        return () =>
            clearTimeout(timer);
    }, [success]);

    // ==========================================
    // CREATE FORM
    // ==========================================

    function openCreateForm() {
        setEditingExpense(null);

        setFormData({
            category: "",
            description: "",
            amount: 0,
            expense_date:
                getTodayDate(),
            payment_method: "cash",
            notes: "",
        });

        setError("");
        setShowForm(true);
    }

    // ==========================================
    // EDIT FORM
    // ==========================================

    function openEditForm(
        expense: Expense
    ) {
        setEditingExpense(expense);

        setFormData({
            category: expense.category,

            description:
                expense.description,

            amount: Number(
                expense.amount
            ),

            expense_date:
                expense.expense_date,

            payment_method:
                expense.payment_method ||
                "cash",

            notes:
                expense.notes || "",
        });

        setError("");
        setShowForm(true);
    }

    // ==========================================
    // CLOSE FORM
    // ==========================================

    function closeForm() {
        if (formLoading) return;

        setShowForm(false);
        setEditingExpense(null);
    }

    // ==========================================
    // UPDATE FORM FIELD
    // ==========================================

    function updateFormField(
        field: keyof CreateExpenseInput,
        value:
            | string
            | number
            | null
    ) {
        setFormData((current) => ({
            ...current,
            [field]: value,
        }));
    }

    // ==========================================
    // CREATE / UPDATE
    // ==========================================

    async function handleSubmit(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        try {
            setFormLoading(true);
            setError("");
            setSuccess("");

            if (
                !formData.category.trim() ||
                !formData.description.trim()
            ) {
                setError(
                    "Category and description are required."
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
                    "Expense date is required."
                );

                return;
            }

            if (editingExpense) {
                const updateData: UpdateExpenseInput =
                {
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

                await updateExpense(
                    editingExpense.id,
                    updateData
                );

                setSuccess(
                    "Expense updated successfully."
                );
            } else {
                const createData:
                    CreateExpenseInput = {
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

                await createExpense(
                    createData
                );

                setSuccess(
                    "Expense recorded successfully."
                );
            }

            setShowForm(false);
            setEditingExpense(null);

            // Refresh table + backend summary
            await loadExpenses();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : editingExpense
                        ? "Failed to update expense"
                        : "Failed to create expense"
            );
        } finally {
            setFormLoading(false);
        }
    }

    // ==========================================
    // DELETE
    // ==========================================

    async function handleDelete() {
        if (!expenseToDelete) return;

        try {
            setDeletingId(
                expenseToDelete.id
            );

            setError("");
            setSuccess("");

            await deleteExpense(
                expenseToDelete.id
            );

            setExpenseToDelete(null);

            setSuccess(
                "Expense deleted successfully."
            );

            // Refresh backend summary
            await loadExpenses();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to delete expense"
            );
        } finally {
            setDeletingId(null);
        }
    }

    // ==========================================
    // CLEAR FILTERS
    // ==========================================

    function clearFilters() {
        setSearch("");
        setCategory("");
        setPaymentMethod("");
        setDateFilter("today");
        setCustomDate(
            getTodayDate()
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar />

            <main className="ml-0 min-h-screen lg:ml-[260px]">
                <div className="p-4 sm:p-6 lg:p-8">

                    {/* ==========================================
                        HEADER
                    ========================================== */}

                    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">
                                Expenses
                            </h1>

                            <p className="mt-1 text-sm text-slate-500">
                                Manage your shop expenses
                                and payment records.
                            </p>
                        </div>

                        <div className="flex items-center gap-2">

                            {/* Refresh */}
                            <button
                                type="button"
                                onClick={handleRefresh}
                                disabled={refreshing}
                                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <RefreshCw
                                    size={17}
                                    className={
                                        refreshing
                                            ? "animate-spin"
                                            : ""
                                    }
                                />

                                {refreshing
                                    ? "Refreshing..."
                                    : "Refresh"}
                            </button>

                            {/* Record Expense */}
                            <button
                                type="button"
                                onClick={
                                    openCreateForm
                                }
                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800"
                            >
                                <Plus size={18} />

                                Record Expense
                            </button>
                        </div>
                    </div>

                    {/* ==========================================
                        ALERTS
                    ========================================== */}

                    {success && (
                        <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                            {success}
                        </div>
                    )}

                    {error && (
                        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    {/* ==========================================
                        SUMMARY
                        BACKEND SOURCE OF TRUTH
                    ========================================== */}

                    <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                        {/* Total */}
                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="flex items-center justify-between">

                                <div>
                                    <p className="text-sm text-slate-500">
                                        Total Expenses
                                    </p>

                                    <p className="mt-1 text-2xl font-bold text-slate-900">
                                        {formatCurrency(
                                            summary.totalAmount
                                        )}
                                    </p>
                                </div>

                                <div className="rounded-lg bg-teal-50 p-3 text-teal-700">
                                    <Wallet
                                        size={22}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Today */}
                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="flex items-center justify-between">

                                <div>
                                    <p className="text-sm text-slate-500">
                                        Today
                                    </p>

                                    <p className="mt-1 text-2xl font-bold text-slate-900">
                                        {formatCurrency(
                                            summary.todayAmount
                                        )}
                                    </p>
                                </div>

                                <div className="rounded-lg bg-blue-50 p-3 text-blue-700">
                                    <CalendarDays
                                        size={22}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Month */}
                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="flex items-center justify-between">

                                <div>
                                    <p className="text-sm text-slate-500">
                                        This Month
                                    </p>

                                    <p className="mt-1 text-2xl font-bold text-slate-900">
                                        {formatCurrency(
                                            summary.monthAmount
                                        )}
                                    </p>
                                </div>

                                <div className="rounded-lg bg-purple-50 p-3 text-purple-700">
                                    <IndianRupee
                                        size={22}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Transactions */}
                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="flex items-center justify-between">

                                <div>
                                    <p className="text-sm text-slate-500">
                                        Transactions
                                    </p>

                                    <p className="mt-1 text-2xl font-bold text-slate-900">
                                        {
                                            summary.transactionCount
                                        }
                                    </p>
                                </div>

                                <div className="rounded-lg bg-amber-50 p-3 text-amber-700">
                                    <Receipt
                                        size={22}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ==========================================
                        EXPENSE FORM
                    ========================================== */}

                    {showForm && (
                        <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

                            <div className="mb-5 flex items-center justify-between">

                                <div>
                                    <h2 className="text-lg font-semibold text-slate-900">
                                        {editingExpense
                                            ? "Edit Expense"
                                            : "Record Expense"}
                                    </h2>

                                    <p className="mt-1 text-sm text-slate-500">
                                        {editingExpense
                                            ? "Update the expense details below."
                                            : "Enter the details of the shop expense."}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={
                                        closeForm
                                    }
                                    disabled={
                                        formLoading
                                    }
                                    className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <form
                                onSubmit={
                                    handleSubmit
                                }
                            >
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">

                                    {/* Category */}
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                            Category
                                        </label>

                                        <select
                                            value={
                                                formData.category
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                updateFormField(
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

                                    {/* Description */}
                                    <div>
                                        <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                            Description
                                        </label>

                                        <input
                                            type="text"
                                            value={
                                                formData.description
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                updateFormField(
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

                                    {/* Amount */}
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
                                                    formData.amount ||
                                                    ""
                                                }
                                                onChange={(
                                                    event
                                                ) =>
                                                    updateFormField(
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
                                        </label>

                                        <input
                                            type="date"
                                            value={
                                                formData.expense_date
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                updateFormField(
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
                                                updateFormField(
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
                                                updateFormField(
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

                                {/* Form Actions */}
                                <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                                    <button
                                        type="button"
                                        onClick={
                                            closeForm
                                        }
                                        disabled={
                                            formLoading
                                        }
                                        className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={
                                            formLoading
                                        }
                                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {formLoading ? (
                                            <>
                                                <Loader2
                                                    size={
                                                        17
                                                    }
                                                    className="animate-spin"
                                                />

                                                {editingExpense
                                                    ? "Updating..."
                                                    : "Saving..."}
                                            </>
                                        ) : (
                                            <>
                                                <Plus
                                                    size={
                                                        17
                                                    }
                                                />

                                                {editingExpense
                                                    ? "Update Expense"
                                                    : "Record Expense"}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* ==========================================
                        FILTERS
                    ========================================== */}

                    <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">

                        <div className="grid gap-3 lg:grid-cols-[minmax(260px,1fr)_180px_180px_auto]">

                            {/* Search */}
                            <div className="relative">

                                <Search
                                    size={18}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                />

                                <input
                                    type="text"
                                    value={search}
                                    onChange={(
                                        event
                                    ) =>
                                        setSearch(
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                    placeholder="Search expenses..."
                                    className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                                />
                            </div>

                            {/* Category */}
                            <select
                                value={category}
                                onChange={(
                                    event
                                ) =>
                                    setCategory(
                                        event
                                            .target
                                            .value
                                    )
                                }
                                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                            >
                                <option value="">
                                    All Categories
                                </option>

                                {EXPENSE_CATEGORIES.map(
                                    (item) => (
                                        <option
                                            key={
                                                item
                                            }
                                            value={
                                                item
                                            }
                                        >
                                            {item}
                                        </option>
                                    )
                                )}
                            </select>

                            {/* Payment Method */}
                            <select
                                value={
                                    paymentMethod
                                }
                                onChange={(
                                    event
                                ) =>
                                    setPaymentMethod(
                                        event
                                            .target
                                            .value
                                    )
                                }
                                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                            >
                                <option value="">
                                    All Methods
                                </option>

                                {PAYMENT_METHODS.map(
                                    (method) => (
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

                            {/* Clear */}
                            <button
                                type="button"
                                onClick={
                                    clearFilters
                                }
                                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                            >
                                <X size={16} />
                                Clear
                            </button>
                        </div>

                        {/* Date Filters */}
                        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">

                            <span className="mr-1 text-sm font-medium text-slate-600">
                                Date:
                            </span>

                            <button
                                type="button"
                                onClick={() =>
                                    setDateFilter(
                                        "today"
                                    )
                                }
                                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${dateFilter ===
                                        "today"
                                        ? "bg-teal-700 text-white"
                                        : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
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
                                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${dateFilter ===
                                        "all"
                                        ? "bg-teal-700 text-white"
                                        : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                                    }`}
                            >
                                All Expenses
                            </button>

                            <button
                                type="button"
                                onClick={() =>
                                    setDateFilter(
                                        "custom"
                                    )
                                }
                                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${dateFilter ===
                                        "custom"
                                        ? "bg-teal-700 text-white"
                                        : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
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
                                        onChange={(
                                            event
                                        ) =>
                                            setCustomDate(
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                                    />
                                )}
                        </div>
                    </div>

                    {/* ==========================================
                        EXPENSE HISTORY
                    ========================================== */}

                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

                        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">

                            <div>
                                <h2 className="font-semibold text-slate-900">
                                    Expense History
                                </h2>

                                <p className="mt-1 text-xs text-slate-500">
                                    {
                                        expenses.length
                                    }{" "}
                                    transaction
                                    {expenses.length !==
                                        1
                                        ? "s"
                                        : ""}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={handleRefresh}
                                disabled={refreshing}
                                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                            >
                                <RefreshCw
                                    size={15}
                                    className={
                                        refreshing
                                            ? "animate-spin"
                                            : ""
                                    }
                                />

                                {refreshing
                                    ? "Refreshing..."
                                    : "Refresh"}
                            </button>
                        </div>

                        {loading ? (
                            <div className="flex min-h-[300px] items-center justify-center">

                                <div className="flex items-center gap-2 text-sm text-slate-500">

                                    <Loader2
                                        size={18}
                                        className="animate-spin"
                                    />

                                    Loading expenses...
                                </div>
                            </div>
                        ) : expenses.length ===
                            0 ? (
                            <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">

                                <div className="mb-4 rounded-full bg-slate-100 p-4 text-slate-500">
                                    <Receipt
                                        size={28}
                                    />
                                </div>

                                <h2 className="text-lg font-semibold text-slate-900">
                                    No expenses found
                                </h2>

                                <p className="mt-1 max-w-md text-sm text-slate-500">
                                    {search ||
                                        category ||
                                        paymentMethod ||
                                        dateFilter !==
                                        "all"
                                        ? "Try changing your filters or record a new expense."
                                        : "Record your first expense to start tracking shop expenses."}
                                </p>

                                <button
                                    type="button"
                                    onClick={
                                        openCreateForm
                                    }
                                    className="mt-5 inline-flex items-center gap-2 rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800"
                                >
                                    <Plus
                                        size={18}
                                    />

                                    Record Expense
                                </button>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">

                                <table className="w-full min-w-[1000px]">

                                    <thead className="border-b border-slate-200 bg-slate-50">

                                        <tr>

                                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                Date
                                            </th>

                                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                Category
                                            </th>

                                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                Description
                                            </th>

                                            <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                Amount
                                            </th>

                                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                Method
                                            </th>

                                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                Notes
                                            </th>

                                            <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                Actions
                                            </th>

                                        </tr>

                                    </thead>

                                    <tbody className="divide-y divide-slate-100">

                                        {expenses.map(
                                            (
                                                expense
                                            ) => (
                                                <tr
                                                    key={
                                                        expense.id
                                                    }
                                                    className="transition hover:bg-slate-50"
                                                >

                                                    {/* Date */}
                                                    <td className="px-5 py-4">

                                                        <div className="flex items-center gap-2 text-sm text-slate-700">

                                                            <CalendarDays
                                                                size={
                                                                    15
                                                                }
                                                                className="text-slate-400"
                                                            />

                                                            {formatDate(
                                                                expense.expense_date
                                                            )}

                                                        </div>

                                                    </td>

                                                    {/* Category */}
                                                    <td className="px-5 py-4">

                                                        <span className="inline-flex rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700">
                                                            {
                                                                expense.category
                                                            }
                                                        </span>

                                                    </td>

                                                    {/* Description */}
                                                    <td className="px-5 py-4">

                                                        <div className="max-w-[240px]">

                                                            <p className="truncate font-medium text-slate-900">
                                                                {
                                                                    expense.description
                                                                }
                                                            </p>

                                                            <p className="mt-0.5 text-xs text-slate-400">
                                                                #
                                                                {
                                                                    expense.id
                                                                }
                                                            </p>

                                                        </div>

                                                    </td>

                                                    {/* Amount */}
                                                    <td className="px-5 py-4 text-right">

                                                        <span className="font-semibold text-slate-900">
                                                            {formatCurrency(
                                                                expense.amount
                                                            )}
                                                        </span>

                                                    </td>

                                                    {/* Method */}
                                                    <td className="px-5 py-4">

                                                        <span className="text-sm text-slate-700">
                                                            {formatPaymentMethod(
                                                                expense.payment_method
                                                            )}
                                                        </span>

                                                    </td>

                                                    {/* Notes */}
                                                    <td className="px-5 py-4">

                                                        {expense.notes ? (
                                                            <span
                                                                className="block max-w-[180px] truncate text-sm text-slate-500"
                                                                title={
                                                                    expense.notes
                                                                }
                                                            >
                                                                {
                                                                    expense.notes
                                                                }
                                                            </span>
                                                        ) : (
                                                            <span className="text-sm text-slate-400">
                                                                -
                                                            </span>
                                                        )}

                                                    </td>

                                                    {/* Actions */}
                                                    <td className="px-5 py-4">

                                                        <div className="flex justify-end gap-2">

                                                            {/* Edit */}
                                                            <button
                                                                type="button"
                                                                title="Edit expense"
                                                                onClick={() =>
                                                                    openEditForm(
                                                                        expense
                                                                    )
                                                                }
                                                                className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-3 py-2 text-slate-700 transition hover:bg-slate-50"
                                                            >
                                                                <Pencil
                                                                    size={
                                                                        16
                                                                    }
                                                                />
                                                            </button>

                                                            {/* Delete */}
                                                            <button
                                                                type="button"
                                                                title="Delete expense"
                                                                onClick={() =>
                                                                    setExpenseToDelete(
                                                                        expense
                                                                    )
                                                                }
                                                                disabled={
                                                                    deletingId ===
                                                                    expense.id
                                                                }
                                                                className="inline-flex items-center justify-center rounded-lg border border-red-200 px-3 py-2 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                                            >
                                                                <Trash2
                                                                    size={
                                                                        16
                                                                    }
                                                                />
                                                            </button>

                                                        </div>

                                                    </td>

                                                </tr>
                                            )
                                        )}

                                    </tbody>

                                </table>

                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* ==========================================
                DELETE CONFIRMATION MODAL
            ========================================== */}

            {/* ==========================================
    DELETE EXPENSE CONFIRMATION MODAL
========================================== */}

            {expenseToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 backdrop-blur-sm">

                    <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">

                        {/* ==========================================
                MODAL CONTENT
            ========================================== */}

                        <div className="p-6">

                            {/* Header */}
                            <div className="flex items-start gap-4">

                                {/* Warning Icon */}
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-500">
                                    <AlertTriangle
                                        size={24}
                                    />
                                </div>

                                {/* Title */}
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900">
                                        Delete Expense?
                                    </h2>

                                    <p className="mt-1 text-sm text-slate-500">
                                        Are you sure you want to delete this expense?
                                    </p>
                                </div>

                            </div>

                            {/* ==========================================
                    EXPENSE DETAILS
                ========================================== */}

                            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">

                                <div className="flex items-start gap-3">

                                    {/* Expense Icon */}
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-600">
                                        <Wallet
                                            size={20}
                                        />
                                    </div>

                                    {/* Details */}
                                    <div className="min-w-0 flex-1">

                                        <p className="truncate font-semibold text-slate-900">
                                            {
                                                expenseToDelete.description
                                            }
                                        </p>

                                        <p className="mt-1 text-sm text-slate-500">
                                            {
                                                expenseToDelete.category
                                            }
                                        </p>

                                        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">

                                            <span>
                                                #
                                                {
                                                    expenseToDelete.id
                                                }
                                            </span>

                                            <span>
                                                {formatDate(
                                                    expenseToDelete.expense_date
                                                )}
                                            </span>

                                            <span>
                                                {formatPaymentMethod(
                                                    expenseToDelete.payment_method
                                                )}
                                            </span>

                                        </div>

                                    </div>

                                    {/* Amount */}
                                    <div className="shrink-0 text-right">

                                        <p className="text-sm font-bold text-slate-900">
                                            {formatCurrency(
                                                expenseToDelete.amount
                                            )}
                                        </p>

                                    </div>

                                </div>

                            </div>

                            {/* ==========================================
                    WARNING BOX
                ========================================== */}

                            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">

                                <div className="flex items-start gap-3">

                                    <AlertTriangle
                                        size={19}
                                        className="mt-0.5 shrink-0 text-amber-600"
                                    />

                                    <div>

                                        <p className="text-sm font-semibold text-amber-800">
                                            This expense will be permanently deleted.
                                        </p>

                                        <p className="mt-1 text-sm leading-5 text-amber-700">
                                            This action cannot be undone.
                                            The expense will be removed from
                                            your expense records.
                                        </p>

                                    </div>

                                </div>

                            </div>

                        </div>

                        {/* ==========================================
                FOOTER
            ========================================== */}

                        <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">

                            {/* Cancel */}
                            <button
                                type="button"
                                onClick={() =>
                                    setExpenseToDelete(
                                        null
                                    )
                                }
                                disabled={
                                    deletingId !== null
                                }
                                className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            {/* Delete */}
                            <button
                                type="button"
                                onClick={
                                    handleDelete
                                }
                                disabled={
                                    deletingId !== null
                                }
                                className="inline-flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                            >

                                {deletingId !== null ? (
                                    <>
                                        <Loader2
                                            size={17}
                                            className="animate-spin"
                                        />

                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <Trash2
                                            size={17}
                                        />

                                        Delete Expense
                                    </>
                                )}

                            </button>

                        </div>

                    </div>

                </div>
            )}
        </div>
    );
}