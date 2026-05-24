export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { handleApiError, jsonError, jsonSuccess } from "@/lib/api/response";
import { resolveRequestUser } from "@/lib/auth/session";
import {
  getUserByEmail,
  getUserUsage,
  updateUserProfile,
} from "@/lib/services/user.service";
import { userUpdateSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  try {
    const user = await resolveRequestUser(request);
    if (!user) {
      return jsonError("Authentication required. Provide x-user-email header.", 401);
    }

    const profile = await getUserByEmail(user.email);
    if (!profile) {
      return jsonError("User not found.", 404);
    }

    const usage = await getUserUsage(profile.id);

    return jsonSuccess({
      user: {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        image: profile.image,
        timezone: profile.timezone,
        company: profile.company,
        createdAt: profile.createdAt.toISOString(),
      },
      usage,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const input = userUpdateSchema.parse(body);

    const user = await resolveRequestUser(request);
    if (!user || user.email !== input.email.toLowerCase()) {
      return jsonError("Unauthorized.", 403);
    }

    const updated = await updateUserProfile(input.email.toLowerCase(), {
      name: input.name,
      timezone: input.timezone,
      company: input.company,
      image: input.image || undefined,
    });

    return jsonSuccess({
      user: {
        id: updated.id,
        email: updated.email,
        name: updated.name,
        image: updated.image,
        timezone: updated.timezone,
        company: updated.company,
        createdAt: updated.createdAt.toISOString(),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
