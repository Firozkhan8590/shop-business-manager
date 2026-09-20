"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  User,
  Lock,
  ArrowRight,
  BarChart3,
  Boxes,
  Users,
  Wallet,
  ShieldCheck,
  Leaf,
  Loader2,
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const savedUsername = localStorage.getItem("shop_remember_username");

    if (savedUsername) {
      setUsername(savedUsername);
      setRememberMe(true);
    }
  }, []);

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");

    if (!username.trim() || !password) {
      setError("Please enter your username and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username.trim(),
          password,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Invalid username or password"
        );
      }

      // Save authentication information
      localStorage.setItem("token", result.data.token);
      localStorage.setItem(
        "user",
        JSON.stringify(result.data.user)
      );

      // Remember username only when checkbox is selected
      if (rememberMe) {
        localStorage.setItem(
          "shop_remember_username",
          username.trim()
        );
      } else {
        localStorage.removeItem("shop_remember_username");
      }

      router.push("/dashboard");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to connect to the server."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f4f7f6] flex">

      {/* LEFT BRAND PANEL */}
      <section className="hidden lg:flex lg:w-[48%] xl:w-[50%] relative overflow-hidden bg-[#003f3d] text-white">

        {/* Decorative background */}
        <div className="absolute inset-0">
          <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full bg-[#087f70]/20 blur-3xl" />
          <div className="absolute bottom-[-200px] right-[-100px] w-[500px] h-[500px] rounded-full bg-[#00a88f]/20 blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col justify-between w-full px-12 xl:px-16 py-12">

          {/* Logo */}
          <div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full border border-emerald-300/40 bg-white/5 flex items-center justify-center">
                <Leaf className="w-6 h-6 text-emerald-300" />
              </div>

              <div>
                <h1 className="text-xl font-bold tracking-wide">
                  MAJ & SONS
                </h1>

                <p className="text-xs text-emerald-100/70">
                  Shop Business Manager
                </p>
              </div>
            </div>

            <div className="mt-5 w-12 h-[2px] bg-emerald-400" />
          </div>

          {/* Main message */}
          <div className="max-w-xl">

            <p className="text-sm tracking-[0.3em] text-emerald-300 font-medium mb-6">
              SINCE 1996 · KOLLAM
            </p>

            <h2 className="text-5xl xl:text-6xl font-semibold leading-[1.08] tracking-tight">
              Manage
              <br />
              Today
              <br />
              Grow
              <br />
              Tomorrow
            </h2>

            <p className="mt-7 max-w-md text-sm leading-6 text-white/60">
              A simple and powerful business management system
              designed to keep your shop organized, profitable
              and ready for tomorrow.
            </p>

            {/* Feature grid */}
            <div className="grid grid-cols-2 gap-x-10 gap-y-5 mt-10 max-w-lg">

              <Feature
                icon={BarChart3}
                text="Sales & Billing"
              />

              <Feature
                icon={Boxes}
                text="Inventory Management"
              />

              <Feature
                icon={Users}
                text="Customer & Supplier"
              />

              <Feature
                icon={Wallet}
                text="Expenses & Payments"
              />

              <Feature
                icon={BarChart3}
                text="Reports & Insights"
              />

              <Feature
                icon={ShieldCheck}
                text="Secure & Offline"
              />

            </div>
          </div>

          {/* Footer quote */}
          <div className="max-w-md">
            <div className="text-4xl text-emerald-400/50 leading-none">
              “
            </div>

            <p className="text-sm text-white/60 mt-1">
              A well managed business builds a better tomorrow.
            </p>

            <div className="flex items-center gap-3 mt-5">
              <div className="w-8 h-px bg-white/20" />
              <span className="text-xs text-white/40">
                MAJ & SONS
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* RIGHT LOGIN AREA */}
      <section className="flex-1 flex items-center justify-center px-6 py-10">

        <div className="w-full max-w-[520px]">

          {/* Login card */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-[0_20px_60px_rgba(15,23,42,0.08)] px-8 sm:px-10 py-9">

            {/* Header */}
            <div className="mb-8">

              <div className="lg:hidden flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-full bg-[#003f3d] flex items-center justify-center">
                  <Leaf className="w-5 h-5 text-emerald-300" />
                </div>

                <div>
                  <div className="font-bold text-[#003f3d]">
                    MAJ & SONS
                  </div>

                  <div className="text-xs text-slate-500">
                    Shop Business Manager
                  </div>
                </div>
              </div>

              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                Welcome Back
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Sign in to manage your business
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">

              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-slate-800 mb-2">
                  Username
                </label>

                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-400" />

                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    autoComplete="username"
                    className="w-full h-12 rounded-lg border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-slate-800 mb-2">
                  Password
                </label>

                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-400" />

                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className="w-full h-12 rounded-lg border border-slate-200 bg-white pl-11 pr-12 text-sm text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((value) => !value)
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition"
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="w-[18px] h-[18px]" />
                    ) : (
                      <Eye className="w-[18px] h-[18px]" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <div className="flex items-center">
                <label className="flex items-center gap-2 cursor-pointer select-none">

                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) =>
                      setRememberMe(e.target.checked)
                    }
                    className="h-4 w-4 rounded border-slate-300 accent-emerald-600"
                  />

                  <span className="text-sm text-slate-600">
                    Remember me
                  </span>

                </label>
              </div>

              {/* Sign in */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-lg bg-[#008f70] hover:bg-[#007b61] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm flex items-center justify-center gap-2 transition shadow-sm"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

            </form>

            {/* Bottom brand */}
            <div className="mt-9 pt-7 border-t border-slate-100 text-center">

              <div className="flex justify-center mb-3">
                <Leaf className="w-8 h-8 text-[#008f70]" />
              </div>

              <div className="font-semibold text-slate-900">
                MAJ & SONS
              </div>

              <div className="text-xs text-slate-500 mt-1">
                Shop Business Manager
              </div>

              <div className="text-[11px] text-slate-400 mt-3">
                Simple. Reliable. Profitable.
              </div>

            </div>

          </div>

          <p className="text-center text-xs text-slate-400 mt-5">
            v1.0.0 · Offline Business Management
          </p>

        </div>

      </section>
    </main>
  );
}

function Feature({
  icon: Icon,
  text,
}: {
  icon: React.ElementType;
  text: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg border border-emerald-300/20 bg-white/5 flex items-center justify-center">
        <Icon className="w-[18px] h-[18px] text-emerald-300" />
      </div>

      <span className="text-xs text-white/70">
        {text}
      </span>
    </div>
  );
}