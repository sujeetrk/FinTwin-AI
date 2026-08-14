"use client";

import { usePathname } from "next/navigation";
import FloatingAIChat from "./FloatingAIChat";

export default function GlobalAIChat() {
    const pathname = usePathname();

    // Pages where the chatbot should NOT appear
    const publicPages = [
        "/",
        "/login",
        "/register",
    ];

    // Hide chatbot on public pages
    if (publicPages.includes(pathname)) {
        return null;
    }

    // Show chatbot on authenticated application pages
    return <FloatingAIChat />;
}