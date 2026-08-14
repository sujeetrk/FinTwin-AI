"use client";

import { useEffect, useState } from "react";
import { applyTheme } from "../../components/ThemeProvider";
import Sidebar from "../../components/layout/Sidebar";

import {
    Settings as SettingsIcon,
    Palette,
    Bell,
    Wallet,
    Globe,
    Brain,
    Save,
    RotateCcw,
    CheckCircle2,
    Loader2,
} from "lucide-react";


// =========================================================
// API
// =========================================================

const API_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    "http://127.0.0.1:8000";


// =========================================================
// TYPES
// =========================================================

interface SettingsData {
    currency: string;
    language: string;
    theme: string;

    email_notifications: boolean;
    budget_alerts: boolean;
    goal_alerts: boolean;
    ai_insights: boolean;
}

interface SettingsResponse {
    user_id: number;
    settings: SettingsData;
}


// =========================================================
// DEFAULT SETTINGS
// =========================================================

const defaultSettings: SettingsData = {
    currency: "INR",
    language: "English",
    theme: "dark",

    email_notifications: true,
    budget_alerts: true,
    goal_alerts: true,
    ai_insights: true,
};


// =========================================================
// SETTINGS PAGE
// =========================================================

export default function SettingsPage() {

    const [settings, setSettings] =
        useState<SettingsData>(defaultSettings);

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);

    const [resetting, setResetting] =
        useState(false);

    const [message, setMessage] =
        useState("");

    const [error, setError] =
        useState("");


    // =====================================================
    // LOAD SETTINGS
    // =====================================================

    useEffect(() => {

        fetchSettings();

    }, []);


    async function fetchSettings() {

        try {

            setLoading(true);
            setError("");

            const token =
                localStorage.getItem("access_token");

            if (!token) {

                setError(
                    "Please login again to access Settings."
                );

                return;
            }


            const response = await fetch(
                `${API_URL}/settings/me`,
                {
                    method: "GET",

                    headers: {
                        Accept: "application/json",

                        Authorization:
                            `Bearer ${token}`,
                    },

                    cache: "no-store",
                }
            );


            if (response.status === 401) {

                setError(
                    "Your session has expired. Please login again."
                );

                return;
            }


            if (!response.ok) {

                const errorData =
                    await response.json().catch(
                        () => null
                    );

                throw new Error(
                    errorData?.detail ||
                    "Failed to load settings."
                );
            }


            const data:
                SettingsResponse =
                await response.json();


            if (data.settings) {
                const loadedSettings = {
                    ...defaultSettings,
                    ...data.settings,
                };

                setSettings(loadedSettings);

                applyTheme(loadedSettings.theme);
            }


        } catch (err) {

            console.error(
                "Settings loading error:",
                err
            );

            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to load settings."
            );

        } finally {

            setLoading(false);

        }
    }


    // =====================================================
    // UPDATE SETTING
    // =====================================================

    function updateSetting(
        key: keyof SettingsData,
        value: string | boolean
    ) {

        setSettings((previous) => ({
            ...previous,
            [key]: value,
        }));

        setMessage("");
        setError("");
    }


    // =====================================================
    // SAVE SETTINGS
    // =====================================================

    async function saveSettings() {

        try {

            setSaving(true);
            setMessage("");
            setError("");

            const token =
                localStorage.getItem("access_token");


            if (!token) {

                setError(
                    "Please login again."
                );

                return;
            }


            const response = await fetch(
                `${API_URL}/settings/me`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json",

                        Accept:
                            "application/json",

                        Authorization:
                            `Bearer ${token}`,
                    },

                    body: JSON.stringify(
                        settings
                    ),
                }
            );


            const data =
                await response.json()
                    .catch(() => null);


            if (response.status === 401) {

                setError(
                    "Your session has expired. Please login again."
                );

                return;
            }


            if (!response.ok) {

                throw new Error(
                    data?.detail ||
                    data?.message ||
                    "Failed to save settings."
                );
            }


            if (data?.settings) {
                const savedSettings = {
                    ...defaultSettings,
                    ...data.settings,
                };

                setSettings(savedSettings);

                applyTheme(savedSettings.theme);
            }


            setMessage(
                "Settings saved successfully."
            );


        } catch (err) {

            console.error(
                "Settings save error:",
                err
            );

            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to save settings."
            );

        } finally {

            setSaving(false);

        }
    }


    // =====================================================
    // RESET SETTINGS
    // =====================================================

    async function resetSettings() {

        try {

            setResetting(true);
            setMessage("");
            setError("");

            const token =
                localStorage.getItem("access_token");


            if (!token) {

                setError(
                    "Please login again."
                );

                return;
            }


            const response = await fetch(
                `${API_URL}/settings/reset`,
                {
                    method: "POST",

                    headers: {
                        Accept:
                            "application/json",

                        Authorization:
                            `Bearer ${token}`,
                    },
                }
            );


            const data =
                await response.json()
                    .catch(() => null);


            if (response.status === 401) {

                setError(
                    "Your session has expired. Please login again."
                );

                return;
            }


            if (!response.ok) {

                throw new Error(
                    data?.detail ||
                    data?.message ||
                    "Failed to reset settings."
                );
            }


            if (data?.settings) {
                const resetSettingsData = {
                    ...defaultSettings,
                    ...data.settings,
                };

                setSettings(resetSettingsData);

                applyTheme(resetSettingsData.theme);
            } else {
                setSettings(defaultSettings);

                applyTheme(defaultSettings.theme);
            }


            setMessage(
                "Settings reset successfully."
            );


        } catch (err) {

            console.error(
                "Settings reset error:",
                err
            );

            setError(
                err instanceof Error
                    ? err.message
                    : "Failed to reset settings."
            );

        } finally {

            setResetting(false);

        }
    }


    // =====================================================
    // LOADING SCREEN
    // =====================================================

    if (loading) {

        return (

            <main
                className="flex min-h-screen"
                style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}
            >

                <Sidebar />

                <section
                    className="flex min-h-screen flex-1 items-center justify-center"
                    style={{ backgroundColor: "var(--background)" }}
                >

                    <div
                        className="flex items-center gap-3"
                        style={{ color: "var(--muted)" }}
                    >

                        <Loader2
                            size={22}
                            className="animate-spin"
                        />

                        Loading settings...

                    </div>

                </section>

            </main>
        );
    }


    // =====================================================
    // MAIN PAGE
    // =====================================================

    return (

        <main
            className="flex h-screen overflow-hidden"
            style={{ backgroundColor: "var(--background)", color: "var(--foreground)" }}
        >

            {/* =================================================
                FIXED LEFT SIDEBAR
            ================================================= */}

            <div className="shrink-0">

                <Sidebar />

            </div>


            {/* =================================================
                RIGHT CONTENT
            ================================================= */}

            <section
                className="min-w-0 flex-1 overflow-y-auto"
                style={{ backgroundColor: "var(--background)" }}
            >

                <div className="mx-auto w-full max-w-6xl p-8">

                    {/* =================================================
                        HEADER
                    ================================================= */}

                    <div className="mb-8 flex items-start justify-between gap-4">

                        <div className="flex items-center gap-4">

                            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10">

                                <SettingsIcon
                                    size={28}
                                    className="text-emerald-500"
                                />

                            </div>


                            <div>

                                <h1
                                    className="text-3xl font-bold"
                                    style={{ color: "var(--foreground)" }}
                                >
                                    Settings
                                </h1>

                                <p
                                    className="mt-1 text-sm"
                                    style={{ color: "var(--muted)" }}
                                >
                                    Manage your FinTwin AI preferences and account experience.
                                </p>

                            </div>

                        </div>


                        {/* SAVE BUTTON */}

                        <button
                            onClick={saveSettings}
                            disabled={saving}
                            className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-5 py-3 text-sm font-medium text-emerald-500 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                        >

                            {saving ? (

                                <Loader2
                                    size={18}
                                    className="animate-spin"
                                />

                            ) : (

                                <Save size={18} />

                            )}

                            {saving
                                ? "Saving..."
                                : "Save Changes"}

                        </button>

                    </div>


                    {/* =================================================
                        SUCCESS MESSAGE
                    ================================================= */}

                    {message && (

                        <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-500">

                            <CheckCircle2 size={19} />

                            {message}

                        </div>

                    )}


                    {/* =================================================
                        ERROR MESSAGE
                    ================================================= */}

                    {error && (

                        <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-400">

                            {error}

                        </div>

                    )}


                    {/* =================================================
                        APPEARANCE
                    ================================================= */}

                    <section
                        className="mb-6 rounded-2xl border p-6"
                        style={{
                            backgroundColor: "var(--card)",
                            borderColor: "var(--border)",
                        }}
                    >

                        <div className="mb-6 flex items-center gap-4">

                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10">

                                <Palette
                                    size={21}
                                    className="text-emerald-500"
                                />

                            </div>


                            <div>

                                <h2
                                    className="text-lg font-semibold"
                                    style={{ color: "var(--foreground)" }}
                                >
                                    Appearance
                                </h2>

                                <p
                                    className="text-sm"
                                    style={{ color: "var(--muted)" }}
                                >
                                    Customize how FinTwin AI looks.
                                </p>

                            </div>

                        </div>


                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">


                            <div>

                                <label
                                    className="mb-2 block text-sm"
                                    style={{ color: "var(--muted)" }}
                                >
                                    Currency
                                </label>

                                <select
                                    value={settings.currency}
                                    onChange={(e) =>
                                        updateSetting(
                                            "currency",
                                            e.target.value
                                        )
                                    }
                                    className="w-full rounded-xl border px-4 py-3 outline-none transition focus:border-emerald-500"
                                    style={{
                                        backgroundColor: "var(--input-bg)",
                                        color: "var(--input-text)",
                                        borderColor: "var(--input-border)",
                                    }}
                                >

                                    <option value="INR">
                                        INR — Indian Rupee
                                    </option>

                                    <option value="USD">
                                        USD — US Dollar
                                    </option>

                                    <option value="EUR">
                                        EUR — Euro
                                    </option>

                                    <option value="GBP">
                                        GBP — British Pound
                                    </option>

                                    <option value="JPY">
                                        JPY — Japanese Yen
                                    </option>

                                </select>

                            </div>

                        </div>

                    </section>


                    {/* =================================================
                        LANGUAGE
                    ================================================= */}

                    <section
                        className="mb-6 rounded-2xl border p-6"
                        style={{
                            backgroundColor: "var(--card)",
                            borderColor: "var(--border)",
                        }}
                    >

                        <div className="mb-6 flex items-center gap-4">

                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10">

                                <Globe
                                    size={21}
                                    className="text-emerald-500"
                                />

                            </div>


                            <div>

                                <h2
                                    className="text-lg font-semibold"
                                    style={{ color: "var(--foreground)" }}
                                >
                                    Language
                                </h2>

                                <p
                                    className="text-sm"
                                    style={{ color: "var(--muted)" }}
                                >
                                    Select your preferred application language.
                                </p>

                            </div>

                        </div>


                        <div className="max-w-md">

                            <label
                                className="mb-2 block text-sm"
                                style={{ color: "var(--muted)" }}
                            >
                                Application Language
                            </label>

                            <select
                                value={settings.language}
                                onChange={(e) =>
                                    updateSetting(
                                        "language",
                                        e.target.value
                                    )
                                }
                                className="w-full rounded-xl border px-4 py-3 outline-none transition focus:border-emerald-500"
                                style={{
                                    backgroundColor: "var(--input-bg)",
                                    color: "var(--input-text)",
                                    borderColor: "var(--input-border)",
                                }}
                            >

                                <option value="English">
                                    English
                                </option>

                                <option value="Hindi">
                                    Hindi
                                </option>

                                <option value="Kannada">
                                    Kannada
                                </option>

                            </select>

                        </div>

                    </section>


                    {/* =================================================
                        NOTIFICATIONS
                    ================================================= */}

                    <section
                        className="mb-6 rounded-2xl border p-6"
                        style={{
                            backgroundColor: "var(--card)",
                            borderColor: "var(--border)",
                        }}
                    >

                        <div className="mb-6 flex items-center gap-4">

                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10">

                                <Bell
                                    size={21}
                                    className="text-emerald-500"
                                />

                            </div>


                            <div>

                                <h2
                                    className="text-lg font-semibold"
                                    style={{ color: "var(--foreground)" }}
                                >
                                    Notifications
                                </h2>

                                <p
                                    className="text-sm"
                                    style={{ color: "var(--muted)" }}
                                >
                                    Choose which financial alerts you want to receive.
                                </p>

                            </div>

                        </div>


                        <div className="space-y-3">

                            <ToggleRow
                                title="Email Notifications"
                                description="Receive important updates and financial notifications."
                                checked={
                                    settings.email_notifications
                                }
                                onChange={(value) =>
                                    updateSetting(
                                        "email_notifications",
                                        value
                                    )
                                }
                            />


                            <ToggleRow
                                title="Budget Alerts"
                                description="Get notified when your spending approaches your budget limit."
                                checked={
                                    settings.budget_alerts
                                }
                                onChange={(value) =>
                                    updateSetting(
                                        "budget_alerts",
                                        value
                                    )
                                }
                            />


                            <ToggleRow
                                title="Goal Alerts"
                                description="Receive updates about your savings goal progress."
                                checked={
                                    settings.goal_alerts
                                }
                                onChange={(value) =>
                                    updateSetting(
                                        "goal_alerts",
                                        value
                                    )
                                }
                            />

                        </div>

                    </section>


                    {/* =================================================
                        AI SETTINGS
                    ================================================= */}

                    <section
                        className="mb-6 rounded-2xl border p-6"
                        style={{
                            backgroundColor: "var(--card)",
                            borderColor: "var(--border)",
                        }}
                    >

                        <div className="mb-6 flex items-center gap-4">

                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10">

                                <Brain
                                    size={21}
                                    className="text-emerald-500"
                                />

                            </div>


                            <div>

                                <h2
                                    className="text-lg font-semibold"
                                    style={{ color: "var(--foreground)" }}
                                >
                                    AI Twin
                                </h2>

                                <p
                                    className="text-sm"
                                    style={{ color: "var(--muted)" }}
                                >
                                    Control AI-powered financial insights.
                                </p>

                            </div>

                        </div>


                        <ToggleRow
                            title="AI Financial Insights"
                            description="Allow FinTwin AI to analyze your financial activity and generate personalized insights."
                            checked={
                                settings.ai_insights
                            }
                            onChange={(value) =>
                                updateSetting(
                                    "ai_insights",
                                    value
                                )
                            }
                        />

                    </section>


                    {/* =================================================
                        FINANCIAL PREFERENCES
                    ================================================= */}

                    <section
                        className="mb-6 rounded-2xl border p-6"
                        style={{
                            backgroundColor: "var(--card)",
                            borderColor: "var(--border)",
                        }}
                    >

                        <div className="mb-6 flex items-center gap-4">

                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10">

                                <Wallet
                                    size={21}
                                    className="text-emerald-500"
                                />

                            </div>


                            <div>

                                <h2
                                    className="text-lg font-semibold"
                                    style={{ color: "var(--foreground)" }}
                                >
                                    Financial Preferences
                                </h2>

                                <p
                                    className="text-sm"
                                    style={{ color: "var(--muted)" }}
                                >
                                    Your default financial display preferences.
                                </p>

                            </div>

                        </div>


                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                            <div
                                className="rounded-xl border p-5"
                                style={{
                                    backgroundColor: "var(--background)",
                                    borderColor: "var(--border)",
                                }}
                            >

                                <p
                                    className="text-sm"
                                    style={{ color: "var(--muted)" }}
                                >
                                    Currency
                                </p>

                                <p
                                    className="mt-2 text-lg font-semibold"
                                    style={{ color: "var(--foreground)" }}
                                >
                                    {settings.currency}
                                </p>

                            </div>


                            <div
                                className="rounded-xl border p-5"
                                style={{
                                    backgroundColor: "var(--background)",
                                    borderColor: "var(--border)",
                                }}
                            >

                                <p
                                    className="text-sm"
                                    style={{ color: "var(--muted)" }}
                                >
                                    Language
                                </p>

                                <p
                                    className="mt-2 text-lg font-semibold"
                                    style={{ color: "var(--foreground)" }}
                                >
                                    {settings.language}
                                </p>

                            </div>

                        </div>

                    </section>


                    {/* =================================================
                        RESET
                    ================================================= */}

                    <section
                        className="rounded-2xl border border-red-500/20 p-6"
                        style={{
                            backgroundColor: "var(--card)",
                        }}
                    >

                        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">

                            <div>

                                <h2
                                    className="text-lg font-semibold"
                                    style={{ color: "var(--foreground)" }}
                                >
                                    Reset Settings
                                </h2>

                                <p
                                    className="mt-1 text-sm"
                                    style={{ color: "var(--muted)" }}
                                >
                                    Restore all settings to their default values.
                                </p>

                            </div>


                            <button
                                onClick={resetSettings}
                                disabled={resetting}
                                className="flex items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/5 px-5 py-3 text-sm font-medium text-red-400 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                            >

                                {resetting ? (

                                    <Loader2
                                        size={18}
                                        className="animate-spin"
                                    />

                                ) : (

                                    <RotateCcw size={18} />

                                )}

                                {resetting
                                    ? "Resetting..."
                                    : "Reset Settings"}

                            </button>

                        </div>

                    </section>


                    {/* =================================================
                        FOOTER
                    ================================================= */}

                    <div
                        className="py-8 text-center text-xs"
                        style={{ color: "var(--muted)" }}
                    >
                        FinTwin AI • Financial Digital Twin
                    </div>

                </div>

            </section>

        </main>
    );
}


// =========================================================
// TOGGLE COMPONENT
// =========================================================

function ToggleRow({
    title,
    description,
    checked,
    onChange,
}: {
    title: string;
    description: string;
    checked: boolean;
    onChange: (value: boolean) => void;
}) {

    return (

        <div
            className="flex items-center justify-between gap-5 rounded-xl border p-5"
            style={{
                backgroundColor: "var(--background)",
                borderColor: "var(--border)",
            }}
        >

            <div className="min-w-0">

                <p
                    className="font-medium"
                    style={{ color: "var(--foreground)" }}
                >
                    {title}
                </p>

                <p
                    className="mt-1 text-sm"
                    style={{ color: "var(--muted)" }}
                >
                    {description}
                </p>

            </div>


            <button
                type="button"
                onClick={() =>
                    onChange(!checked)
                }
                aria-pressed={checked}
                className={`relative h-7 w-12 shrink-0 rounded-full transition ${
                    checked
                        ? "bg-emerald-500"
                        : "bg-slate-300"
                }`}
                style={
                    !checked
                        ? { backgroundColor: "var(--border)" }
                        : undefined
                }
            >

                <span
                    className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
                        checked
                            ? "left-6"
                            : "left-1"
                    }`}
                />

            </button>

        </div>
    );
}