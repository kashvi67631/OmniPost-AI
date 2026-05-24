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

    const dispatch = await createDispatch(resolvedUser.id, input);

    if (!dispatch.generatedPost) {
      return jsonError("Failed to generate content.", 500);
    }

    const twitterThread = dispatch.generatedPost.twitterThread as string[];

    return jsonSuccess(
      {
        dispatchId: dispatch.id,
        distributedTo: dispatch.selectedPlatforms,
        message: `Dispatched Live to ${dispatch.selectedPlatforms.join(" and ")}!`,
        generatedPost: {
          dispatchId: dispatch.id,
          twitterThread,
          linkedinPost: dispatch.generatedPost.linkedinPost,
          metadata: dispatch.generatedPost.metadata as Record<string, unknown> | null,
          createdAt: dispatch.generatedPost.createdAt.toISOString(),
        },
      },
      201
    );
  } catch (error) {
    return handleApiError(error);
  }
}
