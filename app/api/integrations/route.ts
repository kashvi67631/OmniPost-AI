export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { handleApiError, jsonError, jsonSuccess } from "@/lib/api/response";
import { resolveRequestUser } from "@/lib/auth/session";
import {
  getIntegrationsForUser,
  removeIntegration,
  upsertIntegration,
} from "@/lib/services/integration.service";
import { findOrCreateUser } from "@/lib/services/user.service";
import { integrationUpdateSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  try {
    const user = await resolveRequestUser(request);
    if (!user) {
      return jsonError("Authentication required. Provide x-user-email header.", 401);
    }

    const integrations = await getIntegrationsForUser(user.id);
    return jsonSuccess({ integrations });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const input = integrationUpdateSchema.parse(body);

    const user = await resolveRequestUser(request);
    const resolvedUser =
      user ?? (await findOrCreateUser(input.email.toLowerCase()));

    if (resolvedUser.email !== input.email.toLowerCase()) {
      return jsonError("Unauthorized for this email.", 403);
    }

    if (input.twitterAccessToken) {
      await upsertIntegration(resolvedUser.id, "twitter", {
        accessToken: input.twitterAccessToken,
        accountName: input.twitterUsername,
        externalId: input.twitterUserId,
      });
    }

    if (input.linkedinAccessToken) {
      await upsertIntegration(resolvedUser.id, "linkedin", {
        accessToken: input.linkedinAccessToken,
        externalId: input.linkedinPersonUrn,
        accountName: input.linkedinAccountName,
      });
    }

    const integrations = await getIntegrationsForUser(resolvedUser.id);
    return jsonSuccess({ integrations });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get("platform");
    if (platform !== "twitter" && platform !== "linkedin") {
      return jsonError("platform must be twitter or linkedin.", 400);
    }

    const user = await resolveRequestUser(request);
    if (!user) {
      return jsonError("Authentication required.", 401);
    }

    await removeIntegration(user.id, platform);
    const integrations = await getIntegrationsForUser(user.id);
    return jsonSuccess({ integrations });
  } catch (error) {
    return handleApiError(error);
  }
}
