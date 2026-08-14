"use client";

import { useEffect, useRef, useState } from "react";
import {
  User,
  Mail,
  ShieldCheck,
  Edit3,
  Save,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  BrainCircuit,
  BadgeCheck,
  Camera,
  Copy,
} from "lucide-react";

import Sidebar from "../../components/layout/Sidebar";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

interface ProfileData {
  id: number;
  fintwin_user_id?: string | null;
  name: string;
  email: string;
  profile_picture?: string | null;

  account?: {
    user_id?: number;
    account_status?: string;
    authentication?: string;
  };
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const [editing, setEditing] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // =========================================================
  // GET TOKEN
  // =========================================================

  const getToken = () => {
    if (typeof window === "undefined") return null;

    return (
      localStorage.getItem("token") ||
      localStorage.getItem("access_token") ||
      localStorage.getItem("accessToken")
    );
  };

  // =========================================================
  // LOAD PROFILE
  // =========================================================

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        setError(
          "Authentication token not found. Please login again."
        );
        return;
      }

      const response = await fetch(`${API_URL}/profile/me`, {
        method: "GET",

        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },

        cache: "no-store",
      });

      if (response.status === 401) {
        throw new Error(
          "Your session has expired. Please login again."
        );
      }

      if (!response.ok) {
        const data = await response.json().catch(() => null);

        throw new Error(
          data?.detail || "Unable to load profile."
        );
      }

      const data: ProfileData = await response.json();

      setProfile(data);

      setName(data.name || "");
      setEmail(data.email || "");
    } catch (err) {
      console.error("Profile Error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load profile."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // LOAD PROFILE ON PAGE OPEN
  // =========================================================

  useEffect(() => {
    loadProfile();
  }, []);

  // =========================================================
  // UPDATE PROFILE
  // =========================================================

  const updateProfile = async () => {
    if (!name.trim()) {
      setError("Name cannot be empty.");
      return;
    }

    if (!email.trim()) {
      setError("Email cannot be empty.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const token = getToken();

      if (!token) {
        setError(
          "Authentication token not found. Please login again."
        );
        return;
      }

      const response = await fetch(`${API_URL}/profile/me`, {
        method: "PUT",

        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
        }),
      });

      if (response.status === 401) {
        throw new Error(
          "Your session has expired. Please login again."
        );
      }

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.detail || "Failed to update profile."
        );
      }

      setSuccess("Profile updated successfully.");
      setEditing(false);

      await loadProfile();
    } catch (err) {
      console.error("Update Profile Error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to update profile."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // PROFILE PICTURE
  // =========================================================

  const handlePhotoSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setError("");
    setSuccess("");

    // Basic validation
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    // 5 MB maximum
    if (file.size > 5 * 1024 * 1024) {
      setError("Profile picture must be smaller than 5 MB.");
      return;
    }

    try {
      setUploadingPhoto(true);

      const token = getToken();

      if (!token) {
        setError(
          "Authentication token not found. Please login again."
        );
        return;
      }

      const formData = new FormData();

      formData.append("file", file);

      const response = await fetch(
        `${API_URL}/profile/photo`,
        {
          method: "POST",

          headers: {
            Authorization: `Bearer ${token}`,
          },

          body: formData,
        }
      );

      if (response.status === 401) {
        throw new Error(
          "Your session has expired. Please login again."
        );
      }

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.detail ||
            "Failed to upload profile picture."
        );
      }

      setSuccess(
        "Profile picture updated successfully."
      );

      await loadProfile();
    } catch (err) {
      console.error(
        "Profile Picture Upload Error:",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "Failed to upload profile picture."
      );
    } finally {
      setUploadingPhoto(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // =========================================================
  // COPY FINTWIN ID
  // =========================================================

  const copyFinTwinId = async () => {
    if (!profile?.fintwin_user_id) return;

    try {
      await navigator.clipboard.writeText(
        profile.fintwin_user_id
      );

      setSuccess("FinTwin User ID copied.");
    } catch {
      setError("Unable to copy FinTwin User ID.");
    }
  };

  // =========================================================
  // CANCEL EDIT
  // =========================================================

  const cancelEdit = () => {
    if (profile) {
      setName(profile.name || "");
      setEmail(profile.email || "");
    }

    setEditing(false);
    setError("");
    setSuccess("");
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <main className="flex h-screen overflow-hidden bg-slate-950 text-white">
        <Sidebar />

        <section className="flex h-screen flex-1 items-center justify-center overflow-y-auto">
          <div className="text-center">
            <Loader2
              className="mx-auto animate-spin text-emerald-400"
              size={38}
            />

            <p className="mt-4 text-sm text-slate-400">
              Loading your FinTwin profile...
            </p>
          </div>
        </section>
      </main>
    );
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <main className="flex h-screen overflow-hidden bg-slate-950 text-white">
      <Sidebar />

      <section className="h-screen flex-1 overflow-y-auto bg-slate-950 p-8">
        <div className="mx-auto max-w-7xl">

          {/* ================================================= */}
          {/* HEADER */}
          {/* ================================================= */}

          <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-center">

            <div className="flex items-center gap-4">

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10">
                <User
                  className="text-emerald-400"
                  size={25}
                />
              </div>

              <div>
                <h1 className="text-3xl font-bold">
                  My Profile
                </h1>

                <p className="mt-1 text-sm text-slate-400">
                  Manage your FinTwin AI account information.
                </p>
              </div>

            </div>

            {!editing ? (
              <button
                onClick={() => {
                  setEditing(true);
                  setSuccess("");
                  setError("");
                }}
                className="flex items-center justify-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-5 py-3 text-sm font-medium text-emerald-400 transition hover:bg-emerald-500/20"
              >
                <Edit3 size={17} />
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-3">

                <button
                  onClick={cancelEdit}
                  disabled={saving}
                  className="flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-3 text-sm text-slate-300 transition hover:bg-slate-900"
                >
                  <X size={17} />
                  Cancel
                </button>

                <button
                  onClick={updateProfile}
                  disabled={saving}
                  className="flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={17} />
                      Save Changes
                    </>
                  )}
                </button>

              </div>
            )}

          </div>

          {/* ================================================= */}
          {/* ERROR */}
          {/* ================================================= */}

          {error && (
            <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
              <AlertCircle size={19} />
              {error}
            </div>
          )}

          {/* ================================================= */}
          {/* SUCCESS */}
          {/* ================================================= */}

          {success && (
            <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-400">
              <CheckCircle2 size={19} />
              {success}
            </div>
          )}

          {/* ================================================= */}
          {/* PROFILE */}
          {/* ================================================= */}

          {profile && (
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">

              {/* ================================================= */}
              {/* LEFT PROFILE CARD */}
              {/* ================================================= */}

              <div className="rounded-2xl border border-slate-800 bg-slate-900 p-7">

                <div className="flex flex-col items-center text-center">

                  {/* PROFILE IMAGE */}

                  <div className="relative">

                    <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-4 border-emerald-500/30 bg-emerald-500/10">

                      {profile.profile_picture ? (
                        <img
                          src={
                            profile.profile_picture.startsWith(
                              "http"
                            )
                              ? profile.profile_picture
                              : `${API_URL}${profile.profile_picture}`
                          }
                          alt="Profile"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-5xl font-bold text-emerald-400">
                          {profile.name
                            ? profile.name
                                .charAt(0)
                                .toUpperCase()
                            : "U"}
                        </span>
                      )}

                    </div>

                    {/* CAMERA BUTTON */}

                    <button
                      type="button"
                      onClick={() =>
                        fileInputRef.current?.click()
                      }
                      disabled={uploadingPhoto}
                      className="absolute bottom-0 right-0 flex h-10 w-10 items-center justify-center rounded-full border-4 border-slate-900 bg-emerald-500 text-slate-950 shadow-lg transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                      title="Change profile picture"
                    >
                      {uploadingPhoto ? (
                        <Loader2
                          size={17}
                          className="animate-spin"
                        />
                      ) : (
                        <Camera size={17} />
                      )}
                    </button>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      onChange={handlePhotoSelect}
                      className="hidden"
                    />

                  </div>

                  {/* CHANGE PHOTO */}

                  <button
                    type="button"
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                    disabled={uploadingPhoto}
                    className="mt-4 text-sm font-medium text-emerald-400 transition hover:text-emerald-300 disabled:opacity-50"
                  >
                    {uploadingPhoto
                      ? "Uploading..."
                      : "Change Profile Photo"}
                  </button>

                  {/* NAME */}

                  <h2 className="mt-5 text-2xl font-bold">
                    {profile.name}
                  </h2>

                  {/* EMAIL */}

                  <p className="mt-1 text-sm text-slate-400">
                    {profile.email}
                  </p>

                  {/* STATUS */}

                  <div className="mt-4 flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-xs font-medium text-emerald-400">

                    <BadgeCheck size={15} />

                    {profile.account?.account_status ||
                      "Active"}

                  </div>

                </div>

                <div className="my-7 border-t border-slate-800" />

                {/* ================================================= */}
                {/* FINTWIN USER ID */}
                {/* ================================================= */}

                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">

                  <div className="flex items-center justify-between">

                    <div>
                      <p className="text-xs uppercase tracking-wider text-slate-500">
                        FinTwin User ID
                      </p>

                      <p className="mt-2 text-lg font-bold tracking-wide text-emerald-400">
                        {profile.fintwin_user_id ||
                          `FT-${profile.id}`}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={copyFinTwinId}
                      className="rounded-lg border border-slate-700 p-2 text-slate-400 transition hover:border-emerald-500/40 hover:text-emerald-400"
                      title="Copy FinTwin ID"
                    >
                      <Copy size={17} />
                    </button>

                  </div>

                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    Your unique FinTwin AI account identifier.
                  </p>

                </div>

                <div className="my-7 border-t border-slate-800" />

                {/* ACCOUNT DETAILS */}

                <div className="space-y-5">

                  <ProfileInfo
                    label="Database ID"
                    value={`#${profile.id}`}
                  />

                  <ProfileInfo
                    label="Account Status"
                    value={
                      profile.account?.account_status ||
                      "Active"
                    }
                  />

                  <ProfileInfo
                    label="Authentication"
                    value={
                      profile.account?.authentication ||
                      "JWT"
                    }
                  />

                </div>

              </div>

              {/* ================================================= */}
              {/* RIGHT SIDE */}
              {/* ================================================= */}

              <div className="space-y-6 xl:col-span-2">

                {/* ================================================= */}
                {/* PERSONAL INFORMATION */}
                {/* ================================================= */}

                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-7">

                  <div className="mb-7 flex items-center gap-3">

                    <User
                      size={21}
                      className="text-emerald-400"
                    />

                    <div>
                      <h2 className="text-lg font-semibold">
                        Personal Information
                      </h2>

                      <p className="text-sm text-slate-400">
                        Your basic account details.
                      </p>
                    </div>

                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

                    {/* NAME */}

                    <div>

                      <label className="mb-2 block text-sm text-slate-400">
                        Full Name
                      </label>

                      <div className="relative">

                        <User
                          size={18}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                        />

                        <input
                          type="text"
                          value={name}
                          onChange={(e) =>
                            setName(e.target.value)
                          }
                          disabled={!editing}
                          className={`w-full rounded-xl border py-3.5 pl-11 pr-4 outline-none transition ${
                            editing
                              ? "border-slate-700 bg-slate-950 text-white focus:border-emerald-500"
                              : "cursor-not-allowed border-slate-800 bg-slate-950/50 text-slate-300"
                          }`}
                        />

                      </div>

                    </div>

                    {/* EMAIL */}

                    <div>

                      <label className="mb-2 block text-sm text-slate-400">
                        Email Address
                      </label>

                      <div className="relative">

                        <Mail
                          size={18}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                        />

                        <input
                          type="email"
                          value={email}
                          onChange={(e) =>
                            setEmail(e.target.value)
                          }
                          disabled={!editing}
                          className={`w-full rounded-xl border py-3.5 pl-11 pr-4 outline-none transition ${
                            editing
                              ? "border-slate-700 bg-slate-950 text-white focus:border-emerald-500"
                              : "cursor-not-allowed border-slate-800 bg-slate-950/50 text-slate-300"
                          }`}
                        />

                      </div>

                    </div>

                  </div>

                  {editing && (
                    <p className="mt-5 text-xs text-slate-500">
                      Update your information and click
                      &quot;Save Changes&quot; to apply the
                      changes.
                    </p>
                  )}

                </div>

                {/* ================================================= */}
                {/* ACCOUNT INFORMATION */}
                {/* ================================================= */}

                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-7">

                  <div className="mb-6 flex items-center gap-3">

                    <ShieldCheck
                      size={21}
                      className="text-emerald-400"
                    />

                    <div>
                      <h2 className="text-lg font-semibold">
                        Account Information
                      </h2>

                      <p className="text-sm text-slate-400">
                        Security and authentication details.
                      </p>
                    </div>

                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">

                    <AccountCard
                      title="Account Status"
                      value={
                        profile.account?.account_status ||
                        "Active"
                      }
                    />

                    <AccountCard
                      title="Authentication"
                      value={
                        profile.account?.authentication ||
                        "JWT"
                      }
                    />

                    <AccountCard
                      title="FinTwin ID"
                      value={
                        profile.fintwin_user_id ||
                        `FT-${profile.id}`
                      }
                    />

                  </div>

                </div>

                {/* ================================================= */}
                {/* FINTWIN APPLICATION */}
                {/* ================================================= */}

                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-7">

                  <div className="flex items-start gap-4">

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">

                      <BrainCircuit
                        size={24}
                        className="text-emerald-400"
                      />

                    </div>

                    <div>

                      <p className="text-xs font-medium uppercase tracking-wider text-emerald-400">
                        FinTwin AI
                      </p>

                      <h2 className="mt-1 text-xl font-semibold">
                        Financial Digital Twin
                      </h2>

                      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                        Your intelligent personal finance
                        platform for tracking spending,
                        managing budgets, monitoring savings
                        goals, generating reports and
                        receiving AI-powered financial
                        insights.
                      </p>

                      <div className="mt-5 flex flex-wrap gap-2">

                        <FeatureBadge text="Personal Finance" />

                        <FeatureBadge text="Financial Analytics" />

                        <FeatureBadge text="AI Twin" />

                        <FeatureBadge text="JWT Secured" />

                      </div>

                    </div>

                  </div>

                </div>

              </div>

            </div>
          )}

        </div>
      </section>
    </main>
  );
}

// =========================================================
// SMALL COMPONENTS
// =========================================================

function ProfileInfo({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">

      <span className="text-sm text-slate-500">
        {label}
      </span>

      <span className="text-right text-sm font-medium text-slate-200">
        {value}
      </span>

    </div>
  );
}

function AccountCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-5">

      <p className="text-xs text-slate-500">
        {title}
      </p>

      <div className="mt-3 flex items-center gap-2">

        <CheckCircle2
          size={16}
          className="shrink-0 text-emerald-400"
        />

        <p className="break-all font-semibold text-slate-200">
          {value}
        </p>

      </div>

    </div>
  );
}

function FeatureBadge({
  text,
}: {
  text: string;
}) {
  return (
    <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-400">
      {text}
    </span>
  );
}