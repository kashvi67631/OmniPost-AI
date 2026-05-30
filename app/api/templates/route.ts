export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextRequest } from "next/server";
import { handleApiError, jsonError, jsonSuccess } from "@/lib/api/response";
import { resolveRequestUser } from "@/lib/auth/session";
import { getTemplatesForUser } from "@/lib/services/template.service";

export async function GET(request: NextRequest) {
  try {
    const user = await resolveRequestUser(request);
    const templates = await getTemplatesForUser(user?.id);

    return jsonSuccess({
      templates: templates.map((t) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        icon: t.icon,
        content: t.content,
        useCount: t.useCount,
      })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
