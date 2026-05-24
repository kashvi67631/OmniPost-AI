import type { DispatchStatus } from "@prisma/client";
import { generatePlatformContent } from "@/lib/ai/generate-content";
import { prisma } from "@/lib/prisma";
import type { PublishInput } from "@/lib/validations";

export async function createDispatch(userId: string, input: PublishInput) {
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
    const generated = generatePlatformContent(
      input.content,
      input.contentType,
      input.channels
    );

    const [updatedDispatch] = await prisma.$transaction([
      prisma.dispatch.update({
        where: { id: dispatch.id },
        data: { status: "SUCCESS" },
      }),
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

    const result = await prisma.dispatch.findUnique({
      where: { id: updatedDispatch.id },
      include: {
        generatedPost: true,
        analytics: true,
      },
    });

    return result!;
  } catch (error) {
    await prisma.dispatch.update({
      where: { id: dispatch.id },
      data: { status: "FAILED" },
    });
    throw error;
  }
}

export async function getDispatchHistory(userId: string) {
  return prisma.dispatch.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      generatedPost: true,
      analytics: true,
    },
  });
}

export async function getDispatchById(userId: string, dispatchId: string) {
  return prisma.dispatch.findFirst({
    where: { id: dispatchId, userId },
    include: {
      generatedPost: true,
      analytics: true,
      user: {
        select: { id: true, email: true, name: true },
      },
    },
  });
}

export async function getGeneratedPosts(userId: string, dispatchId?: string) {
  if (dispatchId) {
    const dispatch = await getDispatchById(userId, dispatchId);
    return dispatch?.generatedPost ? [dispatch] : [];
  }

  return prisma.dispatch.findMany({
    where: { userId, status: "SUCCESS" },
    orderBy: { createdAt: "desc" },
    include: { generatedPost: true },
  });
}

export function formatDispatchTitle(content: string, contentType: string) {
  const trimmed = content.trim();
  if (trimmed.startsWith("http")) {
    try {
      const url = new URL(trimmed.split(/\s/)[0] ?? trimmed);
      return `${contentType} — ${url.hostname}`;
    } catch {
      // fall through
    }
  }
  return trimmed.length > 60 ? `${trimmed.slice(0, 60)}…` : trimmed;
}

export type DispatchWithRelations = Awaited<
  ReturnType<typeof getDispatchHistory>
>[number];

export type DispatchStatusType = DispatchStatus;
