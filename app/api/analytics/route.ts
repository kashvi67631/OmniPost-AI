export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest } from "next/server";
import { handleApiError, jsonError, jsonSuccess } from "@/lib/api/response";
import { resolveRequestUser } from "@/lib/auth/session";
import { getAnalyticsForUser } from "@/lib/services/analytics.service";

export async function GET(request: NextRequest) {
  try {
    const user = await resolveRequestUser(request);
    if (!user) {
      return jsonError("Authentication required. Provide x-user-email header.", 401);
    }

    const analytics = await getAnalyticsForUser(user.id);

    return jsonSuccess(analytics);
  } catch (error) {
    return handleApiError(error);
  }
}
