export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest } from "next/server";
import { handleApiError, jsonError, jsonSuccess } from "@/lib/api/response";
import { resolveRequestUser } from "@/lib/auth/session";
import { createDispatch } from "@/lib/services/dispatch.service";
import { findOrCreateUser } from "@/lib/services/user.service";
import { publishSchema } from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = publishSchema.parse(body);

    const user = await resolveRequestUser(request);
    const resolvedUser =
      user ?? (await findOrCreateUser(input.email.toLowerCase()));

    if (resolvedUser.email !== input.email.toLowerCase()) {
      return jsonError("Unauthorized for this email.", 403);
    }

    const { dispatch, platformResults, generated } = await createDispatch(
      resolvedUser.id,
      input
    );

    if (!dispatch.generatedPost) {
      return jsonError("Failed to generate content.", 500);
    }

    const published = platformResults.filter((r) => r.status === "PUBLISHED");
    const skipped = platformResults.filter((r) => r.status === "SKIPPED");
    const failed = platformResults.filter((r) => r.status === "FAILED");

    let message = `Content generated with ${generated.metadata.provider}.`;
    if (published.length > 0) {
      message = `Live on ${published.map((p) => p.platform).join(" and ")}!`;
    } else if (skipped.length > 0) {
      message = `Generated — connect ${skipped.map((p) => p.platform).join(" & ")} in Settings → Integrations to publish live.`;
    } else if (failed.length > 0) {
      message = `Generated, but publishing failed: ${failed[0]?.errorMessage ?? "unknown error"}`;
    }

    const twitterThread = dispatch.generatedPost.twitterThread as string[];

    return jsonSuccess(
      {
        dispatchId: dispatch.id,
        status: dispatch.status,
        distributedTo: dispatch.selectedPlatforms,
        message,
        generatedPost: {
          dispatchId: dispatch.id,
          twitterThread,
          linkedinPost: dispatch.generatedPost.linkedinPost,
          metadata: dispatch.generatedPost.metadata as Record<string, unknown> | null,
          createdAt: dispatch.generatedPost.createdAt.toISOString(),
        },
        platformResults: platformResults.map((r) => ({
          platform: r.platform,
          status: r.status,
          postUrl: r.postUrl ?? null,
          errorMessage: r.errorMessage ?? null,
        })),
        analytics: dispatch.analytics
          ? {
              impressions: dispatch.analytics.impressions,
              engagements: dispatch.analytics.engagements,
              clicks: dispatch.analytics.clicks,
            }
          : null,
      },
      201
    );
  } catch (error) {
    return handleApiError(error);
  }
}
