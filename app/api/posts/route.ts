export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest } from "next/server";
import { handleApiError, jsonError, jsonSuccess } from "@/lib/api/response";
import { resolveRequestUser } from "@/lib/auth/session";
import { getGeneratedPosts } from "@/lib/services/dispatch.service";

export async function GET(request: NextRequest) {
  try {
    const user = await resolveRequestUser(request);
    if (!user) {
      return jsonError("Authentication required. Provide x-user-email header.", 401);
    }

    const { searchParams } = new URL(request.url);
    const dispatchId = searchParams.get("dispatchId") ?? undefined;

    const dispatches = await getGeneratedPosts(user.id, dispatchId);

    const posts = dispatches
      .filter((d) => d.generatedPost)
      .map((dispatch) => ({
        dispatchId: dispatch.id,
        twitterThread: dispatch.generatedPost!.twitterThread as string[],
        linkedinPost: dispatch.generatedPost!.linkedinPost,
        metadata: dispatch.generatedPost!.metadata as Record<string, unknown> | null,
        createdAt: dispatch.generatedPost!.createdAt.toISOString(),
      }));

    return jsonSuccess({ posts });
  } catch (error) {
    return handleApiError(error);
  }
}
