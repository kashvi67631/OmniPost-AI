"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const CHANNEL_OPTIONS = [
  {
    key: "twitter",
    label: "Twitter",
    description: "Pulse your audience with one tap",
    accent: "border-sky-300/70 bg-sky-500/10",
    glow: "shadow-[0_0_0_14px_rgba(56,189,248,0.18)]",
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    description: "Share with your professional network",
    accent: "border-indigo-300/70 bg-indigo-500/10",
    glow: "shadow-[0_0_0_14px_rgba(129,140,248,0.18)]",
  },
];

export default function Page() {
  const [selectedChannels, setSelectedChannels] = useState<string[]>([
    "twitter",
    "linkedin",
  ]);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [message, setMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [rawInput, setRawInput] = useState("");
  const [isGenerated, setIsGenerated] = useState(false);

  const toggleChannel = (channel: string) => {
    setSelectedChannels((current) =>
      current.includes(channel)
        ? current.filter((item) => item !== channel)
        : [...current, channel]
    );
  };

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

    try {
      const response = await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Omnipost Pipeline Dispatch",
          content: rawInput,
          channels: selectedChannels,
          email: userEmail,
        }),
      });

      const data = await response.json();

      if (response.ok && data.status === "SUCCESS") {
        setStatus("success");
        setMessage(
          data.message ??
            `Dispatched Live to ${selectedChannels.join(" and ")}!`
        );
        setShowModal(true);
      } else {
        setStatus("error");
        setMessage(data?.message ?? "Publish failed. Please try again.");
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Try again in a moment.");
    }
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.12),_transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(168,85,247,0.08),_transparent_30%)]" />
        <div className="relative mx-auto max-w-6xl px-6 py-14 sm:px-8">
          <motion.section
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden rounded-[32px] border border-zinc-800/70 bg-zinc-950/95 shadow-[0_35px_110px_rgba(15,23,42,0.55)]"
          >
            <div className="bg-zinc-950/95 px-8 py-10 sm:px-10 sm:py-12">
              <div className="max-w-3xl">
                <span className="inline-flex rounded-full border border-sky-300/20 bg-sky-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.36em] text-sky-200">
                  Premium workspace
                </span>
                <h1 className="mt-6 text-4xl font-semibold tracking-tight text-zinc-50 sm:text-5xl">
                  Publish Live with obsidian-grade polish.
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400">
                  Transform your publish workflow into a luxury SaaS experience
                  with gradient motion, glassmorphism, and elevated interaction
                  states.
                </p>

                <div className="mt-8 rounded-xl border border-zinc-800/80 bg-zinc-900/30 px-4 py-4 backdrop-blur-md sm:px-5">
                  <div className="flex items-center gap-3 text-sm text-zinc-300">
                    <svg
                      viewBox="0 0 24 24"
                      className="h-5 w-5 flex-none text-cyan-300"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M4 4h16v16H4z" />
                      <path d="M22 6l-10 7L2 6" />
                      <path d="M2 18l8-6 8 6" />
                    </svg>
                    <label className="min-w-0 flex-1">
                      <div className="text-xs uppercase tracking-[0.32em] text-zinc-400">
                        Founder Email
                      </div>
                      <input
                        type="email"
                        value={userEmail}
                        onChange={(event) => setUserEmail(event.target.value)}
                        placeholder="you@company.com"
                        className="mt-2 w-full bg-transparent text-sm text-zinc-100 outline-none placeholder:text-zinc-600"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-zinc-800/70 px-8 py-10 sm:px-10">
              <div className="mb-8">
                <textarea
                  value={rawInput}
                  onChange={(event) => setRawInput(event.target.value)}
                  placeholder="Paste your source article URL or drop your core content context here..."
                  className="w-full min-h-[120px] rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4 text-sm text-zinc-200 outline-none transition-all placeholder:text-zinc-600 focus:border-cyan-500/50"
                />
              </div>

              <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
                <div>
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-semibold text-white">
                        Select channels
                      </h2>
                      <p className="mt-2 text-sm leading-6 text-zinc-400">
                        Tap the cards below to toggle each destination in your
                        broadcast.
                      </p>
                    </div>
                    <div className="rounded-full bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.32em] text-zinc-300">
                      Pro mode
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    {CHANNEL_OPTIONS.map((channel) => {
                      const active = selectedChannels.includes(channel.key);
                      return (
                        <button
                          key={channel.key}
                          type="button"
                          onClick={() => toggleChannel(channel.key)}
                          className={`group relative overflow-hidden rounded-[28px] border p-5 text-left transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-sky-400/30 ${
                            active
                              ? `${channel.accent} ${channel.glow} border-opacity-80`
                              : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-700 hover:bg-zinc-900/60"
                          }`}
                        >
                          <div className="absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100">
                            <div className="h-full w-full bg-[radial-gradient(circle,_rgba(56,189,248,0.12),_transparent_36%)]" />
                          </div>
                          <span className="relative inline-flex text-xs font-semibold uppercase tracking-[0.32em] text-zinc-300">
                            {channel.label}
                          </span>
                          <p className="relative mt-4 text-lg font-semibold text-white">
                            {channel.description}
                          </p>
                          <span className="relative mt-5 inline-flex items-center gap-2 text-sm text-zinc-300">
                            <span
                              className={`inline-flex h-2.5 w-2.5 rounded-full ${
                                active ? "bg-sky-400" : "bg-zinc-600"
                              }`}
                            />
                            {active ? "Enabled" : "Tap to enable"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-[30px] border border-zinc-800/80 bg-zinc-900/70 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.35)] backdrop-blur-xl">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm uppercase tracking-[0.32em] text-zinc-400">
                        Publish workflow
                      </p>
                      <h3 className="mt-3 text-2xl font-semibold text-white">
                        Ready to broadcast
                      </h3>
                    </div>
                    <div className="rounded-full bg-sky-500/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.32em] text-sky-200">
                      Live
                    </div>
                  </div>

                  <motion.button
                    type="button"
                    onClick={handlePublish}
                    disabled={
                      status === "loading" ||
                      selectedChannels.length === 0 ||
                      !userEmail.trim() ||
                      !rawInput.trim()
                    }
                    whileHover={
                      status !== "loading" &&
                      selectedChannels.length > 0 &&
                      userEmail.trim() &&
                      rawInput.trim()
                        ? { scale: 1.02 }
                        : undefined
                    }
                    className={`mt-8 inline-flex w-full items-center justify-center gap-3 rounded-full px-8 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-white transition-all duration-300 ${
                      status === "loading" ||
                      selectedChannels.length === 0 ||
                      !userEmail.trim() ||
                      !rawInput.trim()
                        ? "cursor-not-allowed bg-zinc-700/80 text-zinc-300"
                        : "bg-gradient-to-r from-sky-400 via-cyan-400 to-indigo-500 shadow-[0_20px_60px_rgba(56,189,248,0.18)] hover:shadow-[0_24px_80px_rgba(56,189,248,0.24)]"
                    }`}
                  >
                    {status === "loading" ? (
                      <motion.span
                        className="inline-flex h-5 w-5 rounded-full border-2 border-white/20 border-t-white"
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, ease: "linear", duration: 0.8 }}
                      />
                    ) : null}
                    {status === "loading" ? "Publishing..." : "Publish Live"}
                  </motion.button>

                  <p className="mt-5 text-sm leading-6 text-zinc-400">
                    Every publish is layered with premium motion, polished states,
                    and instant feedback.
                  </p>

                  {status === "error" && (
                    <div className="mt-4 rounded-2xl bg-rose-500/10 px-4 py-3 text-sm text-rose-200 ring-1 ring-rose-400/10">
                      {message}
                    </div>
                  )}
                </div>
              </div>

              <AnimatePresence>
                {showModal ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className="mt-10 rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-[0_30px_90px_rgba(56,189,248,0.12)] backdrop-blur-3xl"
                  >
                    <div className="flex gap-4">
                      <motion.div
                        initial={{ scale: 0.85, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.32, ease: "easeOut" }}
                        className="flex h-16 w-16 items-center justify-center rounded-3xl bg-sky-500/10 text-sky-200 ring-1 ring-sky-300/20"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className="h-8 w-8"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                      </motion.div>

                      <div className="space-y-2">
                        <p className="text-xs uppercase tracking-[0.32em] text-zinc-400">
                          Success
                        </p>
                        <h3 className="text-2xl font-semibold text-white">
                          {message}
                        </h3>
                        <p className="max-w-xl text-sm leading-6 text-zinc-400">
                          Your content has been dispatched to the selected
                          destinations with premium validation and a luxury
                          confirmation layer.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </motion.section>
        </div>
      </div>
    </main>
  );
}
