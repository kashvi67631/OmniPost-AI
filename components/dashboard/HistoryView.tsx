"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ChevronRightIcon, LinkedInIcon, TwitterIcon } from "@/components/ui/icons";
import { fetchHistory } from "@/lib/api/client";
import type { HistoryItem } from "@/lib/types/api";
import { DataState } from "@/components/ui/DataState";

type HistoryViewProps = {
  userEmail: string;
};

export function HistoryView({ userEmail }: HistoryViewProps) {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userEmail) {
      setItems([]);
      setLoading(false);
      setError("Enter your founder email in Workspace to view history.");
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchHistory(userEmail);
        if (!cancelled) setItems(data.items);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load history.");
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-white sm:text-3xl">History</h1>
        <p className="mt-2 text-sm text-muted">
          Review your past content dispatches and generated posts.
        </p>
      </div>

      <DataState
        loading={loading}
        error={error}
        empty={!loading && !error && items.length === 0}
        emptyMessage="No dispatches yet. Publish your first dispatch from Workspace."
      >
        <HistoryList items={items} />
      </DataState>
    </motion.div>
  );
}

function HistoryList({ items }: { items: HistoryItem[] }) {
  return (
    <div className="glass-panel divide-y divide-white/[0.06] overflow-hidden rounded-[28px]">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          className="focus-ring flex w-full items-center gap-4 px-5 py-4 text-left transition-all duration-300 hover:bg-white/[0.03]"
        >
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white/[0.04]">
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5 text-muted"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <path d="M14 2v6h6" />
            </svg>
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">{item.title}</p>
            <HistoryItemMeta item={item} />
          </div>

          <ChevronRightIcon className="h-4 w-4 flex-shrink-0 text-muted" />
        </button>
      ))}
    </div>
  );
}

function HistoryItemMeta({ item }: { item: HistoryItem }) {
  return (
    <div className="mt-1 flex items-center gap-2">
      {item.channels.includes("twitter") && (
        <TwitterIcon className="h-3.5 w-3.5 text-sky-400" />
      )}
      {item.channels.includes("linkedin") && (
        <LinkedInIcon className="h-3.5 w-3.5 text-indigo-400" />
      )}
      <span className="text-xs text-muted">{item.date}</span>
      <span className="text-xs capitalize text-white/40">{item.status.toLowerCase()}</span>
    </div>
  );
}
