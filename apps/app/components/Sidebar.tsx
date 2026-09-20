"use client";

import { logoutUser } from "@/src/lib/api";
import {
  BarChart3,
  Boxes,
  ChevronDown,
  CreditCard,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Receipt,
  Settings,
  ShoppingCart,
  TrendingUp,
  Truck,
  UserRound,
  Users,
  Wallet,
  X,
} from "lucide-react";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

const navigation = [
  {
    section: "MAIN",
    items: [
      {
        label: "Dashboard",
        icon: LayoutDashboard,
        href: "/dashboard",
      },
      {
        label: "Sales & Billing",
        icon: Receipt,
        href: "/sales",
      },
      {
        label: "Estimates",
        icon: FileText,
        href: "/estimates",
      },
    ],
  },
  {
    section: "INVENTORY",
    items: [
      {
        label: "Products",
        icon: Package,
        href: "/products",
      },
      {
        label: "Inventory",
        icon: Boxes,
        href: "/inventory",
      },
      {
        label: "Purchases",
        icon: ShoppingCart,
        href: "/purchases",
      },
    ],
  },
  {
    section: "PARTIES",
    items: [
      {
        label: "Customers",
        icon: Users,
        href: "/customers",
      },
      {
        label: "Suppliers",
        icon: Truck,
        href: "/suppliers",
      },
      {
        label: "Payments",
        icon: CreditCard,
        href: "/payments",
      },
    ],
  },
  {
    section: "BUSINESS",
    items: [
      {
        label: "Expenses",
        icon: Wallet,
        href: "/expenses",
      },
      {
        label: "Reports",
        icon: BarChart3,
        href: "/reports",
      },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  async function handleLogout() {
  try {
    await logoutUser();
  } catch (error) {
    console.error(
      "Logout error:",
      error
    );
  } finally {
    router.replace("/");
  }
}

  return (
    <>
      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* MOBILE MENU BUTTON */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="fixed left-4 top-4 z-30 rounded-lg bg-white p-2 text-slate-600 shadow-sm lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* SIDEBAR */}
      <aside
        className={`
          fixed left-0 top-0 z-50 h-screen w-[260px]
          bg-[#063f3d] text-white
          transition-transform duration-300
          lg:translate-x-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex h-full flex-col">

          {/* BRAND */}
          <div className="flex h-[82px] items-center justify-between border-b border-white/10 px-6">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0a8f78]">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>

              <div>
                <p className="text-[15px] font-bold tracking-wide">
                  MAJ & SONS
                </p>

                <p className="mt-0.5 text-[10px] uppercase tracking-[0.16em] text-emerald-200/60">
                  Business Manager
                </p>
              </div>

            </div>

            <button
              onClick={() => setSidebarOpen(false)}
              className="rounded-lg p-2 text-white/60 hover:bg-white/10 hover:text-white lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>

          </div>

          {/* NAVIGATION */}
          <div className="flex-1 overflow-y-auto px-4 py-6">

            {navigation.map((group) => (
              <div key={group.section} className="mb-7">

                <p className="mb-2 px-3 text-[10px] font-semibold tracking-[0.18em] text-emerald-200/40">
                  {group.section}
                </p>

                <div className="space-y-1">

                  {group.items.map((item) => {
                    const Icon = item.icon;

                    const isActive =
                      pathname === item.href ||
                      pathname.startsWith(`${item.href}/`);

                    return (
                      <Link
                        key={item.label}
                        href={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`
                          group flex w-full items-center gap-3 rounded-lg
                          px-3 py-2.5 text-left text-[13px]
                          transition
                          ${
                            isActive
                              ? "bg-[#0a8f78] text-white shadow-sm"
                              : "text-white/65 hover:bg-white/7 hover:text-white"
                          }
                        `}
                      >
                        <Icon
                          className={`
                            h-[17px] w-[17px]
                            ${
                              isActive
                                ? "text-white"
                                : "text-white/45 group-hover:text-emerald-300"
                            }
                          `}
                        />

                        <span>{item.label}</span>
                      </Link>
                    );
                  })}

                </div>
              </div>
            ))}

          </div>

          {/* BOTTOM NAV */}
          <div className="border-t border-white/10 p-4">

            <Link
              href="/settings"
              onClick={() => setSidebarOpen(false)}
              className={`
                flex w-full items-center gap-3 rounded-lg
                px-3 py-2.5 text-sm transition
                ${
                  pathname.startsWith("/settings")
                    ? "bg-[#0a8f78] text-white"
                    : "text-white/60 hover:bg-white/7 hover:text-white"
                }
              `}
            >
              <Settings className="h-[17px] w-[17px]" />
              Settings
            </Link>

            <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white/70 transition hover:bg-white/10 hover:text-white"
            >
            <LogOut size={19} />
            <span>Logout</span>
            </button>

          </div>

        </div>
      </aside>
    </>
  );
}