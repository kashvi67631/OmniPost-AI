"use client";

import { LogoIcon } from "@/components/ui/icons";
import type { ApiUsage, ApiUser } from "@/lib/types/api";

type TopBarProps = {
  user: ApiUser | null;
  usage: ApiUsage | null;
};

function getInitials(name: string | null, email: string | null) {
  if (name?.trim()) {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }
  if (email) return email.slice(0, 2).toUpperCase();
  return "OP";
}

export function TopBar({ user, usage }: TopBarProps) {
  const initials = getInitials(user?.name ?? null, user?.email ?? null);
  const used = usage?.used ?? 0;
  const limit = usage?.limit ?? 50;
  const percent = usage?.percent ?? 0;

  return (
    <header className="glass-panel mb-6 flex items-center justify-between rounded-[24px] px-5 py-3.5 shadow-[0_4px_40px_rgba(0,0,0,0.3)]">
      <div className="flex items-center gap-2.5 lg:hidden">
        <LogoIcon className="h-7 w-7" />
        <span className="text-sm font-semibold text-white">
          OmniPost <span className="gradient-text">AI</span>
        </span>
      </div>

      <div className="hidden lg:block" aria-hidden="true" />

      <div className="flex items-center gap-4">
        <div className="hidden items-center gap-2 sm:flex">
          <span className="text-xs font-medium text-muted">Usage</span>
          <p className="flex items-center gap-2">
            <span className="relative h-1.5 w-24 overflow-hidden rounded-full bg-white/[0.08]">
              <span
                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-accent-orange to-accent-gold transition-all duration-500"
                style={{ width: `${percent}%` }}
              />
            </span>
            <span className="text-xs font-semibold text-white/80">
              {used} / {limit}
            </span>
          </p>
        </div>

        <button
          type="button"
          className="focus-ring flex items-center gap-2 rounded-full transition-opacity hover:opacity-80"
          aria-label="User menu"
        >
          <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary to-secondary text-xs font-bold text-white ring-2 ring-white/10">
            {initials}
          </div>
          <svg
            viewBox="0 0 24 24"
            className="hidden h-4 w-4 text-muted sm:block"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      </div>
    </header>
  );
}
