"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { fetchAnalytics } from "@/lib/api/client";
import type { AnalyticsResponse } from "@/lib/types/api";
import { DataState } from "@/components/ui/DataState";

type AnalyticsViewProps = {
  userEmail: string;
};

export function AnalyticsView({ userEmail }: AnalyticsViewProps) {
  const [data, setData] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userEmail) {
      setData(null);
      setLoading(false);
      setError("Enter your founder email in Workspace to view analytics.");
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetchAnalytics(userEmail);
        if (!cancelled) setData(response);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load analytics.");
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
      <AnalyticsHeader />

      <DataState
        loading={loading}
        error={error}
        empty={!loading && !error && data?.totalDispatches === 0}
        emptyMessage="No analytics yet. Publish content to start tracking performance."
      >
        {data && <AnalyticsContent data={data} />}
      </DataState>
    </motion.div>
  );
}

function AnalyticsHeader() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-white sm:text-3xl">Analytics</h1>
      <p className="mt-2 text-sm text-muted">
        Track performance across all your content dispatches.
      </p>
    </div>
  );
}

function AnalyticsContent({ data }: { data: AnalyticsResponse }) {
  const twitterPercent = data.platformPerformance.find((p) => p.name === "Twitter")?.value ?? 0;
  const linkedinPercent = data.platformPerformance.find((p) => p.name === "LinkedIn")?.value ?? 0;

  return (
  <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {data.kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="glass-panel rounded-[24px] p-5 transition-all duration-300 hover:border-white/12 hover:shadow-[0_8px_40px_rgba(0,0,0,0.3)]"
          >
            <p className="text-xs font-medium uppercase tracking-wider text-muted">
              {kpi.label}
            </p>
            <p className="mt-2 text-2xl font-bold text-white">{kpi.value}</p>
            <p
              className={`mt-1 text-xs font-medium ${
                kpi.up ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {kpi.change} vs last week
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="glass-panel rounded-[28px] p-6">
          <h2 className="text-sm font-semibold text-white">Platform Performance</h2>
          <div className="mt-6 flex items-center gap-8">
            <DonutChart
              total={data.totalDispatches}
              twitterPercent={twitterPercent}
              linkedinPercent={linkedinPercent}
            />
            <div className="space-y-3">
              {data.platformPerformance.map((platform) => (
                <PlatformLegend key={platform.name} platform={platform} />
              ))}
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-[28px] p-6">
          <h2 className="text-sm font-semibold text-white">Engagement Over Time</h2>
          <AreaChart timeline={data.engagementTimeline} />
        </div>
      </div>
    </>
  );
}

function PlatformLegend({
  platform,
}: {
  platform: { name: string; value: number };
}) {
  const dotClass = platform.name === "Twitter" ? "bg-sky-400" : "bg-indigo-400";

  return (
    <div className="flex items-center gap-2">
      <span className={`h-2.5 w-2.5 rounded-full ${dotClass}`} />
      <span className="text-sm text-muted">{platform.name}</span>
      <span className="text-sm font-semibold text-white">{platform.value}%</span>
    </div>
  );
}

function DonutChart({
  total,
  twitterPercent,
  linkedinPercent,
}: {
  total: number;
  twitterPercent: number;
  linkedinPercent: number;
}) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const twitterArc = (twitterPercent / 100) * circumference;
  const linkedinArc = (linkedinPercent / 100) * circumference;

  return (
    <svg viewBox="0 0 100 100" className="h-32 w-32 flex-shrink-0">
      <circle
        cx="50"
        cy="50"
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth="12"
      />
      {linkedinPercent > 0 && (
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="#818cf8"
          strokeWidth="12"
          strokeDasharray={`${linkedinArc} ${circumference - linkedinArc}`}
          strokeDashoffset={circumference * 0.25}
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
        />
      )}
      {twitterPercent > 0 && (
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="#38bdf8"
          strokeWidth="12"
          strokeDasharray={`${twitterArc} ${circumference - twitterArc}`}
          strokeDashoffset={circumference * 0.25 - linkedinArc}
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
        />
      )}
      <text x="50" y="52" textAnchor="middle" className="fill-white text-[11px] font-bold">
        {total}
      </text>
    </svg>
  );
}

function AreaChart({
  timeline,
}: {
  timeline: Array<{ date: string; value: number }>;
}) {
  if (timeline.length === 0) {
    return <div className="mt-6 h-40 w-full rounded-xl bg-white/[0.02]" />;
  }

  const max = Math.max(...timeline.map((t) => t.value), 1);
  const width = 300;
  const height = 100;
  const step = width / Math.max(timeline.length - 1, 1);

  const points = timeline
    .map((point, index) => {
      const x = index * step;
      const y = height - (point.value / max) * (height - 10) - 5;
      return `${x},${y}`;
    })
    .join(" ");

  const areaPoints = `${points} ${width},${height} 0,${height}`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="mt-6 h-40 w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FF653F" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#FF653F" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill="url(#areaGrad)" />
      <polyline
        points={points}
        fill="none"
        stroke="#FF653F"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
