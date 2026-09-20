"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    Search,
    Plus,
    Pencil,
    Users,
    Phone,
    MapPin,
    Wallet,
    Loader2,
    Trash2,
    UserRound,
    AlertTriangle,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import {
    Customer,
    deactivateCustomer,
    getCustomers,
} from "@/src/lib/customer";

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [deactivatingId, setDeactivatingId] =
        useState<number | null>(null);

    const [customerToDeactivate, setCustomerToDeactivate] =
        useState<Customer | null>(null);

    async function loadCustomers(searchValue = "") {
        try {
            setLoading(true);
            setError("");

            const data = await getCustomers(searchValue);

            setCustomers(data);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to load customers"
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadCustomers();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            loadCustomers(search);
        }, 300);

        return () => clearTimeout(timer);
    }, [search]);

    async function handleDeactivate() {
        if (!customerToDeactivate) return;

        try {
            setDeactivatingId(customerToDeactivate.id);
            setError("");

            await deactivateCustomer(customerToDeactivate.id);

            setCustomers((current) =>
                current.filter(
                    (item) =>
                        item.id !== customerToDeactivate.id
                )
            );

            setCustomerToDeactivate(null);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to deactivate customer"
            );
        } finally {
            setDeactivatingId(null);
        }
    }

    /*
     * Total current balance of all active customers.
     */
    const totalCustomerBalance = customers.reduce(
        (total, customer) =>
            total + Number(customer.current_balance ?? 0),
        0
    );

    /*
     * Total original opening balance.
     * This is historical data and should NOT change after payments.
     */
    const totalOpeningBalance = customers.reduce(
        (total, customer) =>
            total + Number(customer.opening_balance ?? 0),
        0
    );

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar />

            <main className="ml-0 min-h-screen lg:ml-[260px]">
                <div className="p-4 sm:p-6 lg:p-8">

                    {/* Header */}
                    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">
                                Customers
                            </h1>

                            <p className="mt-1 text-sm text-slate-500">
                                Manage your customers and their account
                                balances.
                            </p>
                        </div>

                        <Link
                            href="/customers/new"
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800"
                        >
                            <Plus size={18} />
                            Add Customer
                        </Link>
                    </div>

                    {/* Summary */}
                    <div className="mb-6 grid gap-4 sm:grid-cols-2">

                        {/* Active Customers */}
                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-500">
                                        Active Customers
                                    </p>

                                    <p className="mt-1 text-2xl font-bold text-slate-900">
                                        {customers.length}
                                    </p>
                                </div>

                                <div className="rounded-lg bg-teal-50 p-3 text-teal-700">
                                    <Users size={22} />
                                </div>
                            </div>
                        </div>

                        {/* Total Customer Balance */}
                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-500">
                                        Total Customer Balance
                                    </p>

                                    <p className="mt-1 text-2xl font-bold text-slate-900">
                                        ₹
                                        {totalCustomerBalance.toLocaleString(
                                            "en-IN",
                                            {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            }
                                        )}
                                    </p>

                                    <p className="mt-1 text-xs text-slate-400">
                                        Original opening balance: ₹
                                        {totalOpeningBalance.toLocaleString(
                                            "en-IN",
                                            {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            }
                                        )}
                                    </p>
                                </div>

                                <div className="rounded-lg bg-blue-50 p-3 text-blue-700">
                                    <Wallet size={22} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="relative">
                            <Search
                                size={18}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />

                            <input
                                type="text"
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Search by customer name or phone..."
                                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                            />
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    {/* Loading */}
                    {loading ? (
                        <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-slate-200 bg-white">
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                <Loader2
                                    size={18}
                                    className="animate-spin"
                                />
                                Loading customers...
                            </div>
                        </div>
                    ) : customers.length === 0 ? (
                        /* Empty state */
                        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-center">
                            <div className="mb-4 rounded-full bg-slate-100 p-4 text-slate-500">
                                <Users size={28} />
                            </div>

                            <h2 className="text-lg font-semibold text-slate-900">
                                {search
                                    ? "No customers found"
                                    : "No customers yet"}
                            </h2>

                            <p className="mt-1 max-w-md text-sm text-slate-500">
                                {search
                                    ? "Try a different customer name or phone number."
                                    : "Add your first customer to start managing customer accounts."}
                            </p>

                            {!search && (
                                <Link
                                    href="/customers/new"
                                    className="mt-5 inline-flex items-center gap-2 rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
                                >
                                    <Plus size={18} />
                                    Add Customer
                                </Link>
                            )}
                        </div>
                    ) : (
                        /* Customer table */
                        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[950px]">

                                    <thead className="border-b border-slate-200 bg-slate-50">
                                        <tr>
                                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                Customer
                                            </th>

                                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                Contact
                                            </th>

                                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                Address
                                            </th>

                                            <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                Current Balance
                                            </th>

                                            <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody className="divide-y divide-slate-100">
                                        {customers.map((customer) => (
                                            <tr
                                                key={customer.id}
                                                className="transition hover:bg-slate-50"
                                            >
                                                {/* Customer */}
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-50 font-semibold text-teal-700">
                                                            {customer.name
                                                                .charAt(0)
                                                                .toUpperCase()}
                                                        </div>

                                                        <div>
                                                            <p className="font-semibold text-slate-900">
                                                                {customer.name}
                                                            </p>

                                                            <p className="text-xs text-slate-400">
                                                                #{customer.id}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Contact */}
                                                <td className="px-5 py-4">
                                                    {customer.phone ? (
                                                        <div className="flex items-center gap-2 text-sm text-slate-700">
                                                            <Phone
                                                                size={15}
                                                                className="text-slate-400"
                                                            />
                                                            {customer.phone}
                                                        </div>
                                                    ) : (
                                                        <span className="text-sm text-slate-400">
                                                            No phone
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Address */}
                                                <td className="px-5 py-4">
                                                    {customer.address ? (
                                                        <div className="flex max-w-[220px] items-start gap-2 text-sm text-slate-600">
                                                            <MapPin
                                                                size={15}
                                                                className="mt-0.5 shrink-0 text-slate-400"
                                                            />

                                                            <span className="truncate">
                                                                {customer.address}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-sm text-slate-400">
                                                            No address
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Current Balance */}
                                                <td className="px-5 py-4 text-right">
                                                    <div className="flex flex-col items-end">

                                                        <span
                                                            className={`font-semibold ${
                                                                Number(
                                                                    customer.current_balance ?? 0
                                                                ) > 0
                                                                    ? "text-red-600"
                                                                    : "text-green-600"
                                                            }`}
                                                        >
                                                            ₹
                                                            {Number(
                                                                customer.current_balance ?? 0
                                                            ).toLocaleString(
                                                                "en-IN",
                                                                {
                                                                    minimumFractionDigits: 2,
                                                                    maximumFractionDigits: 2,
                                                                }
                                                            )}
                                                        </span>

                                                        <span className="mt-1 text-xs text-slate-400">
                                                            Opening remaining: ₹
                                                            {Number(
                                                                customer.opening_balance_remaining ?? 0
                                                            ).toLocaleString(
                                                                "en-IN",
                                                                {
                                                                    minimumFractionDigits: 2,
                                                                    maximumFractionDigits: 2,
                                                                }
                                                            )}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Actions */}
                                                <td className="px-5 py-4">
                                                    <div className="flex justify-end gap-2">

                                                        {/* Edit */}
                                                        <Link
                                                            href={`/customers/${customer.id}/edit`}
                                                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                                                            title="Edit customer"
                                                        >
                                                            <Pencil size={16} />
                                                        </Link>

                                                        {/* Deactivate */}
                                                        <button
                                                            type="button"
                                                            title="Deactivate customer"
                                                            onClick={() =>
                                                                setCustomerToDeactivate(
                                                                    customer
                                                                )
                                                            }
                                                            disabled={
                                                                deactivatingId ===
                                                                customer.id
                                                            }
                                                            className="inline-flex items-center justify-center rounded-lg border border-red-200 px-3 py-2 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Deactivate Confirmation Modal */}
            {customerToDeactivate && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4 backdrop-blur-sm">

                    <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">

                        {/* Modal Header */}
                        <div className="p-6">
                            <div className="flex items-start gap-4">

                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-500">
                                    <AlertTriangle size={24} />
                                </div>

                                <div>
                                    <h2 className="text-lg font-bold text-slate-900">
                                        Deactivate Customer?
                                    </h2>

                                    <p className="mt-1 text-sm text-slate-500">
                                        Are you sure you want to deactivate
                                        this customer?
                                    </p>
                                </div>
                            </div>

                            {/* Customer Card */}
                            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
                                <div className="flex items-center gap-3">

                                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                                        <UserRound size={21} />
                                    </div>

                                    <div className="min-w-0">
                                        <p className="truncate font-semibold text-slate-900">
                                            {customerToDeactivate.name}
                                        </p>

                                        <p className="text-sm text-slate-500">
                                            {customerToDeactivate.phone ||
                                                "No phone number"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Warning */}
                            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
                                <div className="flex items-start gap-3">

                                    <AlertTriangle
                                        size={19}
                                        className="mt-0.5 shrink-0 text-amber-600"
                                    />

                                    <div>
                                        <p className="text-sm font-semibold text-amber-800">
                                            This customer will be removed from
                                            active customers.
                                        </p>

                                        <p className="mt-1 text-sm leading-5 text-amber-700">
                                            Existing sales, payment and account
                                            history will be preserved. The
                                            customer can no longer be used for
                                            new transactions.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Actions */}
                        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row sm:justify-end">

                            <button
                                type="button"
                                onClick={() =>
                                    setCustomerToDeactivate(null)
                                }
                                disabled={deactivatingId !== null}
                                className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handleDeactivate}
                                disabled={deactivatingId !== null}
                                className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {deactivatingId !== null ? (
                                    <>
                                        <Loader2
                                            size={17}
                                            className="animate-spin"
                                        />
                                        Deactivating...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 size={17} />
                                        Deactivate Customer
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