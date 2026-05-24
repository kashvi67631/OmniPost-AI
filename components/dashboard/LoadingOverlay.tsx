"use client";

import { motion } from "framer-motion";
import { CheckIcon } from "@/components/ui/icons";

const STEPS = [
  "Parsing source context",
  "Generating platform copies",
  "Optimizing for engagement",
  "Dispatching to channels",
];

type LoadingOverlayProps = {
  activeStep: number;
};

export function LoadingOverlay({ activeStep }: LoadingOverlayProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 flex items-center justify-center bg-background/80 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label="Publishing progress"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="glass-panel-strong relative mx-4 w-full max-w-md overflow-hidden rounded-[32px] p-8 shadow-[0_0_80px_rgba(255,101,63,0.15)]"
      >
        <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-accent-orange/10 blur-3xl" />
        <LoadingEngine />

        <h2 className="mt-6 text-center text-xl font-semibold text-white">
          Publishing your content...
        </h2>
        <p className="mt-2 text-center text-sm text-muted">
          AI engine is crafting platform-optimized posts
        </p>

        <div className="mt-8 space-y-4">
          {STEPS.map((step, index) => {
            const completed = index < activeStep;
            const current = index === activeStep;
            const pending = index > activeStep;

            return (
              <div key={step} className="flex items-center gap-3">
                <div
                  className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full transition-all duration-500 ${
                    completed
                      ? "bg-emerald-500/20 text-emerald-400 shadow-[0_0_16px_rgba(52,211,153,0.3)]"
                      : current
                        ? "animate-step-pulse border-2 border-accent-orange bg-accent-orange/10"
                        : "border border-white/10 bg-white/[0.03]"
                  }`}
                >
                  {completed ? (
                    <CheckIcon className="h-3.5 w-3.5" />
                  ) : current ? (
                    <span className="h-2 w-2 rounded-full bg-accent-orange shadow-[0_0_8px_rgba(255,101,63,0.8)]" />
                  ) : (
                    <span className="h-1.5 w-1.5 rounded-full bg-white/20" />
                  )}
                </div>
                <span
                  className={`text-sm transition-colors duration-300 ${
                    completed
                      ? "text-emerald-400/90"
                      : current
                        ? "font-medium text-white"
                        : pending
                          ? "text-white/30"
                          : "text-muted"
                  }`}
                >
                  {step}
                  {completed && (
                    <span className="ml-2 text-xs text-emerald-400/60">Completed</span>
                  )}
                  {current && (
                    <span className="ml-2 text-xs text-accent-orange">In progress</span>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
}

function LoadingEngine() {
  return (
    <div className="mx-auto flex flex-col items-center">
      <div className="relative">
        <div className="absolute inset-0 animate-glow-pulse rounded-full bg-accent-orange/20 blur-xl" />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
          className="relative flex h-20 w-20 items-center justify-center rounded-full border-2 border-accent-orange/30 bg-gradient-to-br from-primary to-secondary"
        >
          <span className="gradient-text text-3xl font-bold">O</span>
        </motion.div>
      </div>
    </div>
  );
}
