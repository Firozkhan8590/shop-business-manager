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
    Supplier,
    getSuppliers,
    deactivateSupplier,
} from "@/src/lib/supplier";

export default function SuppliersPage() {
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [deactivatingId, setDeactivatingId] =
        useState<number | null>(null);

    const [supplierToDeactivate, setSupplierToDeactivate] =
        useState<Supplier | null>(null);

    // =========================
    // Load Suppliers
    // =========================
    async function loadSuppliers(searchValue = "") {
        try {
            setLoading(true);
            setError("");

            const data = await getSuppliers(searchValue);

            setSuppliers(data);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to load suppliers"
            );
        } finally {
            setLoading(false);
        }
    }

    // Initial load
    useEffect(() => {
        loadSuppliers();
    }, []);

    // Search with debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            loadSuppliers(search);
        }, 300);

        return () => clearTimeout(timer);
    }, [search]);

    // =========================
    // Deactivate Supplier
    // =========================
    async function handleDeactivate() {
        if (!supplierToDeactivate) return;

        try {
            setDeactivatingId(supplierToDeactivate.id);
            setError("");

            await deactivateSupplier(
                supplierToDeactivate.id
            );

            // Remove from active list
            setSuppliers((current) =>
                current.filter(
                    (item) =>
                        item.id !== supplierToDeactivate.id
                )
            );

            setSupplierToDeactivate(null);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to deactivate supplier"
            );
        } finally {
            setDeactivatingId(null);
        }
    }

    // =========================
    // Summary
    // =========================

    // Total current balance of all active suppliers
    const totalSupplierBalance = suppliers.reduce(
        (total, supplier) =>
            total + Number(supplier.current_balance ?? 0),
        0
    );

    // Original opening balance
    // This should remain historical and unchanged.
    const totalOpeningBalance = suppliers.reduce(
        (total, supplier) =>
            total + Number(supplier.opening_balance ?? 0),
        0
    );

    return (
        <div className="min-h-screen bg-slate-50">
            <Sidebar />

            <main className="ml-0 min-h-screen lg:ml-[260px]">
                <div className="p-4 sm:p-6 lg:p-8">

                    {/* =========================
                        Header
                    ========================= */}
                    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">
                                Suppliers
                            </h1>

                            <p className="mt-1 text-sm text-slate-500">
                                Manage your suppliers and their payable
                                accounts.
                            </p>
                        </div>

                        <Link
                            href="/suppliers/new"
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800"
                        >
                            <Plus size={18} />
                            Add Supplier
                        </Link>
                    </div>

                    {/* =========================
                        Summary Cards
                    ========================= */}
                    <div className="mb-6 grid gap-4 sm:grid-cols-2">

                        {/* Active Suppliers */}
                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="flex items-center justify-between">

                                <div>
                                    <p className="text-sm text-slate-500">
                                        Active Suppliers
                                    </p>

                                    <p className="mt-1 text-2xl font-bold text-slate-900">
                                        {suppliers.length}
                                    </p>
                                </div>

                                <div className="rounded-lg bg-teal-50 p-3 text-teal-700">
                                    <Users size={22} />
                                </div>

                            </div>
                        </div>

                        {/* Total Supplier Balance */}
                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                            <div className="flex items-center justify-between">

                                <div>
                                    <p className="text-sm text-slate-500">
                                        Total Supplier Balance
                                    </p>

                                    <p className="mt-1 text-2xl font-bold text-slate-900">
                                        ₹
                                        {totalSupplierBalance.toLocaleString(
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

                    {/* =========================
                        Search
                    ========================= */}
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
                                placeholder="Search by supplier name or phone..."
                                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                            />

                        </div>
                    </div>

                    {/* =========================
                        Error
                    ========================= */}
                    {error && (
                        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    {/* =========================
                        Loading
                    ========================= */}
                    {loading ? (

                        <div className="flex min-h-[300px] items-center justify-center rounded-xl border border-slate-200 bg-white">

                            <div className="flex items-center gap-2 text-sm text-slate-500">

                                <Loader2
                                    size={18}
                                    className="animate-spin"
                                />

                                Loading suppliers...

                            </div>

                        </div>

                    ) : suppliers.length === 0 ? (

                        /* =========================
                           Empty State
                        ========================= */
                        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-center">

                            <div className="mb-4 rounded-full bg-slate-100 p-4 text-slate-500">
                                <Users size={28} />
                            </div>

                            <h2 className="text-lg font-semibold text-slate-900">
                                {search
                                    ? "No suppliers found"
                                    : "No suppliers yet"}
                            </h2>

                            <p className="mt-1 max-w-md text-sm text-slate-500">
                                {search
                                    ? "Try a different supplier name or phone number."
                                    : "Add your first supplier to start managing supplier accounts."}
                            </p>

                            {!search && (
                                <Link
                                    href="/suppliers/new"
                                    className="mt-5 inline-flex items-center gap-2 rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
                                >
                                    <Plus size={18} />
                                    Add Supplier
                                </Link>
                            )}

                        </div>

                    ) : (

                        /* =========================
                           Supplier Table
                        ========================= */
                        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

                            <div className="overflow-x-auto">

                                <table className="w-full min-w-[950px]">

                                    {/* Table Header */}
                                    <thead className="border-b border-slate-200 bg-slate-50">

                                        <tr>

                                            <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                Supplier
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

                                    {/* Table Body */}
                                    <tbody className="divide-y divide-slate-100">

                                        {suppliers.map((supplier) => (

                                            <tr
                                                key={supplier.id}
                                                className="transition hover:bg-slate-50"
                                            >

                                                {/* Supplier */}
                                                <td className="px-5 py-4">

                                                    <div className="flex items-center gap-3">

                                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-50 font-semibold text-teal-700">
                                                            {supplier.name
                                                                .charAt(0)
                                                                .toUpperCase()}
                                                        </div>

                                                        <div>

                                                            <p className="font-semibold text-slate-900">
                                                                {supplier.name}
                                                            </p>

                                                            <p className="text-xs text-slate-400">
                                                                #{supplier.id}
                                                            </p>

                                                        </div>

                                                    </div>

                                                </td>

                                                {/* Contact */}
                                                <td className="px-5 py-4">

                                                    {supplier.phone ? (

                                                        <div className="flex items-center gap-2 text-sm text-slate-700">

                                                            <Phone
                                                                size={15}
                                                                className="text-slate-400"
                                                            />

                                                            {supplier.phone}

                                                        </div>

                                                    ) : (

                                                        <span className="text-sm text-slate-400">
                                                            No phone
                                                        </span>

                                                    )}

                                                </td>

                                                {/* Address */}
                                                <td className="px-5 py-4">

                                                    {supplier.address ? (

                                                        <div className="flex max-w-[220px] items-start gap-2 text-sm text-slate-600">

                                                            <MapPin
                                                                size={15}
                                                                className="mt-0.5 shrink-0 text-slate-400"
                                                            />

                                                            <span className="truncate">
                                                                {supplier.address}
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
                                                                    supplier.current_balance ?? 0
                                                                ) > 0
                                                                    ? "text-red-600"
                                                                    : "text-green-600"
                                                            }`}
                                                        >
                                                            ₹
                                                            {Number(
                                                                supplier.current_balance ?? 0
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
                                                                supplier.opening_balance_remaining ?? 0
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
                                                            href={`/suppliers/${supplier.id}/edit`}
                                                            title="Edit supplier"
                                                            className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-3 py-2 text-slate-700 transition hover:bg-slate-50"
                                                        >
                                                            <Pencil size={16} />
                                                        </Link>

                                                        {/* Deactivate */}
                                                        <button
                                                            type="button"
                                                            title="Deactivate supplier"
                                                            onClick={() =>
                                                                setSupplierToDeactivate(
                                                                    supplier
                                                                )
                                                            }
                                                            disabled={
                                                                deactivatingId ===
                                                                supplier.id
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

            {/* =========================
                Deactivate Modal
            ========================= */}
            {supplierToDeactivate && (

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
                                        Deactivate Supplier?
                                    </h2>

                                    <p className="mt-1 text-sm text-slate-500">
                                        Are you sure you want to deactivate
                                        this supplier?
                                    </p>

                                </div>

                            </div>

                            {/* Supplier Card */}
                            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">

                                <div className="flex items-center gap-3">

                                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-teal-50 text-teal-700">
                                        <UserRound size={21} />
                                    </div>

                                    <div className="min-w-0">

                                        <p className="truncate font-semibold text-slate-900">
                                            {supplierToDeactivate.name}
                                        </p>

                                        <p className="text-sm text-slate-500">
                                            {supplierToDeactivate.phone ||
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
                                            This supplier will be removed from
                                            active suppliers.
                                        </p>

                                        <p className="mt-1 text-sm leading-5 text-amber-700">
                                            Existing purchases, payments and
                                            payable history will be preserved.
                                            The supplier can no longer be used
                                            for new transactions.
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
                                    setSupplierToDeactivate(null)
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
                                        Deactivate Supplier
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