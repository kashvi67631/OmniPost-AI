"use client";

import { useEffect, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import {
  disconnectIntegration,
  fetchIntegrations,
  fetchUser,
  saveIntegrations,
  updateUserProfile,
} from "@/lib/api/client";
import type { IntegrationItem } from "@/lib/types/api";
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
        ) : activeSection === "Integrations" ? (
          <IntegrationsForm userEmail={userEmail} />
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

function IntegrationsForm({ userEmail }: { userEmail: string }) {
  const [integrations, setIntegrations] = useState<IntegrationItem[]>([]);
  const [twitterToken, setTwitterToken] = useState("");
  const [twitterUsername, setTwitterUsername] = useState("");
  const [linkedinToken, setLinkedinToken] = useState("");
  const [linkedinUrn, setLinkedinUrn] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!userEmail) {
      setLoading(false);
      setError("Enter your founder email in Workspace to manage integrations.");
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchIntegrations(userEmail);
        if (!cancelled) setIntegrations(data.integrations);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load integrations.");
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
    if (!twitterToken.trim() && !linkedinToken.trim()) {
      setError("Enter at least one access token to save.");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const data = await saveIntegrations(userEmail, {
        ...(twitterToken.trim() && { twitterAccessToken: twitterToken.trim() }),
        ...(twitterUsername.trim() && { twitterUsername: twitterUsername.trim() }),
        ...(linkedinToken.trim() && { linkedinAccessToken: linkedinToken.trim() }),
        ...(linkedinUrn.trim() && { linkedinPersonUrn: linkedinUrn.trim() }),
      });
      setIntegrations(data.integrations);
      setTwitterToken("");
      setLinkedinToken("");
      setSuccess("Integrations saved. You can publish live from Workspace.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save integrations.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDisconnect(platform: "twitter" | "linkedin") {
    if (!userEmail) return;
    setSaving(true);
    setError(null);
    try {
      const data = await disconnectIntegration(userEmail, platform);
      setIntegrations(data.integrations);
      setSuccess(`${platform} disconnected.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to disconnect.");
    } finally {
      setSaving(false);
    }
  }

  const twitter = integrations.find((i) => i.platform === "twitter");
  const linkedin = integrations.find((i) => i.platform === "linkedin");

  return (
    <DataState loading={loading} error={error}>
      <div className="space-y-8">
        <div>
          <h2 className="text-lg font-semibold text-white">Platform connections</h2>
          <p className="mt-1 text-sm text-muted">
            Connect OAuth access tokens to publish live to Twitter/X and LinkedIn.
            Tokens are stored encrypted in your database.
          </p>
        </div>

        <IntegrationCard
          title="Twitter / X"
          connected={twitter?.connected ?? false}
          statusLine={
            twitter?.connected
              ? `Connected${twitter.accountName ? ` — @${twitter.accountName.replace(/^@/, "")}` : ""}`
              : "Not connected"
          }
          onDisconnect={
            twitter?.connected && twitter.tokenPreview !== "env"
              ? () => handleDisconnect("twitter")
              : undefined
          }
        >
          <SettingsField
            label="Access token (OAuth 2.0 user)"
            value={twitterToken}
            onChange={setTwitterToken}
            type="password"
            placeholder={twitter?.connected ? "•••••••• (leave blank to keep)" : ""}
          />
          <SettingsField
            label="Username (optional)"
            value={twitterUsername}
            onChange={setTwitterUsername}
            placeholder="@founder"
          />
        </IntegrationCard>

        <IntegrationCard
          title="LinkedIn"
          connected={linkedin?.connected ?? false}
          statusLine={
            linkedin?.connected
              ? `Connected${linkedin.externalId ? ` — ${linkedin.externalId}` : ""}`
              : "Not connected"
          }
          onDisconnect={
            linkedin?.connected && linkedin.tokenPreview !== "env"
              ? () => handleDisconnect("linkedin")
              : undefined
          }
        >
          <SettingsField
            label="Access token"
            value={linkedinToken}
            onChange={setLinkedinToken}
            type="password"
          />
          <SettingsField
            label="Person URN or ID"
            value={linkedinUrn}
            onChange={setLinkedinUrn}
            placeholder="urn:li:person:XXXX or numeric ID"
          />
        </IntegrationCard>

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
          {saving ? "Saving..." : "Save integrations"}
        </button>
      </div>
    </DataState>
  );
}

function IntegrationCard({
  title,
  connected,
  statusLine,
  onDisconnect,
  children,
}: {
  title: string;
  connected: boolean;
  statusLine: string;
  onDisconnect?: () => void;
  children: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          <p className={`mt-0.5 text-xs ${connected ? "text-emerald-400" : "text-muted"}`}>
            {statusLine}
          </p>
        </div>
        {onDisconnect && (
          <button
            type="button"
            onClick={onDisconnect}
            className="focus-ring rounded-lg px-3 py-1.5 text-xs text-red-400/90 hover:bg-red-500/10"
          >
            Disconnect
          </button>
        )}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </div>
  );
}

function SettingsField({
  label,
  value,
  onChange,
  readOnly,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  type?: string;
  placeholder?: string;
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
        placeholder={placeholder}
        onChange={(event) => onChange?.(event.target.value)}
        className="focus-ring mt-2 w-full rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm text-white outline-none transition-all duration-300 placeholder:text-white/25 focus:border-accent-orange/30 read-only:opacity-70"
      />
    </label>
  );
}
