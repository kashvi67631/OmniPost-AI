"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { fetchTemplates, useTemplate } from "@/lib/api/client";
import type { TemplateItem } from "@/lib/types/api";
import { DataState } from "@/components/ui/DataState";

type TemplatesViewProps = {
  userEmail: string;
  onSelectTemplate?: (content: string, contentType: string) => void;
};

export function TemplatesView({ userEmail, onSelectTemplate }: TemplatesViewProps) {
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchTemplates(userEmail || "guest@omnipost.ai");
        if (!cancelled) setTemplates(data.templates);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load templates.");
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

  async function handleUseTemplate(template: TemplateItem) {
    if (userEmail) {
      try {
        const data = await useTemplate(userEmail, template.id);
        setTemplates((current) =>
          current.map((item) =>
            item.id === template.id ? { ...item, useCount: data.template.useCount } : item
          )
        );
      } catch {
        // non-blocking
      }
    }

    onSelectTemplate?.(template.content ?? template.description, template.title);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-bold text-white sm:text-3xl">Templates</h1>
        <p className="mt-2 text-sm text-muted">
          Pre-built content frameworks to accelerate your publishing workflow.
        </p>
      </div>

      <DataState
        loading={loading}
        error={error}
        empty={!loading && !error && templates.length === 0}
        emptyMessage="No templates available. Run database seed to populate system templates."
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {templates.map((template) => (
            <button
              key={template.id}
              type="button"
              onClick={() => handleUseTemplate(template)}
              className="focus-ring glass-panel group rounded-[24px] p-5 text-left transition-all duration-300 hover:scale-[1.02] hover:border-accent-orange/20 hover:shadow-[0_8px_40px_rgba(255,101,63,0.08)]"
            >
              <span className="text-2xl">{template.icon}</span>
              <h3 className="mt-4 text-sm font-semibold text-white">{template.title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-muted">
                {template.description}
              </p>
              <p className="mt-4 text-xs font-medium text-accent-orange/80">
                Used {template.useCount} times
              </p>
            </button>
          ))}
        </div>
      </DataState>
    </motion.div>
  );
}
