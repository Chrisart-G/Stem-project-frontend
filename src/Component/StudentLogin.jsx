// src/Component/StudentLogin.jsx
import { useState } from "react";
import { loginStudent, signupStudent } from "../api/smartBinApi";

const MAROON = "#7b1113";

export default function StudentLogin({ onBack, onLoginSuccess }) {
  const [mode, setMode] = useState("login"); // "login" | "signup"

  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const resetMessages = () => {
    setError("");
    setInfo("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    resetMessages();

    if (!studentId.trim() || !password.trim()) {
      setError("Please enter your Student ID and password.");
      return;
    }

    try {
      setLoading(true);
      const student = await loginStudent({ studentId, password });
      onLoginSuccess(student);
    } catch (err) {
      console.error(err);
      setError(err.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    resetMessages();

    if (!studentId.trim() || !name.trim() || !password.trim()) {
      setError("Student ID, Name, and Password are required.");
      return;
    }

    try {
      setLoading(true);
      const student = await signupStudent({
        studentId,
        name,
        gradeLevel,
        password,
      });
      setInfo("Account created! You are now logged in.");
      onLoginSuccess(student);
    } catch (err) {
      console.error(err);
      setError(err.message || "Sign up failed.");
    } finally {
      setLoading(false);
    }
  };

  const isLogin = mode === "login";

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
                {/* LEFT: heading + description (desktop: own column) */}
                <div className="space-y-5">
                  <header className="flex items-start justify-between gap-4">
                    <div>
                      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-slate-900">
                        Student Redeem
                      </h1>
                      <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-md">
                        Log in or sign up to redeem your Eco Coins from recycled
                        bottles.
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
                      How it works:
                    </p>
                    <ul className="text-xs sm:text-sm text-slate-500 space-y-1.5">
                      <li>• Deposit bottles in the smart bin.</li>
                      <li>• Earn Eco Coins based on accepted bottles.</li>
                      <li>• Log in here to redeem and track your rewards.</li>
                    </ul>
                  </div>
                </div>

                {/* RIGHT: Login / Signup section (form layout unchanged) */}
                <section className="w-full mt-4 lg:mt-0">
                  {/* Toggle buttons */}
                  <div className="flex gap-2 mb-5 sm:mb-6">
                    <button
                      type="button"
                      onClick={() => {
                        setMode("login");
                        resetMessages();
                      }}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-semibold border transition ${
                        isLogin
                          ? "bg-[var(--maroon,#7b1113)] text-white border-transparent shadow-sm"
                          : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      Log In
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMode("signup");
                        resetMessages();
                      }}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-semibold border transition ${
                        !isLogin
                          ? "bg-[var(--maroon,#7b1113)] text-white border-transparent shadow-sm"
                          : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      Sign Up
                    </button>
                  </div>

                  <h2 className="text-lg sm:text-xl font-semibold text-slate-900 mb-1">
                    {isLogin
                      ? "Sign in with your Student ID"
                      : "Create a new student account"}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mb-4 sm:mb-5">
                    {isLogin
                      ? "Enter your ID and password to log in."
                      : "Fill in your details to register."}
                  </p>

                  {/* FORM – same input order & types */}
                  <form
                    onSubmit={isLogin ? handleLogin : handleSignup}
                    className="space-y-3"
                  >
                    {/* Student ID */}
                    <div>
                      <input
                        type="text"
                        value={studentId}
                        onChange={(e) => setStudentId(e.target.value)}
                        placeholder="Enter Student ID..."
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring-color,#7b1113)] focus:border-transparent"
                      />
                    </div>

                    {/* Name (signup only) */}
                    {!isLogin && (
                      <div>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Full Name..."
                          className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring-color,#7b1113)] focus:border-transparent"
                        />
                      </div>
                    )}

                    {/* Grade level (signup only) */}
                    {!isLogin && (
                      <div>
                        <input
                          type="text"
                          value={gradeLevel}
                          onChange={(e) => setGradeLevel(e.target.value)}
                          placeholder="Grade & Section (e.g. Grade 12 - STEM - Ruby)..."
                          className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring-color,#7b1113)] focus:border-transparent"
                        />
                      </div>
                    )}

                    {/* Password */}
                    <div>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password..."
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring-color,#7b1113)] focus:border-transparent"
                      />
                    </div>

                    {error && (
                      <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2 mt-1">
                        {error}
                      </p>
                    )}

                    {info && !error && (
                      <p className="text-xs text-green-700 bg-green-50 border border-green-100 rounded-md px-3 py-2 mt-1">
                        {info}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full mt-4 py-3.5 rounded-xl text-sm sm:text-base font-semibold text-white shadow-sm transition disabled:opacity-70 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                      style={{ backgroundColor: MAROON }}
                    >
                      {loading
                        ? isLogin
                          ? "Logging in..."
                          : "Creating account..."
                        : isLogin
                        ? "Log In"
                        : "Sign Up"}
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