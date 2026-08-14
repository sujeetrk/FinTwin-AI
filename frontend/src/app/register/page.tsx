"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { registerUser } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      await registerUser(name, email, password);

      // Registration successful
      router.push("/login");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Registration failed");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#020817] flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">
            FinTwin <span className="text-emerald-400">AI</span>
          </h1>

          <p className="text-slate-400 text-sm mt-2">
            Create your financial digital twin
          </p>
        </div>

        {/* Register Card */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-8 shadow-xl">

          <h2 className="text-2xl font-bold text-white mb-2">
            Create Account
          </h2>

          <p className="text-slate-400 text-sm mb-6">
            Start managing your financial future with AI.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Name */}
            <div>
              <label className="block text-sm text-slate-300 mb-2">
                Full Name
              </label>

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                required
                className="w-full bg-[#020817] border border-slate-700 rounded-lg px-4 py-3 text-white outline-none focus:border-emerald-400"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm text-slate-300 mb-2">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full bg-[#020817] border border-slate-700 rounded-lg px-4 py-3 text-white outline-none focus:border-emerald-400"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm text-slate-300 mb-2">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                required
                minLength={8}
                className="w-full bg-[#020817] border border-slate-700 rounded-lg px-4 py-3 text-white outline-none focus:border-emerald-400"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="text-red-400 text-sm bg-red-950/30 border border-red-900 rounded-lg p-3">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-semibold rounded-lg py-3 transition"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>

          </form>

          <p className="text-center text-sm text-slate-400 mt-6">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-emerald-400 hover:text-emerald-300"
            >
              Login
            </Link>
          </p>

        </div>
      </div>
    </main>
  );
}