// src/Component/AdminLogin.jsx
import { useState } from "react";
import { loginAdmin } from "../api/smartBinApi";

const MAROON = "#7b1113";

export default function AdminLogin({ onBack, onLoginSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password.trim()) {
      setError("Please enter username and password.");
      return;
    }

    try {
      setLoading(true);
      const admin = await loginAdmin({ username, password });
      onLoginSuccess(admin);
    } catch (err) {
      console.error(err);
      setError(err.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Desktop / large-screen vertical maroon bar */}
      <aside
        className="hidden md:flex flex-col items-center justify-center px-4"
        style={{ backgroundColor: MAROON, width: "88px", minWidth: "88px" }}
      >
        <p className="text-[11px] font-semibold tracking-[0.25em] text-white [writing-mode:vertical-rl] rotate-180 text-center">
          HINIGARAN NATIONAL HIGH SCHOOL
        </p>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex">
        <div className="flex-1 flex justify-center items-start lg:items-center py-6 sm:py-10 lg:py-0">
          <div className="w-full max-w-6xl mx-auto px-3 sm:px-4 md:px-6 lg:px-10">
            {/* Mobile top maroon bar */}
            <div
              className="md:hidden mb-5 sm:mb-7 flex items-center justify-between rounded-2xl px-4 py-3 shadow-sm"
              style={{ backgroundColor: MAROON }}
            >
              <p className="text-[11px] font-semibold tracking-[0.22em] text-white uppercase">
                Hinigaran National High School
              </p>
            </div>

            {/* Main card – 1 column on mobile, 2 columns on desktop */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-lg border border-slate-100 px-4 sm:px-7 lg:px-10 py-6 sm:py-8 lg:py-10">
              <div className="grid gap-6 lg:gap-10 lg:grid-cols-2 items-start">
                {/* LEFT: heading + description */}
                <div className="space-y-5">
                  <header className="flex items-start justify-between gap-4">
                    <div>
                      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-slate-900">
                        Admin Login
                      </h1>
                      <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-md">
                        Sign in to view and manage pending reward redemptions,
                        student accounts, and transaction logs.
                      </p>
                    </div>
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden ring-2 ring-slate-200">
                      <span className="text-[10px] sm:text-xs text-slate-500">
                        LOGO
                      </span>
                    </div>
                  </header>

                  <div className="hidden lg:block">
                    <p className="text-sm text-slate-600 mb-2">
                      Admin capabilities:
                    </p>
                    <ul className="text-xs sm:text-sm text-slate-500 space-y-1.5">
                      <li>• Review and approve Eco Coin redemptions.</li>
                      <li>• Monitor bottle deposits and system activity.</li>
                      <li>• Manage student accounts and rewards.</li>
                    </ul>
                  </div>
                </div>

                {/* RIGHT: Login form (same order & fields) */}
                <section className="w-full mt-4 lg:mt-0">
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <div>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Admin username..."
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring-color,#7b1113)] focus:border-transparent"
                      />
                    </div>

                    <div>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password..."
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring-color,#7b1113)] focus:border-transparent"
                      />
                    </div>

                    {error && (
                      <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2 mt-2">
                        {error}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full mt-4 py-3.5 rounded-xl text-sm sm:text-base font-semibold text-white shadow-sm transition disabled:opacity-70 disabled:cursor-not-allowed"
                      style={{ backgroundColor: MAROON }}
                    >
                      {loading ? "Logging in..." : "Log In"}
                    </button>
                  </form>

                  <button
                    type="button"
                    onClick={onBack}
                    className="mt-5 sm:mt-6 text-xs sm:text-sm hover:underline"
                    style={{ color: MAROON }}
                  >
                    ← Back to Home
                  </button>
                </section>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}