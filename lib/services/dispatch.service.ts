import type { DispatchStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { runPublishPipeline } from "@/lib/services/publish.service";
import type { PublishInput } from "@/lib/validations";

export async function createDispatch(userId: string, input: PublishInput) {
  return runPublishPipeline(userId, input);
}

export async function getDispatchHistory(userId: string) {
  return prisma.dispatch.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      generatedPost: true,
      analytics: true,
      platformPublishes: true,
    },
  });
}

export async function getDispatchById(userId: string, dispatchId: string) {
  return prisma.dispatch.findFirst({
    where: { id: dispatchId, userId },
    include: {
      generatedPost: true,
      analytics: true,
      platformPublishes: true,
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
    include: { generatedPost: true, platformPublishes: true },
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
