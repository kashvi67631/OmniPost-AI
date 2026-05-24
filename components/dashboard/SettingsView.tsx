"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { fetchUser, updateUserProfile } from "@/lib/api/client";
import type { ApiUser } from "@/lib/types/api";
import { DataState } from "@/components/ui/DataState";

const SETTINGS_NAV = ["Profile", "Notifications", "Integrations", "Billing"] as const;

type SettingsViewProps = {
  userEmail: string;
  onProfileSaved?: (user: ApiUser) => void;
};

export function SettingsView({ userEmail, onProfileSaved }: SettingsViewProps) {
  const [activeSection, setActiveSection] = useState<(typeof SETTINGS_NAV)[number]>("Profile");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <SettingsHeader />

      <SettingsGrid
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        userEmail={userEmail}
        onProfileSaved={onProfileSaved}
      />
    </motion.div>
  );
}

function SettingsHeader() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-white sm:text-3xl">Settings</h1>
      <p className="mt-2 text-sm text-muted">
        Manage your account preferences and integrations.
      </p>
    </div>
  );
}

function SettingsGrid({
  activeSection,
  setActiveSection,
  userEmail,
  onProfileSaved,
}: {
  activeSection: (typeof SETTINGS_NAV)[number];
  setActiveSection: (section: (typeof SETTINGS_NAV)[number]) => void;
  userEmail: string;
  onProfileSaved?: (user: ApiUser) => void;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
      <nav className="glass-panel flex gap-1 overflow-x-auto rounded-[24px] p-2 lg:flex-col lg:overflow-visible">
        {SETTINGS_NAV.map((section) => (
          <button
            key={section}
            type="button"
            onClick={() => setActiveSection(section)}
            className={`focus-ring flex-shrink-0 rounded-xl px-4 py-2.5 text-left text-sm font-medium transition-all duration-300 ${
              activeSection === section
                ? "bg-white/[0.08] text-white"
                : "text-muted hover:text-white/70"
            }`}
          >
            {section}
          </button>
        ))}
      </nav>

      <div className="glass-panel rounded-[28px] p-6 sm:p-8">
        {activeSection === "Profile" ? (
          <ProfileForm userEmail={userEmail} onProfileSaved={onProfileSaved} />
        ) : (
          <p className="text-sm text-muted">{activeSection} settings coming soon.</p>
        )}
      </div>
    </div>
  );
}

function ProfileForm({
  userEmail,
  onProfileSaved,
}: {
  userEmail: string;
  onProfileSaved?: (user: ApiUser) => void;
}) {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [name, setName] = useState("");
  const [timezone, setTimezone] = useState("");
  const [company, setCompany] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!userEmail) {
      setLoading(false);
      setError("Enter your founder email in Workspace to manage settings.");
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchUser(userEmail);
        if (!cancelled) {
          setUser(data.user);
          setName(data.user.name ?? "");
          setTimezone(data.user.timezone ?? "");
          setCompany(data.user.company ?? "");
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load profile.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [userEmail]);

  async function handleSave() {
    if (!userEmail) return;
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const data = await updateUserProfile(userEmail, {
        name,
        timezone,
        company,
      });
      setUser(data.user);
      onProfileSaved?.(data.user);
      setSuccess("Profile saved successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile.");
    } finally {
      setSaving(false);
    }
  }

  const initials = (name || userEmail || "OP")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <DataState loading={loading} error={error}>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <ProfileAvatar initials={initials} />
          <div>
            <p className="text-sm font-semibold text-white">{name || user?.email}</p>
            <p className="text-xs text-muted">{user?.email}</p>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <SettingsField label="Full Name" value={name} onChange={setName} />
          <SettingsField label="Email" value={userEmail} readOnly type="email" />
          <SettingsField label="Timezone" value={timezone} onChange={setTimezone} />
          <SettingsField label="Company" value={company} onChange={setCompany} />
        </div>

        {success && (
          <p className="text-sm text-emerald-400" role="status">
            {success}
          </p>
        )}

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="btn-gradient focus-ring rounded-2xl px-6 py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </DataState>
  );
}

function ProfileAvatar({ initials }: { initials: string }) {
  return (
    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-lg font-bold text-white ring-2 ring-white/10">
      {initials}
    </div>
  );
}

function SettingsField({
  label,
  value,
  onChange,
  readOnly,
  type = "text",
}: {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium uppercase tracking-wider text-muted">
        {label}
      </span>
      <input
        type={type}
        value={value}
        readOnly={readOnly}
        onChange={(event) => onChange?.(event.target.value)}
        className="focus-ring mt-2 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-white outline-none transition-all duration-300 focus:border-accent-orange/30 read-only:opacity-70"
      />
    </label>
  );
}
