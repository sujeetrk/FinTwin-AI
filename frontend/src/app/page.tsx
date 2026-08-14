import Link from "next/link";

export default function Home() {
  return (
    <main className="h-screen overflow-hidden bg-[#020617] text-white">

      {/* ================= NAVBAR ================= */}
      <nav className="flex h-[76px] items-center justify-between border-b border-slate-900 bg-[#01040f] px-8 md:px-12">

        {/* LOGO */}
        <Link
          href="/"
          className="text-2xl font-bold tracking-tight"
        >
          FinTwin <span className="text-emerald-400">AI</span>
        </Link>

        {/* NAVIGATION */}
        <div className="flex items-center gap-3">

          {/* LOGIN */}
          <Link
            href="/login"
            className="rounded-lg px-5 py-2.5 text-sm font-medium text-white transition duration-200 hover:bg-slate-800"
          >
            Login
          </Link>

          {/* GET STARTED */}
          <Link
            href="/register"
            className="rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-black transition duration-200 hover:bg-slate-200"
          >
            Get Started
          </Link>

        </div>
      </nav>


      {/* ================= MAIN CONTENT ================= */}
      <div className="mx-auto flex h-[calc(100vh-76px-65px)] max-w-7xl flex-col px-6">

        {/* ================= HERO SECTION ================= */}
        <section className="flex flex-1 flex-col items-center justify-center text-center">

          {/* LABEL */}
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-400 md:text-sm">
            AI-Powered Personal Finance
          </p>


          {/* MAIN HEADING */}
          <h1 className="max-w-4xl text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl md:text-6xl">
            Your Financial Life.
            <br />
            One Intelligent Digital Twin.
          </h1>


          {/* DESCRIPTION */}
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-400 md:text-lg">
            Track your money, understand your spending, predict your
            financial future and receive personalized AI-powered insights.
          </p>


          {/* BUTTONS */}
          <div className="mt-7 flex items-center justify-center gap-4">

            {/* CREATE FINTWIN */}
            <Link
              href="/register"
              className="rounded-xl bg-emerald-500 px-7 py-3 font-semibold text-black shadow-lg shadow-emerald-500/10 transition duration-200 hover:bg-emerald-400 hover:shadow-emerald-500/20"
            >
              Create Your FinTwin
            </Link>


            {/* EXPLORE FEATURES */}
            <Link
              href="/features"
              className="rounded-xl border border-slate-700 bg-transparent px-7 py-3 font-medium text-white transition duration-200 hover:border-slate-600 hover:bg-slate-900"
            >
              Explore Features
            </Link>

          </div>

        </section>


        {/* ================= FEATURE CARDS ================= */}
        <section className="mb-6 grid w-full grid-cols-1 gap-4 md:grid-cols-3">

          {/* CARD 1 */}
          <div className="flex min-h-[150px] flex-col rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl shadow-black/10 transition duration-200 hover:-translate-y-1 hover:border-emerald-500/40">

            {/* ICON */}
            <div className="mb-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-lg font-semibold text-emerald-400">
              ₹
            </div>

            {/* TITLE */}
            <h3 className="text-lg font-semibold text-white">
              Smart Transactions
            </h3>

            {/* DESCRIPTION */}
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Track and manage your income and expenses in one place.
            </p>

          </div>


          {/* CARD 2 */}
          <div className="flex min-h-[150px] flex-col rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl shadow-black/10 transition duration-200 hover:-translate-y-1 hover:border-emerald-500/40">

            {/* ICON */}
            <div className="mb-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-lg text-emerald-400">
              ◈
            </div>

            {/* TITLE */}
            <h3 className="text-lg font-semibold text-white">
              Financial Planning
            </h3>

            {/* DESCRIPTION */}
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Manage budgets and savings goals while monitoring your financial
              progress.
            </p>

          </div>


          {/* CARD 3 */}
          <div className="flex min-h-[150px] flex-col rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl shadow-black/10 transition duration-200 hover:-translate-y-1 hover:border-emerald-500/40">

            {/* ICON */}
            <div className="mb-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-lg text-emerald-400">
              ✦
            </div>

            {/* TITLE */}
            <h3 className="text-lg font-semibold text-white">
              AI Financial Insights
            </h3>

            {/* DESCRIPTION */}
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Get intelligent insights about your spending and financial
              health.
            </p>

          </div>

        </section>

      </div>


      {/* ================= FOOTER ================= */}
      <footer className="h-[65px] border-t border-slate-900 bg-[#01040f]">

        <div className="flex h-full items-center justify-center px-6">

          <p className="text-center text-xs text-slate-500 md:text-sm">
            © 2026 FinTwin AI. Financial Digital Twin.
          </p>

        </div>

      </footer>

    </main>
  );
}