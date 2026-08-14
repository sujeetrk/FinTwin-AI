"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { getCurrentUser } from "@/lib/api";

interface AuthGuardProps {
  children: ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuthentication() {
      // Get JWT stored during login
      const token = localStorage.getItem("access_token");

      // No token = user is not logged in
      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        // Ask FastAPI if this token is valid
        await getCurrentUser(token);

        // Token is valid
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Authentication failed:", error);

        // Token is invalid or expired
        localStorage.removeItem("access_token");

        router.replace("/login");
      } finally {
        setLoading(false);
      }
    }

    checkAuthentication();
  }, [router]);

  // While FastAPI is validating JWT
  if (loading) {
    return (
      <div className="min-h-screen bg-[#020817] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">

          <div className="w-10 h-10 border-4 border-slate-700 border-t-emerald-400 rounded-full animate-spin" />

          <p className="text-sm text-slate-400">
            Securing your FinTwin...
          </p>

        </div>
      </div>
    );
  }

  // Prevent protected content from briefly appearing
  if (!isAuthenticated) {
    return null;
  }

  // Authentication successful
  return <>{children}</>;
}