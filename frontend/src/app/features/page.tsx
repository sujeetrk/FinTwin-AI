import Link from "next/link";

export default function FeaturesPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">

      {/* ================= NAVBAR ================= */}
      <nav className="flex h-[76px] items-center justify-between border-b border-slate-900 px-8 md:px-12">

        {/* LOGO */}
        <Link
          href="/"
          className="text-2xl font-bold tracking-tight"
        >
          FinTwin <span className="text-emerald-400">AI</span>
        </Link>

        {/* NAVIGATION */}
        <div className="flex items-center gap-3">

          <Link
            href="/login"
            className="rounded-lg px-5 py-2.5 text-sm font-medium transition hover:bg-slate-800"
          >
            Login
          </Link>

          <Link
            href="/register"
            className="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-slate-200"
          >
            Get Started
          </Link>

        </div>
      </nav>


      {/* ================= HEADER ================= */}
      <section className="px-6 pt-20 text-center">

        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-400">
          FinTwin AI Features
        </p>

        <h1 className="mx-auto max-w-4xl text-4xl font-bold leading-tight md:text-5xl">
          Everything You Need to
          <br />
          Manage Your Finances
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-lg leading-7 text-slate-400">
          FinTwin AI brings your transactions, expenses, budgets, goals,
          reports and intelligent financial insights together in one place.
        </p>

      </section>


      {/* ================= FEATURE GRID ================= */}
      <section className="mx-auto mt-14 grid max-w-6xl gap-5 px-6 pb-16 md:grid-cols-2 lg:grid-cols-3">


        {/* FEATURE 1 */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 transition hover:-translate-y-1 hover:border-emerald-500/40">

          <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-500/10 text-xl text-emerald-400">
            ₹
          </div>

          <h2 className="text-xl font-semibold">
            Smart Transactions
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-400">
            Record and manage your income and expenses while keeping
            your complete transaction history organized.
          </p>

        </div>


        {/* FEATURE 2 */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 transition hover:-translate-y-1 hover:border-emerald-500/40">

          <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-500/10 text-xl text-emerald-400">
            ◈
          </div>

          <h2 className="text-xl font-semibold">
            Expense Tracking
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-400">
            Understand where your money goes with expense summaries,
            spending categories and monthly spending trends.
          </p>

        </div>


        {/* FEATURE 3 */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 transition hover:-translate-y-1 hover:border-emerald-500/40">

          <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-500/10 text-xl text-emerald-400">
            %
          </div>

          <h2 className="text-xl font-semibold">
            Budget Management
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-400">
            Set monthly and category budgets, monitor your spending
            progress and see how much budget remains.
          </p>

        </div>


        {/* FEATURE 4 */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 transition hover:-translate-y-1 hover:border-emerald-500/40">

          <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-500/10 text-xl text-emerald-400">
            ◎
          </div>

          <h2 className="text-xl font-semibold">
            Savings Goals
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-400">
            Create financial goals, add savings, track your progress
            and monitor the amount still required to reach your target.
          </p>

        </div>


        {/* FEATURE 5 */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 transition hover:-translate-y-1 hover:border-emerald-500/40">

          <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-500/10 text-xl text-emerald-400">
            ◌
          </div>

          <h2 className="text-xl font-semibold">
            Financial Reports
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-400">
            Review financial performance through income, expenses,
            savings rate, budget usage and goal progress reports.
          </p>

        </div>


        {/* FEATURE 6 */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 transition hover:-translate-y-1 hover:border-emerald-500/40">

          <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-500/10 text-xl text-emerald-400">
            ✦
          </div>

          <h2 className="text-xl font-semibold">
            AI Financial Insights
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-400">
            Analyze your financial habits, spending patterns, budget
            discipline and overall financial health through FinTwin AI.
          </p>

        </div>


      </section>


      {/* ================= CTA ================= */}
      <section className="mx-auto max-w-4xl px-6 pb-20 text-center">

        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 px-6 py-10 md:px-12">

          <p className="text-sm font-semibold uppercase tracking-widest text-emerald-400">
            Start Your Financial Journey
          </p>

          <h2 className="mt-3 text-3xl font-bold">
            Build Your Personal FinTwin
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-slate-400">
            Track your finances, plan your goals and understand your
            financial health from one intelligent platform.
          </p>

          <Link
            href="/register"
            className="mt-6 inline-flex rounded-xl bg-emerald-500 px-7 py-3 font-semibold text-black transition hover:bg-emerald-400"
          >
            Get Started
          </Link>

        </div>

      </section>


      {/* ================= FOOTER ================= */}
      <footer className="border-t border-slate-900 py-6 text-center">

        <p className="text-sm text-slate-500">
          © 2026 FinTwin AI. Financial Digital Twin.
        </p>

      </footer>

    </main>
  );
}