"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { signIn } from "next-auth/react";
import { AnalyticsView } from "@/components/dashboard/AnalyticsView";
import { HistoryView } from "@/components/dashboard/HistoryView";
import { LoadingOverlay } from "@/components/dashboard/LoadingOverlay";
import { MobileNav, Sidebar, type NavItem } from "@/components/dashboard/Sidebar";
import { SettingsView } from "@/components/dashboard/SettingsView";
import { SuccessModal } from "@/components/dashboard/SuccessModal";
import { TemplatesView } from "@/components/dashboard/TemplatesView";
import { TopBar } from "@/components/dashboard/TopBar";
import {
  WorkspaceView,
  type PublishStatus,
} from "@/components/dashboard/WorkspaceView";
import { fetchUser, publishDispatch } from "@/lib/api/client";
import type { ApiUsage, ApiUser } from "@/lib/types/api";

const PROGRESS_STEPS = 4;
const EMAIL_STORAGE_KEY = "omnipost-founder-email";

export default function Page() {
  const [activeNav, setActiveNav] = useState<NavItem>("workspace");
  const [selectedChannels, setSelectedChannels] = useState<string[]>([
    "twitter",
    "linkedin",
  ]);
  const [status, setStatus] = useState<PublishStatus>("idle");
  const [message, setMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [rawInput, setRawInput] = useState("");
  const [contentType, setContentType] = useState("Article");
  const [loadingStep, setLoadingStep] = useState(0);
  const [user, setUser] = useState<ApiUser | null>(null);
  const [usage, setUsage] = useState<ApiUsage | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const stored = window.localStorage.getItem(EMAIL_STORAGE_KEY);
    if (stored) setUserEmail(stored);
  }, []);

  useEffect(() => {
    if (!userEmail.includes("@")) {
      setUser(null);
      setUsage(null);
      return;
    }

    window.localStorage.setItem(EMAIL_STORAGE_KEY, userEmail);

    let cancelled = false;

    async function bootstrapUser() {
      try {
        await signIn("credentials", {
          email: userEmail,
          name: userEmail.split("@")[0],
          redirect: false,
        });

        const data = await fetchUser(userEmail);
        if (!cancelled) {
          setUser(data.user);
          setUsage(data.usage);
        }
      } catch {
        if (!cancelled) {
          setUser(null);
          setUsage(null);
        }
      }
    }

    bootstrapUser();
    return () => {
      cancelled = true;
    };
  }, [userEmail, refreshKey]);

  const toggleChannel = useCallback((channel: string) => {
    setSelectedChannels((current) =>
      current.includes(channel)
        ? current.filter((item) => item !== channel)
        : [...current, channel]
    );
  }, []);

  useEffect(() => {
    if (status !== "loading") {
      setLoadingStep(0);
      return;
    }

    const interval = setInterval(() => {
      setLoadingStep((prev) => (prev < PROGRESS_STEPS - 1 ? prev + 1 : prev));
    }, 800);

    return () => clearInterval(interval);
  }, [status]);

  const handlePublish = async () => {
    if (!userEmail.trim()) {
      setStatus("error");
      setMessage("Founder Email is required to publish.");
      setShowModal(false);
      return;
    }

    if (!rawInput.trim()) {
      setStatus("error");
      setMessage("Provide a source URL or content context before publishing.");
      setShowModal(false);
      return;
    }

    setStatus("loading");
    setMessage("");
    setShowModal(false);
    setLoadingStep(0);

    try {
      const data = await publishDispatch(userEmail, {
        content: rawInput,
        contentType,
        channels: selectedChannels,
      });

      if (data.status === "SUCCESS") {
        setLoadingStep(PROGRESS_STEPS);
        await new Promise((resolve) => setTimeout(resolve, 600));
        setStatus("success");
        setMessage(
          data.message ??
            `Dispatched Live to ${selectedChannels.join(" and ")}!`
        );
        setShowModal(true);
        setRefreshKey((value) => value + 1);
      } else {
        setStatus("error");
        setMessage("Publish failed. Please try again.");
      }
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Network error. Try again.");
    }
  };

  const handleCreateAnother = () => {
    setShowModal(false);
    setStatus("idle");
    setMessage("");
    setRawInput("");
    setActiveNav("workspace");
  };

  const handleViewPosts = () => {
    setShowModal(false);
    setActiveNav("history");
    setRefreshKey((value) => value + 1);
  };

  const handleTemplateSelect = (content: string, templateTitle: string) => {
    setRawInput(content);
    setContentType(templateTitle);
    setActiveNav("workspace");
  };

  return (
    <div className="ambient-glow min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen max-w-[1400px] gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <Sidebar active={activeNav} onNavigate={setActiveNav} />

        <div className="min-w-0 flex-1">
          <TopBar user={user} usage={usage} />
          <MobileNav active={activeNav} onNavigate={setActiveNav} />

          <main className="mt-6 pb-12">
            {activeNav === "workspace" && (
              <WorkspaceView
                userEmail={userEmail}
                setUserEmail={setUserEmail}
                rawInput={rawInput}
                setRawInput={setRawInput}
                selectedChannels={selectedChannels}
                toggleChannel={toggleChannel}
                contentType={contentType}
                setContentType={setContentType}
                status={status}
                errorMessage={status === "error" ? message : ""}
                onPublish={handlePublish}
              />
            )}
            {activeNav === "history" && (
              <HistoryView key={`history-${refreshKey}`} userEmail={userEmail} />
            )}
            {activeNav === "templates" && (
              <TemplatesView
                userEmail={userEmail}
                onSelectTemplate={handleTemplateSelect}
              />
            )}
            {activeNav === "analytics" && (
              <AnalyticsView key={`analytics-${refreshKey}`} userEmail={userEmail} />
            )}
            {activeNav === "settings" && (
              <SettingsView
                userEmail={userEmail}
                onProfileSaved={(savedUser) => {
                  setUser(savedUser);
                  setRefreshKey((value) => value + 1);
                }}
              />
            )}
          </main>
        </div>
      </div>

      <AnimatePresence>
        {status === "loading" && <LoadingOverlay activeStep={loadingStep} />}
      </AnimatePresence>

      <SuccessModal
        open={showModal}
        message={message}
        channels={selectedChannels}
        onViewPosts={handleViewPosts}
        onCreateAnother={handleCreateAnother}
      />
    </div>
  );
}
