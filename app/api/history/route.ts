import { NextRequest } from "next/server";
import { handleApiError, jsonError, jsonSuccess } from "@/lib/api/response";
import { resolveRequestUser } from "@/lib/auth/session";
import {
  formatDispatchTitle,
  getDispatchHistory,
} from "@/lib/services/dispatch.service";

export async function GET(request: NextRequest) {
  try {
    const user = await resolveRequestUser(request);
    if (!user) {
      return jsonError("Authentication required. Provide x-user-email header.", 401);
    }

    const dispatches = await getDispatchHistory(user.id);

    const items = dispatches.map((dispatch) => ({
      id: dispatch.id,
      title: formatDispatchTitle(dispatch.content, dispatch.contentType),
      date: dispatch.createdAt.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      channels: dispatch.selectedPlatforms,
      status: dispatch.status,
      contentType: dispatch.contentType,
    }));

    return jsonSuccess({ items });
  } catch (error) {
    return handleApiError(error);
  }
}
