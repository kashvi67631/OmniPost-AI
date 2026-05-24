"use client";

import { motion } from "framer-motion";
import {
  CheckIcon,
  EmailIcon,
  LinkedInIcon,
  SendIcon,
  TwitterIcon,
} from "@/components/ui/icons";

const CHANNEL_OPTIONS = [
  {
    key: "twitter",
    label: "Twitter",
    description: "Pulse your audience with one tap",
    Icon: TwitterIcon,
    activeBorder: "border-sky-400/70",
    activeGlow:
      "shadow-[0_0_0_1px_rgba(56,189,248,0.5),0_0_40px_rgba(56,189,248,0.15)]",
    activeBg: "bg-sky-500/[0.06]",
    checkColor: "border-sky-400 bg-sky-400/20 text-sky-400",
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    description: "Share with your professional network",
    Icon: LinkedInIcon,
    activeBorder: "border-indigo-400/70",
    activeGlow:
      "shadow-[0_0_0_1px_rgba(129,140,248,0.5),0_0_40px_rgba(129,140,248,0.15)]",
    activeBg: "bg-indigo-500/[0.06]",
    checkColor: "border-indigo-400 bg-indigo-400/20 text-indigo-400",
  },
] as const;

const CONTENT_TYPES = ["URL", "Article", "Thread", "Script", "Launch"] as const;

export type PublishStatus = "idle" | "loading" | "success" | "error";

export type WorkspaceViewProps = {
  userEmail: string;
  setUserEmail: (v: string) => void;
  rawInput: string;
  setRawInput: (v: string) => void;
  selectedChannels: string[];
  toggleChannel: (channel: string) => void;
  contentType: string;
  setContentType: (v: string) => void;
  status: PublishStatus;
  errorMessage: string;
  onPublish: () => void;
};

type ChannelOption = (typeof CHANNEL_OPTIONS)[number];

function ChannelCard({
  channel,
  active,
}: {
  channel: ChannelOption;
  active: boolean;
}) {
  const { Icon } = channel;

  return (
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-3">
        <ChannelIcon active={active} Icon={Icon} />
        <div>
          <span className="text-sm font-semibold text-white">{channel.label}</span>
          <p className="mt-0.5 text-xs text-muted">{channel.description}</p>
        </div>
      </div>
      <div
        className={`flex h-5 w-5 items-center justify-center rounded-md border transition-all duration-300 ${
          active ? channel.checkColor : "border-white/20 bg-transparent"
        }`}
      >
        {active && <CheckIcon className="h-3 w-3" />}
      </div>
    </div>
  );
}

function ChannelIcon({
  active,
  Icon,
}: {
  active: boolean;
  Icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div
      className={`flex h-10 w-10 items-center justify-center rounded-xl ${
        active ? "bg-white/[0.08]" : "bg-white/[0.04]"
      }`}
    >
      <Icon className={`h-5 w-5 ${active ? "text-white" : "text-muted"}`} />
    </div>
  );
}

