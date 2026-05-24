import { prisma } from "@/lib/prisma";

function percentChange(current: number, previous: number): { change: string; up: boolean } {
  if (previous === 0 && current === 0) return { change: "0%", up: true };
  if (previous === 0) return { change: "+100%", up: true };
  const delta = ((current - previous) / previous) * 100;
  const rounded = Math.round(delta);
  return {
    change: `${rounded >= 0 ? "+" : ""}${rounded}%`,
    up: rounded >= 0,
  };
}

export async function getAnalyticsForUser(userId: string) {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const [allDispatches, thisWeekDispatches, lastWeekDispatches, analyticsRows] =
    await Promise.all([
      prisma.dispatch.findMany({
        where: { userId, status: "SUCCESS" },
        select: { selectedPlatforms: true, createdAt: true },
      }),
      prisma.dispatch.count({
        where: { userId, status: "SUCCESS", createdAt: { gte: weekAgo } },
      }),
      prisma.dispatch.count({
        where: {
          userId,
          status: "SUCCESS",
          createdAt: { gte: twoWeeksAgo, lt: weekAgo },
        },
      }),
      prisma.dispatchAnalytics.findMany({
        where: { dispatch: { userId, status: "SUCCESS" } },
        select: {
          clicks: true,
          engagements: true,
          impressions: true,
          updatedAt: true,
          dispatch: { select: { createdAt: true } },
        },
      }),
    ]);

  const totals = analyticsRows.reduce(
    (acc, row) => ({
      clicks: acc.clicks + row.clicks,
      engagements: acc.engagements + row.engagements,
      impressions: acc.impressions + row.impressions,
    }),
    { clicks: 0, engagements: 0, impressions: 0 }
  );

  const thisWeekMetrics = analyticsRows
    .filter((r) => r.dispatch.createdAt >= weekAgo)
    .reduce(
      (acc, row) => ({
        clicks: acc.clicks + row.clicks,
        engagements: acc.engagements + row.engagements,
        impressions: acc.impressions + row.impressions,
      }),
      { clicks: 0, engagements: 0, impressions: 0 }
    );

  const lastWeekMetrics = analyticsRows
    .filter(
      (r) => r.dispatch.createdAt >= twoWeeksAgo && r.dispatch.createdAt < weekAgo
    )
    .reduce(
      (acc, row) => ({
        clicks: acc.clicks + row.clicks,
        engagements: acc.engagements + row.engagements,
        impressions: acc.impressions + row.impressions,
      }),
      { clicks: 0, engagements: 0, impressions: 0 }
    );

  let twitterCount = 0;
  let linkedinCount = 0;
  for (const dispatch of allDispatches) {
    if (dispatch.selectedPlatforms.includes("twitter")) twitterCount++;
    if (dispatch.selectedPlatforms.includes("linkedin")) linkedinCount++;
  }
  const platformTotal = twitterCount + linkedinCount || 1;

  const engagementTimeline = buildEngagementTimeline(analyticsRows, 14);

  const dispatchChange = percentChange(thisWeekDispatches, lastWeekDispatches);
  const reachChange = percentChange(
    thisWeekMetrics.impressions,
    lastWeekMetrics.impressions
  );
  const engagementChange = percentChange(
    thisWeekMetrics.engagements,
    lastWeekMetrics.engagements
  );
  const clicksChange = percentChange(thisWeekMetrics.clicks, lastWeekMetrics.clicks);

  return {
    kpis: [
      {
        label: "Total Dispatches",
        value: String(allDispatches.length),
        change: dispatchChange.change,
        up: dispatchChange.up,
      },
      {
        label: "Total Reach",
        value: formatNumber(totals.impressions),
        change: reachChange.change,
        up: reachChange.up,
      },
      {
        label: "Engagements",
        value: formatNumber(totals.engagements),
        change: engagementChange.change,
        up: engagementChange.up,
      },
      {
        label: "Clicks",
        value: formatNumber(totals.clicks),
        change: clicksChange.change,
        up: clicksChange.up,
      },
    ],
    platformPerformance: [
      {
        name: "Twitter",
        value: Math.round((twitterCount / platformTotal) * 100),
      },
      {
        name: "LinkedIn",
        value: Math.round((linkedinCount / platformTotal) * 100),
      },
    ],
    engagementTimeline,
    totalDispatches: allDispatches.length,
  };
}

function formatNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(n);
}

function buildEngagementTimeline(
  rows: Array<{
    engagements: number;
    dispatch: { createdAt: Date };
  }>,
  days: number
) {
  const buckets: Record<string, number> = {};
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    buckets[d.toISOString().slice(0, 10)] = 0;
  }

  for (const row of rows) {
    const key = row.dispatch.createdAt.toISOString().slice(0, 10);
    if (key in buckets) {
      buckets[key] += row.engagements;
    }
  }

  return Object.entries(buckets).map(([date, value]) => ({ date, value }));
}
