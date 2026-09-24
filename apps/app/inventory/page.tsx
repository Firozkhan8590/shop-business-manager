"use client";

import { useEffect, useState } from "react";

import {
    AlertTriangle,
    ArrowDownCircle,
    ArrowUpCircle,
    Boxes,
    History,
    Package,
    RefreshCw,
    Search,
    SlidersHorizontal,
    X,
} from "lucide-react";

import Sidebar from "../components/Sidebar";

import {
    adjustStock,
    getInventory,
    getStockMovements,
    InventoryItem,
    StockMovement,
} from "@/src/lib/inventory";

type StockFilter =
    | "all"
    | "low"
    | "out";

export default function InventoryPage() {
    /* ============================================================
       INVENTORY STATE
    ============================================================ */

    const [inventory, setInventory] =
        useState<InventoryItem[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [refreshing, setRefreshing] =
        useState(false);

    const [error, setError] =
        useState("");

    const [search, setSearch] =
        useState("");

    const [filter, setFilter] =
        useState<StockFilter>("all");

    const [page, setPage] =
        useState(1);

    const limit = 10;

    const [totalPages, setTotalPages] =
        useState(1);

    /* ============================================================
       ADJUSTMENT MODAL
    ============================================================ */

    const [showAdjustment, setShowAdjustment] =
        useState(false);

    const [selectedProduct, setSelectedProduct] =
        useState<InventoryItem | null>(null);

    const [adjustmentQuantity, setAdjustmentQuantity] =
        useState("");

    const [adjustmentReason, setAdjustmentReason] =
        useState("");

    const [adjusting, setAdjusting] =
        useState(false);

    /* ============================================================
       MOVEMENT MODAL
    ============================================================ */

    const [showMovements, setShowMovements] =
        useState(false);

    const [movementProduct, setMovementProduct] =
        useState<InventoryItem | null>(null);

    const [movements, setMovements] =
        useState<StockMovement[]>([]);

    const [movementLoading, setMovementLoading] =
        useState(false);

    /* ============================================================
       FETCH INVENTORY
    ============================================================ */

    const fetchInventory = async (
        showRefresh = false
    ) => {
        try {
            if (showRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");

            const response =
                await getInventory({
                    page,
                    limit,
                    search:
                        search.trim() ||
                        undefined,
                    low_stock:
                        filter === "low"
                            ? true
                            : undefined,
                    out_of_stock:
                        filter === "out"
                            ? true
                            : undefined,
                });

            setInventory(
                response.data || []
            );

            setTotalPages(
                response.pagination
                    ?.totalPages || 1
            );
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to load inventory"
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    /* ============================================================
       LOAD INVENTORY
    ============================================================ */

    useEffect(() => {
        fetchInventory();
    }, [
        page,
        filter,
        search,
    ]);

    /* ============================================================
       STOCK HELPERS
    ============================================================ */

    const getStockStatus = (
        item: InventoryItem
    ) => {
        const current =
            Number(
                item.current_stock || 0
            );

        const minimum =
            Number(
                item.minimum_stock || 0
            );

        if (current <= 0) {
            return "out";
        }

        if (
            minimum > 0 &&
            current <= minimum
        ) {
            return "low";
        }

        return "normal";
    };

    /* ============================================================
       ADJUSTMENT
    ============================================================ */

    const openAdjustment = (
        product: InventoryItem
    ) => {
        setSelectedProduct(product);
        setAdjustmentQuantity("");
        setAdjustmentReason("");
        setShowAdjustment(true);
    };

    const closeAdjustment = () => {
        if (adjusting) return;

        setShowAdjustment(false);
        setSelectedProduct(null);
        setAdjustmentQuantity("");
        setAdjustmentReason("");
    };

    const handleAdjustment = async () => {
        if (!selectedProduct) {
            return;
        }

        const quantity =
            Number(
                adjustmentQuantity
            );

        if (
            !Number.isFinite(quantity) ||
            quantity === 0
        ) {
            alert(
                "Please enter a valid quantity."
            );
            return;
        }

        if (
            !adjustmentReason.trim()
        ) {
            alert(
                "Please enter a reason."
            );
            return;
        }

        const currentStock =
            Number(
                selectedProduct.current_stock
            );

        const newStock =
            currentStock + quantity;

        if (newStock < 0) {
            alert(
                `Stock cannot become negative. Current stock: ${currentStock}`
            );
            return;
        }

        try {
            setAdjusting(true);

            await adjustStock({
                product_id:
                    selectedProduct.product_id,
                quantity,
                reason:
                    adjustmentReason.trim(),
            });

            setShowAdjustment(false);
            setSelectedProduct(null);

            setAdjustmentQuantity("");
            setAdjustmentReason("");

            await fetchInventory(true);
        } catch (err) {
            alert(
                err instanceof Error
                    ? err.message
                    : "Failed to adjust stock"
            );
        } finally {
            setAdjusting(false);
        }
    };

    /* ============================================================
       MOVEMENT HISTORY
    ============================================================ */

    const openMovements = async (
        product: InventoryItem
    ) => {
        setMovementProduct(product);
        setShowMovements(true);
        setMovementLoading(true);
        setMovements([]);

        try {
            const response =
                await getStockMovements(
                    product.product_id,
                    {
                        page: 1,
                        limit: 100,
                    }
                );

            setMovements(
                response.data || []
            );
        } catch (err) {
            alert(
                err instanceof Error
                    ? err.message
                    : "Failed to load stock movements"
            );
        } finally {
            setMovementLoading(false);
        }
    };

    const closeMovements = () => {
        setShowMovements(false);
        setMovementProduct(null);
        setMovements([]);
    };

    /* ============================================================
       SUMMARY
    ============================================================ */

    const totalProducts =
        inventory.length;

    const lowStockCount =
        inventory.filter(
            (item) =>
                getStockStatus(item) ===
                "low"
        ).length;

    const outOfStockCount =
        inventory.filter(
            (item) =>
                getStockStatus(item) ===
                "out"
        ).length;

    /* ============================================================
       RENDER
    ============================================================ */

    return (
        <div className="min-h-screen bg-slate-50">

            {/* =====================================================
                SIDEBAR
                Fixed sidebar remains above content.
                Do NOT reduce its z-index.
            ===================================================== */}

            <Sidebar />

            {/* =====================================================
                MAIN CONTENT

                Sidebar width = 260px
                Therefore desktop content starts after 260px.
            ===================================================== */}

            <main className="min-w-0 lg:ml-[260px]">

                <div className="p-4 md:p-6">

                    <div className="mx-auto max-w-7xl">

                        {/* =================================================
                            HEADER
                        ================================================= */}

                        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

                            <div className="flex items-center gap-3">

                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-600 text-white shadow-sm">
                                    <Boxes
                                        size={23}
                                    />
                                </div>

                                <div>
                                    <h1 className="text-2xl font-bold text-slate-900">
                                        Inventory
                                    </h1>

                                    <p className="text-sm text-slate-500">
                                        Manage your current stock and movements
                                    </p>
                                </div>

                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    fetchInventory(
                                        true
                                    )
                                }
                                disabled={
                                    refreshing
                                }
                                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <RefreshCw
                                    size={17}
                                    className={
                                        refreshing
                                            ? "animate-spin"
                                            : ""
                                    }
                                />

                                Refresh
                            </button>

                        </div>

                        {/* =================================================
                            SUMMARY CARDS
                        ================================================= */}

                        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">

                            {/* Products */}

                            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

                                <div className="flex items-center justify-between">

                                    <div>
                                        <p className="text-sm font-medium text-slate-500">
                                            Products
                                        </p>

                                        <p className="mt-1 text-2xl font-bold text-slate-900">
                                            {
                                                totalProducts
                                            }
                                        </p>
                                    </div>

                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-green-600">
                                        <Package
                                            size={21}
                                        />
                                    </div>

                                </div>

                            </div>

                            {/* Low Stock */}

                            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

                                <div className="flex items-center justify-between">

                                    <div>
                                        <p className="text-sm font-medium text-slate-500">
                                            Low Stock
                                        </p>

                                        <p className="mt-1 text-2xl font-bold text-amber-600">
                                            {
                                                lowStockCount
                                            }
                                        </p>
                                    </div>

                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                                        <AlertTriangle
                                            size={21}
                                        />
                                    </div>

                                </div>

                            </div>

                            {/* Out of Stock */}

                            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

                                <div className="flex items-center justify-between">

                                    <div>
                                        <p className="text-sm font-medium text-slate-500">
                                            Out of Stock
                                        </p>

                                        <p className="mt-1 text-2xl font-bold text-red-600">
                                            {
                                                outOfStockCount
                                            }
                                        </p>
                                    </div>

                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-600">
                                        <AlertTriangle
                                            size={21}
                                        />
                                    </div>

                                </div>

                            </div>

                        </div>

                        {/* =================================================
                            SEARCH + FILTERS
                        ================================================= */}

                        <div className="mb-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">

                            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">

                                {/* Search */}

                                <div className="relative w-full lg:max-w-md">

                                    <Search
                                        size={18}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                    />

                                    <input
                                        type="text"
                                        value={
                                            search
                                        }
                                        onChange={(
                                            e
                                        ) => {
                                            setSearch(
                                                e.target
                                                    .value
                                            );

                                            setPage(
                                                1
                                            );
                                        }}
                                        placeholder="Search product..."
                                        className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-black placeholder:text-black outline-none transition focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-100"
                                    />

                                </div>

                                {/* Filters */}

                                <div className="flex items-center gap-2 overflow-x-auto">

                                    <SlidersHorizontal
                                        size={17}
                                        className="shrink-0 text-slate-400"
                                    />

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setFilter(
                                                "all"
                                            );
                                            setPage(
                                                1
                                            );
                                        }}
                                        className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition ${filter ===
                                                "all"
                                                ? "bg-green-600 text-white"
                                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                            }`}
                                    >
                                        All
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setFilter(
                                                "low"
                                            );
                                            setPage(
                                                1
                                            );
                                        }}
                                        className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition ${filter ===
                                                "low"
                                                ? "bg-amber-500 text-white"
                                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                            }`}
                                    >
                                        Low Stock
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setFilter(
                                                "out"
                                            );
                                            setPage(
                                                1
                                            );
                                        }}
                                        className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition ${filter ===
                                                "out"
                                                ? "bg-red-500 text-white"
                                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                            }`}
                                    >
                                        Out of Stock
                                    </button>

                                </div>

                            </div>

                        </div>

                        {/* =================================================
                            ERROR
                        ================================================= */}

                        {error && (
                            <div className="mb-4 flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">

                                <span>
                                    {
                                        error
                                    }
                                </span>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setError(
                                            ""
                                        )
                                    }
                                >
                                    <X
                                        size={
                                            17
                                        }
                                    />
                                </button>

                            </div>
                        )}

                        {/* =================================================
                            TABLE
                        ================================================= */}

                        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

                            {loading ? (

                                <div className="flex min-h-[350px] items-center justify-center">

                                    <div className="flex flex-col items-center gap-3 text-slate-500">

                                        <RefreshCw
                                            size={26}
                                            className="animate-spin text-green-600"
                                        />

                                        <p className="text-sm">
                                            Loading inventory...
                                        </p>

                                    </div>

                                </div>

                            ) : inventory.length ===
                                0 ? (

                                <div className="flex min-h-[350px] flex-col items-center justify-center px-6 text-center">

                                    <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                                        <Package
                                            size={26}
                                        />
                                    </div>

                                    <h3 className="font-semibold text-slate-800">
                                        No products found
                                    </h3>

                                    <p className="mt-1 text-sm text-slate-500">
                                        Try changing your search or filter.
                                    </p>

                                </div>

                            ) : (

                                <>
                                    <div className="overflow-x-auto">

                                        <table className="w-full min-w-[850px]">

                                            <thead>

                                                <tr className="border-b border-slate-200 bg-slate-50">

                                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                        Product
                                                    </th>

                                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                        Unit
                                                    </th>

                                                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                        Current Stock
                                                    </th>

                                                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                        Minimum
                                                    </th>

                                                    <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                        Status
                                                    </th>

                                                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                        Actions
                                                    </th>

                                                </tr>

                                            </thead>

                                            <tbody className="divide-y divide-slate-100">

                                                {inventory.map(
                                                    (
                                                        item
                                                    ) => {

                                                        const status =
                                                            getStockStatus(
                                                                item
                                                            );

                                                        return (
                                                            <tr
                                                                key={
                                                                    item.product_id
                                                                }
                                                                className="transition hover:bg-slate-50"
                                                            >

                                                                <td className="px-5 py-4">

                                                                    <div className="flex items-center gap-3">

                                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-50 text-green-600">
                                                                            <Package
                                                                                size={
                                                                                    19
                                                                                }
                                                                            />
                                                                        </div>

                                                                        <div>

                                                                            <p className="font-medium text-slate-900">
                                                                                {
                                                                                    item.product_name
                                                                                }
                                                                            </p>

                                                                            <p className="text-xs text-slate-400">
                                                                                ID:{" "}
                                                                                {
                                                                                    item.product_id
                                                                                }
                                                                            </p>

                                                                        </div>

                                                                    </div>

                                                                </td>

                                                                <td className="px-5 py-4 text-sm text-slate-600">
                                                                    {
                                                                        item.unit
                                                                    }
                                                                </td>

                                                                <td className="px-5 py-4 text-right">

                                                                    <span
                                                                        className={`text-base font-bold ${status ===
                                                                                "out"
                                                                                ? "text-red-600"
                                                                                : status ===
                                                                                    "low"
                                                                                    ? "text-amber-600"
                                                                                    : "text-slate-900"
                                                                            }`}
                                                                    >
                                                                        {
                                                                            item.current_stock
                                                                        }
                                                                    </span>

                                                                </td>

                                                                <td className="px-5 py-4 text-right text-sm text-slate-500">
                                                                    {
                                                                        item.minimum_stock
                                                                    }
                                                                </td>

                                                                <td className="px-5 py-4 text-center">

                                                                    {status ===
                                                                        "out" ? (

                                                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">

                                                                            <span className="h-1.5 w-1.5 rounded-full bg-red-500" />

                                                                            Out of Stock

                                                                        </span>

                                                                    ) : status ===
                                                                        "low" ? (

                                                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-600">

                                                                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />

                                                                            Low Stock

                                                                        </span>

                                                                    ) : (

                                                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-600">

                                                                            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />

                                                                            In Stock

                                                                        </span>

                                                                    )}

                                                                </td>

                                                                <td className="px-5 py-4">

                                                                    <div className="flex justify-end gap-2">

                                                                        <button
                                                                            type="button"
                                                                            onClick={() =>
                                                                                openAdjustment(
                                                                                    item
                                                                                )
                                                                            }
                                                                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:border-green-200 hover:bg-green-50 hover:text-green-700"
                                                                        >

                                                                            <SlidersHorizontal
                                                                                size={
                                                                                    15
                                                                                }
                                                                            />

                                                                            Adjust

                                                                        </button>

                                                                        <button
                                                                            type="button"
                                                                            onClick={() =>
                                                                                openMovements(
                                                                                    item
                                                                                )
                                                                            }
                                                                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:border-green-200 hover:bg-green-50 hover:text-green-700"
                                                                        >

                                                                            <History
                                                                                size={
                                                                                    15
                                                                                }
                                                                            />

                                                                            History

                                                                        </button>

                                                                    </div>

                                                                </td>

                                                            </tr>
                                                        );
                                                    }
                                                )}

                                            </tbody>

                                        </table>

                                    </div>

                                    {/* =================================================
                                        PAGINATION
                                    ================================================= */}

                                    <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

                                        <p className="text-sm text-slate-500">

                                            Page{" "}

                                            <span className="font-medium text-slate-700">
                                                {
                                                    page
                                                }
                                            </span>

                                            {" "}of{" "}

                                            <span className="font-medium text-slate-700">
                                                {
                                                    totalPages
                                                }
                                            </span>

                                        </p>

                                        <div className="flex gap-2">

                                            <button
                                                type="button"
                                                disabled={
                                                    page <=
                                                    1
                                                }
                                                onClick={() =>
                                                    setPage(
                                                        (
                                                            previous
                                                        ) =>
                                                            Math.max(
                                                                1,
                                                                previous -
                                                                1
                                                            )
                                                    )
                                                }
                                                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                            >
                                                Previous
                                            </button>

                                            <button
                                                type="button"
                                                disabled={
                                                    page >=
                                                    totalPages
                                                }
                                                onClick={() =>
                                                    setPage(
                                                        (
                                                            previous
                                                        ) =>
                                                            Math.min(
                                                                totalPages,
                                                                previous +
                                                                1
                                                            )
                                                    )
                                                }
                                                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-40"
                                            >
                                                Next
                                            </button>

                                        </div>

                                    </div>

                                </>

                            )}

                        </div>

                    </div>

                </div>

            </main>

            {/* ============================================================
                ADJUST STOCK MODAL
            ============================================================ */}

            {showAdjustment &&
                selectedProduct && (

                    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">

                        <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">

                            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">

                                <div>

                                    <h2 className="text-lg font-semibold text-slate-900">
                                        Adjust Stock
                                    </h2>

                                    <p className="mt-0.5 text-sm text-slate-500">
                                        {
                                            selectedProduct.product_name
                                        }
                                    </p>

                                </div>

                                <button
                                    type="button"
                                    onClick={
                                        closeAdjustment
                                    }
                                    className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                                >
                                    <X
                                        size={
                                            20
                                        }
                                    />
                                </button>

                            </div>

                            <div className="space-y-5 p-5">

                                <div className="rounded-xl bg-slate-50 p-4">

                                    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                                        Current Stock
                                    </p>

                                    <p className="mt-1 text-2xl font-bold text-slate-900">

                                        {
                                            selectedProduct.current_stock
                                        }

                                        <span className="ml-1 text-sm font-medium text-slate-500">
                                            {
                                                selectedProduct.unit
                                            }
                                        </span>

                                    </p>

                                </div>

                                <div>

                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Adjustment Quantity
                                    </label>

                                    <input
                                        type="number"
                                        step="0.001"
                                        value={
                                            adjustmentQuantity
                                        }
                                        onChange={(
                                            e
                                        ) =>
                                            setAdjustmentQuantity(
                                                e
                                                    .target
                                                    .value
                                            )
                                        }
                                        placeholder="Example: 10 or -5"
                                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-black placeholder:text-black outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                                    />

                                    <p className="mt-1.5 text-xs text-slate-400">
                                        Positive quantity adds stock. Negative quantity removes stock.
                                    </p>

                                </div>

                                <div>

                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                        Reason
                                    </label>

                                    <textarea
                                        value={adjustmentReason}
                                        onChange={(e) =>
                                            setAdjustmentReason(e.target.value)
                                        }
                                        rows={3}
                                        placeholder="Enter reason for stock adjustment"
                                        className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-black placeholder:text-black outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
                                    />

                                </div>

                            </div>

                            <div className="flex justify-end gap-3 border-t border-slate-200 px-5 py-4">

                                <button
                                    type="button"
                                    onClick={
                                        closeAdjustment
                                    }
                                    disabled={
                                        adjusting
                                    }
                                    className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    onClick={
                                        handleAdjustment
                                    }
                                    disabled={
                                        adjusting
                                    }
                                    className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                                >

                                    {adjusting && (
                                        <RefreshCw
                                            size={
                                                16
                                            }
                                            className="animate-spin"
                                        />
                                    )}

                                    {adjusting
                                        ? "Saving..."
                                        : "Save Adjustment"}

                                </button>

                            </div>

                        </div>

                    </div>
                )}

            {/* ============================================================
                MOVEMENT HISTORY MODAL
            ============================================================ */}

            {showMovements &&
                movementProduct && (

                    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">

                        <div className="max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl">

                            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">

                                <div>

                                    <h2 className="text-lg font-semibold text-slate-900">
                                        Stock Movement History
                                    </h2>

                                    <p className="mt-0.5 text-sm text-slate-500">

                                        {
                                            movementProduct.product_name
                                        }

                                        {" · Current stock: "}

                                        <span className="font-semibold text-slate-700">
                                            {
                                                movementProduct.current_stock
                                            }
                                        </span>

                                    </p>

                                </div>

                                <button
                                    type="button"
                                    onClick={
                                        closeMovements
                                    }
                                    className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                                >
                                    <X
                                        size={
                                            20
                                        }
                                    />
                                </button>

                            </div>

                            <div className="max-h-[65vh] overflow-auto">

                                {movementLoading ? (

                                    <div className="flex min-h-[250px] items-center justify-center">

                                        <div className="flex flex-col items-center gap-3 text-slate-500">

                                            <RefreshCw
                                                size={
                                                    25
                                                }
                                                className="animate-spin text-green-600"
                                            />

                                            <p className="text-sm">
                                                Loading movements...
                                            </p>

                                        </div>

                                    </div>

                                ) : movements.length ===
                                    0 ? (

                                    <div className="flex min-h-[250px] items-center justify-center text-sm text-slate-500">
                                        No stock movements found.
                                    </div>

                                ) : (

                                    <table className="w-full min-w-[750px]">

                                        <thead className="sticky top-0 z-10 bg-slate-50">

                                            <tr className="border-b border-slate-200">

                                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                    Date
                                                </th>

                                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                    Type
                                                </th>

                                                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                    Quantity
                                                </th>

                                                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                    Stock After
                                                </th>

                                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                    Reference
                                                </th>

                                                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                    Reason
                                                </th>

                                            </tr>

                                        </thead>

                                        <tbody className="divide-y divide-slate-100">

                                            {movements.map(
                                                (
                                                    movement
                                                ) => {

                                                    const quantity =
                                                        Number(
                                                            movement.quantity
                                                        );

                                                    const isIncoming =
                                                        quantity >
                                                        0;

                                                    return (
                                                        <tr
                                                            key={
                                                                movement.id
                                                            }
                                                            className="hover:bg-slate-50"
                                                        >

                                                            <td className="whitespace-nowrap px-5 py-3 text-sm text-slate-600">
                                                                {new Date(
                                                                    movement.created_at
                                                                ).toLocaleString()}
                                                            </td>

                                                            <td className="px-5 py-3">

                                                                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium capitalize text-slate-700">

                                                                    {movement.movement_type ===
                                                                        "purchase" ? (

                                                                        <ArrowDownCircle
                                                                            size={
                                                                                14
                                                                            }
                                                                            className="text-green-600"
                                                                        />

                                                                    ) : movement.movement_type ===
                                                                        "sale" ? (

                                                                        <ArrowUpCircle
                                                                            size={
                                                                                14
                                                                            }
                                                                            className="text-red-600"
                                                                        />

                                                                    ) : (

                                                                        <SlidersHorizontal
                                                                            size={
                                                                                14
                                                                            }
                                                                        />

                                                                    )}

                                                                    {
                                                                        movement.movement_type
                                                                    }

                                                                </span>

                                                            </td>

                                                            <td className="px-5 py-3 text-right">

                                                                <span
                                                                    className={`font-semibold ${isIncoming
                                                                            ? "text-green-600"
                                                                            : "text-red-600"
                                                                        }`}
                                                                >

                                                                    {isIncoming
                                                                        ? "+"
                                                                        : ""}

                                                                    {
                                                                        movement.quantity
                                                                    }

                                                                </span>

                                                            </td>

                                                            <td className="px-5 py-3 text-right font-medium text-slate-800">
                                                                {
                                                                    movement.stock_after
                                                                }
                                                            </td>

                                                            <td className="px-5 py-3 text-sm text-slate-600">

                                                                {movement.purchase_id ? (

                                                                    <span>
                                                                        Purchase #
                                                                        {
                                                                            movement.purchase_id
                                                                        }
                                                                    </span>

                                                                ) : movement.sale_id ? (

                                                                    <span>
                                                                        Sale #
                                                                        {
                                                                            movement.sale_id
                                                                        }
                                                                    </span>

                                                                ) : (

                                                                    <span>
                                                                        Manual
                                                                    </span>

                                                                )}

                                                            </td>

                                                            <td className="max-w-[250px] px-5 py-3 text-sm text-slate-500">
                                                                {
                                                                    movement.reason ||
                                                                    "-"
                                                                }
                                                            </td>

                                                        </tr>
                                                    );
                                                }
                                            )}

                                        </tbody>

                                    </table>

                                )}

                            </div>

                            <div className="flex justify-end border-t border-slate-200 px-5 py-4">

                                <button
                                    type="button"
                                    onClick={
                                        closeMovements
                                    }
                                    className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                                >
                                    Close
                                </button>

                            </div>

                        </div>

                    </div>
                )}

        </div>
    );
}