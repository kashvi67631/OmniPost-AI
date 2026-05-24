import { prisma } from "@/lib/prisma";

export type PublishMetricsInput = {
  dispatchId: string;
  platforms: string[];
  twitterTweetCount: number;
  linkedinPublished: boolean;
  sourceContent: string;
};

/**
 * Records estimated reach metrics after a successful platform publish.
 * Values are baseline estimates until platform analytics APIs are wired.
 */
export async function recordPublishAnalytics(input: PublishMetricsInput) {
  const hasUrl =
    input.sourceContent.includes("http://") ||
    input.sourceContent.includes("https://");

  let impressions = 0;
  let engagements = 0;
  let clicks = 0;

  if (input.platforms.includes("twitter") && input.twitterTweetCount > 0) {
    impressions += 800 * input.twitterTweetCount;
    engagements += 15 * input.twitterTweetCount;
    if (hasUrl) clicks += 25;
  }

  if (input.linkedinPublished) {
    impressions += 1200;
    engagements += 45;
    if (hasUrl) clicks += 30;
  }

  await prisma.dispatchAnalytics.upsert({
    where: { dispatchId: input.dispatchId },
    create: {
      dispatchId: input.dispatchId,
      impressions,
      engagements,
      clicks,
    },
    update: {
      impressions: { increment: impressions },
      engagements: { increment: engagements },
      clicks: { increment: clicks },
    },
  });

  return { impressions, engagements, clicks };
}
