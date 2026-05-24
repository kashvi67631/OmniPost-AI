"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckIcon } from "@/components/ui/icons";

type SuccessModalProps = {
  open: boolean;
  message: string;
  channels: string[];
  onViewPosts: () => void;
  onCreateAnother: () => void;
};

function Confetti() {
  return (
    <ConfettiParticles />
  );
}

function ConfettiParticles() {
  return (
    <div className="confetti-wrap" aria-hidden="true">
      {Array.from({ length: 24 }).map((_, i) => (
        <span key={i} className="confetti-particle" />
      ))}
    </div>
  );
}

export function SuccessModal({
  open,
  message,
  channels,
  onViewPosts,
  onCreateAnother,
}: SuccessModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-xl"
          role="dialog"
          aria-modal="true"
          aria-labelledby="success-title"
        >
          <Confetti />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="glass-panel-strong relative mx-4 w-full max-w-lg overflow-hidden rounded-[32px] border border-accent-orange/20 p-8 shadow-[0_0_100px_rgba(255,101,63,0.2)]"
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,101,63,0.12),transparent_60%)]" />

            <div className="relative flex flex-col items-center text-center">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.15, type: "spring", stiffness: 200 }}
                className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-accent-orange to-accent-gold shadow-[0_0_60px_rgba(255,101,63,0.5)]"
              >
                <CheckIcon className="h-10 w-10 text-white" />
              </motion.div>

              <h2 id="success-title" className="mt-6 text-2xl font-bold text-white">
                Dispatched Live Successfully! 🎉
              </h2>

              <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">
                {message || (
                  <>
                    Your content has been published to{" "}
                    {channels.map((c, i) => (
                      <span key={c}>
                        <span
                          className={
                            c === "twitter"
                              ? "font-medium text-sky-400"
                              : "font-medium text-indigo-400"
                          }
                        >
                          {c === "twitter" ? "Twitter" : "LinkedIn"}
                        </span>
                        {i < channels.length - 1 ? " and " : ""}
                      </span>
                    ))}
                    .
                  </>
                )}
              </p>

              <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={onViewPosts}
                  className="focus-ring flex-1 rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:border-white/20 hover:bg-white/[0.08]"
                >
                  View Generated Posts
                </button>
                <button
                  type="button"
                  onClick={onCreateAnother}
                  className="btn-gradient focus-ring flex-1 rounded-2xl px-6 py-3.5 text-sm font-semibold text-white"
                >
                  Create Another Dispatch
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
