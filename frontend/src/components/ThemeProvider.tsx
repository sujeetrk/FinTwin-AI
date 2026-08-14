"use client";

import { useEffect } from "react";

const API_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    "http://127.0.0.1:8000";

export default function ThemeProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    useEffect(() => {
        async function loadTheme() {
            try {
                const token =
                    localStorage.getItem("access_token");

                if (!token) {
                    return;
                }

                const response = await fetch(
                    `${API_URL}/settings/me`,
                    {
                        method: "GET",
                        headers: {
                            Accept: "application/json",
                            Authorization: `Bearer ${token}`,
                        },
                        cache: "no-store",
                    }
                );

                if (!response.ok) {
                    return;
                }

                const data = await response.json();

                const theme =
                    data?.settings?.theme || "dark";

                applyTheme(theme);
            } catch (error) {
                console.error(
                    "Theme loading error:",
                    error
                );
            }
        }

        loadTheme();
    }, []);

    return <>{children}</>;
}


/* =========================================================
   APPLY THEME
========================================================= */

export function applyTheme(theme: string) {
    const root = document.documentElement;

    if (theme === "light") {
        root.setAttribute("data-theme", "light");
    } else if (theme === "system") {
        const prefersDark =
            window.matchMedia(
                "(prefers-color-scheme: dark)"
            ).matches;

        root.setAttribute(
            "data-theme",
            prefersDark ? "dark" : "light"
        );
    } else {
        root.setAttribute("data-theme", "dark");
    }
}