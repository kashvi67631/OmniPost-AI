"use client";

import {
  AnalyticsIcon,
  HelpIcon,
  HistoryIcon,
  LogoIcon,
  SettingsIcon,
  TemplatesIcon,
  WorkspaceIcon,
} from "@/components/ui/icons";

export type NavItem = "workspace" | "history" | "templates" | "analytics" | "settings";

const NAV_ITEMS: {
  key: NavItem;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { key: "workspace", label: "Workspace", icon: WorkspaceIcon },
  { key: "history", label: "History", icon: HistoryIcon },
  { key: "templates", label: "Templates", icon: TemplatesIcon },
  { key: "analytics", label: "Analytics", icon: AnalyticsIcon },
  { key: "settings", label: "Settings", icon: SettingsIcon },
];

type SidebarProps = {
  active: NavItem;
  onNavigate: (item: NavItem) => void;
};

function NavButton({
  item,
  isActive,
  onNavigate,
}: {
  item: (typeof NAV_ITEMS)[number];
  isActive: boolean;
  onNavigate: (key: NavItem) => void;
}) {
  const Icon = item.icon;
  return (
    <button
      type="button"
      onClick={() => onNavigate(item.key)}
      className={`focus-ring group relative flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-all duration-300 ${
        isActive
          ? "bg-white/[0.06] text-white"
          : "text-muted hover:bg-white/[0.04] hover:text-white/80"
      }`}
    >
      {isActive && (
        <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-gradient-to-b from-accent-orange to-accent-gold shadow-[0_0_12px_rgba(255,101,63,0.6)]" />
      )}
      <Icon
        className={`h-[18px] w-[18px] flex-shrink-0 transition-colors ${
          isActive ? "text-accent-orange" : "text-muted group-hover:text-white/70"
        }`}
      />
      {item.label}
    </button>
  );
}

export function Sidebar({ active, onNavigate }: SidebarProps) {
  return (
    <aside className="hidden lg:flex lg:w-[220px] lg:flex-shrink-0 lg:flex-col">
      <div className="glass-panel sticky top-6 flex h-[calc(100vh-3rem)] flex-col rounded-[28px] p-4 shadow-[0_8px_60px_rgba(0,0,0,0.4)]">
        <div className="flex items-center gap-1.5 px-2 pt-1">
          <LogoIcon className="h-8 w-8" />
          <span className="text-sm font-semibold tracking-tight text-white">
            OmniPost <span className="gradient-text">AI</span>
          </span>
        </div>

        <nav className="mt-8 flex flex-1 flex-col gap-1" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => (
            <NavButton
              key={item.key}
            item={item}
              isActive={active === item.key}
              onNavigate={onNavigate}
            />
          ))}
        </nav>

        <button
          type="button"
          className="focus-ring mt-auto flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-muted transition-all duration-300 hover:bg-white/[0.04] hover:text-white/80"
        >
          <HelpIcon className="h-[18px] w-[18px]" />
          Help
        </button>
      </div>
    </aside>
  );
}

export function MobileNav({ active, onNavigate }: SidebarProps) {
  return (
    <nav
      className="glass-panel flex gap-1 overflow-x-auto rounded-2xl p-1.5 lg:hidden"
      aria-label="Mobile navigation"
    >
      {NAV_ITEMS.map((item) => {
        const isActive = active === item.key;
        const Icon = item.icon;
        return (
          <button
            key={item.key}
            type="button"
            onClick={() => onNavigate(item.key)}
            className={`focus-ring flex flex-shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium transition-all ${
              isActive ? "bg-white/[0.08] text-white" : "text-muted hover:text-white/70"
            }`}
          >
            <Icon className={`h-4 w-4 ${isActive ? "text-accent-orange" : ""}`} />
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}
