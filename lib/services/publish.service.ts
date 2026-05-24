import type { PlatformPublishStatus } from "@prisma/client";
import { generatePlatformContent } from "@/lib/ai/generate-content";
import { getPlatformCredentials } from "@/lib/platforms/credentials";
import { publishLinkedInPost } from "@/lib/platforms/linkedin";
import { publishTwitterThread } from "@/lib/platforms/twitter";
import { prisma } from "@/lib/prisma";
import { recordPublishAnalytics } from "@/lib/services/analytics-tracking.service";
import type { PublishInput } from "@/lib/validations";

export type PlatformPublishOutcome = {
  platform: string;
  status: PlatformPublishStatus;
  externalId?: string | null;
  postUrl?: string | null;
  errorMessage?: string | null;
};

export async function publishToPlatforms(
  userId: string,
  dispatchId: string,
  platforms: string[],
  generated: {
    twitterThread: string[];
    linkedinPost: string;
  },
  sourceContent: string
): Promise<PlatformPublishOutcome[]> {
  const outcomes: PlatformPublishOutcome[] = [];

  for (const platform of platforms) {
    const existing = await prisma.platformPublish.findUnique({
      where: { dispatchId_platform: { dispatchId, platform } },
    });

    if (!existing) {
      await prisma.platformPublish.create({
        data: { dispatchId, platform, status: "PENDING" },
      });
    }
  }

  let twitterTweetCount = 0;
  let linkedinPublished = false;

  if (platforms.includes("twitter")) {
    const outcome = await publishSinglePlatform(
      userId,
      dispatchId,
      "twitter",
      async (credentials) => {
        const result = await publishTwitterThread(
          generated.twitterThread,
          credentials
        );
        return {
          externalId: result.tweetIds.join(","),
          postUrl: result.postUrl ?? null,
        };
      },
      generated.twitterThread.length === 0
        ? "No Twitter content was generated."
        : undefined
    );
    outcomes.push(outcome);
    if (outcome.status === "PUBLISHED") {
      twitterTweetCount = generated.twitterThread.length;
    }
  }

  if (platforms.includes("linkedin")) {
    const outcome = await publishSinglePlatform(
      userId,
      dispatchId,
      "linkedin",
      async (credentials) => {
        const result = await publishLinkedInPost(
          generated.linkedinPost,
          credentials
        );
        return {
          externalId: result.postId,
          postUrl: result.postUrl ?? null,
        };
      },
      !generated.linkedinPost.trim()
        ? "No LinkedIn content was generated."
        : undefined
    );
    outcomes.push(outcome);
    if (outcome.status === "PUBLISHED") linkedinPublished = true;
  }

  const anyPublished = outcomes.some((o) => o.status === "PUBLISHED");
  if (anyPublished) {
    await recordPublishAnalytics({
      dispatchId,
      platforms,
      twitterTweetCount,
      linkedinPublished,
      sourceContent,
    });
  }

  return outcomes;
}

async function publishSinglePlatform(
  userId: string,
  dispatchId: string,
  platform: "twitter" | "linkedin",
  publishFn: (
    credentials: NonNullable<Awaited<ReturnType<typeof getPlatformCredentials>>>
  ) => Promise<{ externalId: string; postUrl: string | null }>,
  skipReason?: string
): Promise<PlatformPublishOutcome> {
  if (skipReason) {
    await updatePlatformPublish(dispatchId, platform, {
      status: "SKIPPED",
      errorMessage: skipReason,
    });
    return { platform, status: "SKIPPED", errorMessage: skipReason };
  }

  const credentials = await getPlatformCredentials(userId, platform);
  if (!credentials) {
    const message = `No ${platform} credentials. Add tokens in Settings → Integrations or set env vars.`;
    await updatePlatformPublish(dispatchId, platform, {
      status: "SKIPPED",
      errorMessage: message,
    });
    return { platform, status: "SKIPPED", errorMessage: message };
  }

  try {
    const result = await publishFn(credentials);
    await updatePlatformPublish(dispatchId, platform, {
      status: "PUBLISHED",
      externalId: result.externalId,
      postUrl: result.postUrl,
      publishedAt: new Date(),
      errorMessage: null,
    });
    return {
      platform,
      status: "PUBLISHED",
      externalId: result.externalId,
      postUrl: result.postUrl,
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Platform publish failed.";
    await updatePlatformPublish(dispatchId, platform, {
      status: "FAILED",
      errorMessage: message,
    });
    return { platform, status: "FAILED", errorMessage: message };
  }
}

async function updatePlatformPublish(
  dispatchId: string,
  platform: string,
  data: {
    status: PlatformPublishStatus;
    externalId?: string;
    postUrl?: string | null;
    publishedAt?: Date;
    errorMessage?: string | null;
  }
) {
  await prisma.platformPublish.upsert({
    where: { dispatchId_platform: { dispatchId, platform } },
    create: { dispatchId, platform, ...data },
    update: data,
  });
}

export async function runPublishPipeline(userId: string, input: PublishInput) {
  const dispatch = await prisma.dispatch.create({
    data: {
      userId,
      content: input.content,
      contentType: input.contentType,
      selectedPlatforms: input.channels,
      status: "PROCESSING",
    },
  });

  try {
    const generated = await generatePlatformContent(
      input.content,
      input.contentType,
      input.channels
    );

    await prisma.$transaction([
      prisma.generatedPost.create({
        data: {
          dispatchId: dispatch.id,
          twitterThread: generated.twitterThread,
          linkedinPost: generated.linkedinPost,
          metadata: generated.metadata,
        },
      }),
      prisma.dispatchAnalytics.create({
        data: {
          dispatchId: dispatch.id,
          clicks: 0,
          engagements: 0,
          impressions: 0,
        },
      }),
    ]);

    const platformResults = await publishToPlatforms(
      userId,
      dispatch.id,
      input.channels,
      {
        twitterThread: generated.twitterThread,
        linkedinPost: generated.linkedinPost,
      },
      input.content
    );

    const anyPublished = platformResults.some((r) => r.status === "PUBLISHED");
    const allFailed =
      platformResults.length > 0 &&
      platformResults.every((r) => r.status === "FAILED");

    const finalStatus = allFailed && !anyPublished ? "FAILED" : "SUCCESS";

    await prisma.dispatch.update({
      where: { id: dispatch.id },
      data: { status: finalStatus },
    });

    const result = await prisma.dispatch.findUnique({
      where: { id: dispatch.id },
      include: {
        generatedPost: true,
        analytics: true,
        platformPublishes: true,
      },
    });

    return { dispatch: result!, platformResults, generated };
  } catch (error) {
    await prisma.dispatch.update({
      where: { id: dispatch.id },
      data: { status: "FAILED" },
    });
    throw error;
  }
}
