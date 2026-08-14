"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import {
  LayoutDashboard,
  WalletCards,
  ReceiptText,
  PiggyBank,
  Target,
  Bot,
  FileText,
  Settings,
  User,
  LogOut,
} from "lucide-react";

const menuItems = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    name: "Transactions",
    icon: WalletCards,
    href: "/transactions",
  },
  {
    name: "Expenses",
    icon: ReceiptText,
    href: "/expenses",
  },
  {
    name: "Budgets",
    icon: PiggyBank,
    href: "/budgets",
  },
  {
    name: "Goals",
    icon: Target,
    href: "/goals",
  },
  {
    name: "AI Twin",
    icon: Bot,
    href: "/ai-twin",
  },
  {
    name: "Reports",
    icon: FileText,
    href: "/reports",
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    // Remove authentication token
    localStorage.removeItem("access_token");

    // Remove any other locally stored user/session data if present
    localStorage.removeItem("user");
    localStorage.removeItem("currentUser");

    // Redirect to login page
    router.push("/login");
  };

  return (
    <aside
      style={{
        backgroundColor: "#020617",
        borderColor: "#1e293b",
        color: "#ffffff",
      }}
      className="sticky top-0 flex h-screen w-64 shrink-0 flex-col overflow-hidden border-r p-5"
    >
      {/* ================= LOGO ================= */}
      <div className="mb-10">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          FinTwin <span className="text-emerald-400">AI</span>
        </h1>

        <p className="text-xs text-slate-400">
          Financial Digital Twin
        </p>
      </div>

      {/* ================= MAIN NAVIGATION ================= */}
      <nav className="flex flex-1 flex-col gap-1">
        {menuItems.map((item) => {
          const Icon = item.icon;

          const isActive =
            pathname === item.href ||
            pathname.startsWith(`${item.href}/`);

          return (
            <NavLink
              key={item.name}
              href={item.href}
              isActive={isActive}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon size={19} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* ================= BOTTOM NAVIGATION ================= */}
      <div className="mt-auto flex flex-col gap-1">

        {/* Profile */}
        <NavLink
          href="/profile"
          isActive={
            pathname === "/profile" ||
            pathname.startsWith("/profile/")
          }
          aria-current={
            pathname === "/profile" ? "page" : undefined
          }
        >
          <User size={19} />
          <span>Profile</span>
        </NavLink>

        {/* Settings */}
        <NavLink
          href="/settings"
          isActive={
            pathname === "/settings" ||
            pathname.startsWith("/settings/")
          }
          aria-current={
            pathname === "/settings" ? "page" : undefined
          }
        >
          <Settings size={19} />
          <span>Settings</span>
        </NavLink>

        {/* Divider */}
        <div
          className="my-2 border-t"
          style={{ borderColor: "var(--border)" }}
        />

        {/* Logout */}
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-red-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
        >
          <LogOut size={19} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

// =========================================================
// NAV LINK — theme-aware via CSS variables
// =========================================================

function NavLink({
  href,
  isActive,
  children,
  ...rest
}: {
  href: string;
  isActive: boolean;
  children: React.ReactNode;
  [key: string]: unknown;
}) {
  return (
    <Link
      href={href}
      style={
        isActive
          ? {
              backgroundColor: "#064e3b",
              color: "#34d399",
            }
          : {
              color: "#94a3b8",
            }
      }
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = "#0f172a";
          e.currentTarget.style.color = "#34d399";
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = "";
          e.currentTarget.style.color = "#94a3b8";
        }
      }}
      className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors"
      {...rest}
    >
      {children}
    </Link>
  );
}