export function WorkspaceView({
  userEmail,
  setUserEmail,
  rawInput,
  setRawInput,
  selectedChannels,
  toggleChannel,
  contentType,
  setContentType,
  status,
  errorMessage,
  onPublish,
}: WorkspaceViewProps) {
  const canPublish =
    status !== "loading" &&
    selectedChannels.length > 0 &&
    userEmail.trim() &&
    rawInput.trim();

  const emailValid = userEmail.includes("@");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto max-w-3xl"
    >
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-[2.75rem] lg:leading-tight">
          One-Click{" "}
          <span className="gradient-text">AI Content Distribution</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
          Transform any source into platform-optimized posts and publish live
          across your channels in seconds.
        </p>
      </div>

      <div className="mt-10 space-y-5">
        <div className="glass-panel rounded-[24px] p-5 transition-all duration-300 focus-within:border-accent-orange/30 focus-within:shadow-[0_0_30px_rgba(255,101,63,0.08)]">
          <div className="flex items-center gap-3">
            <EmailIcon className="h-5 w-5 flex-shrink-0 text-muted" />
            <label className="min-w-0 flex-1">
              <span className="text-xs font-medium uppercase tracking-wider text-muted">
                Founder Email
              </span>
              <input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="you@company.com"
                className="focus-ring mt-1.5 w-full bg-transparent text-sm text-white outline-none placeholder:text-white/25"
              />
            </label>
            {emailValid && (
              <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                <CheckIcon className="h-3.5 w-3.5" />
              </div>
            )}
          </div>
        </div>

        <ContentContextSection
          rawInput={rawInput}
          setRawInput={setRawInput}
          contentType={contentType}
          setContentType={setContentType}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          {CHANNEL_OPTIONS.map((channel) => {
            const active = selectedChannels.includes(channel.key);
            return (
              <button
                key={channel.key}
                type="button"
                onClick={() => toggleChannel(channel.key)}
                className={`focus-ring group relative overflow-hidden rounded-[24px] border p-5 text-left transition-all duration-300 hover:scale-[1.02] ${
                  active
                    ? `${channel.activeBorder} ${channel.activeGlow} ${channel.activeBg}`
                    : "border-white/[0.08] bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.04]"
                }`}
              >
                <ChannelCard channel={channel} active={active} />
              </button>
            );
          })}
        </div>

        <motion.button
          type="button"
          onClick={onPublish}
          disabled={!canPublish}
          whileHover={canPublish ? { scale: 1.01, y: -2 } : undefined}
          whileTap={canPublish ? { scale: 0.99 } : undefined}
          className={`focus-ring flex w-full items-center justify-center gap-3 rounded-[24px] px-8 py-4 text-sm font-bold uppercase tracking-wider transition-all duration-300 ${
            canPublish
              ? "btn-gradient text-white"
              : "cursor-not-allowed bg-primary/60 text-white/40"
          }`}
        >
          {status === "loading" ? (
            <>
              <span className="inline-flex h-5 w-5 animate-spin-ring rounded-full border-2 border-white/20 border-t-white" />
              Publishing...
            </>
          ) : (
            <>
              <SendIcon className="h-4 w-4" />
              Publish Live
            </>
          )}
        </motion.button>

        {status === "error" && errorMessage && (
          <div
            role="alert"
            className="rounded-[20px] border border-rose-500/20 bg-rose-500/10 px-5 py-3.5 text-sm text-rose-300"
          >
            {errorMessage}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function ContentContextSection({
  rawInput,
  setRawInput,
  contentType,
  setContentType,
}: {
  rawInput: string;
  setRawInput: (v: string) => void;
  contentType: string;
  setContentType: (v: string) => void;
}) {
  return (
    <div className="glass-panel rounded-[24px] p-5 transition-all duration-300 focus-within:border-accent-orange/30 focus-within:shadow-[0_0_30px_rgba(255,101,63,0.08)]">
      <label>
        <span className="text-xs font-medium uppercase tracking-wider text-muted">
          Content Context
        </span>
        <textarea
          value={rawInput}
          onChange={(e) => setRawInput(e.target.value)}
          placeholder="Paste your source article URL or drop your core content context here..."
          rows={5}
          className="focus-ring mt-3 w-full resize-none bg-transparent text-sm leading-relaxed text-white outline-none placeholder:text-white/25"
        />
      </label>

      <div className="mt-4 flex flex-wrap gap-2">
        {CONTENT_TYPES.map((type) => {
          const active = contentType === type;
          return (
            <button
              key={type}
              type="button"
              onClick={() => setContentType(type)}
              className={`focus-ring rounded-full px-4 py-1.5 text-xs font-medium transition-all duration-300 ${
                active
                  ? "border border-secondary bg-secondary/40 text-white shadow-[0_0_20px_rgba(69,46,90,0.4)]"
                  : "border border-white/[0.06] bg-white/[0.03] text-muted hover:border-white/10 hover:text-white/70"
              }`}
            >
              {type}
            </button>
          );
        })}
      </div>
    </div>
  );
}
