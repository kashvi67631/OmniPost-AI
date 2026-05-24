export const dynamic = "force-dynamic";

import { NextRequest } from "next/server";
import { handleApiError, jsonError, jsonSuccess } from "@/lib/api/response";
import { resolveRequestUser } from "@/lib/auth/session";
import { incrementTemplateUse } from "@/lib/services/template.service";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const user = await resolveRequestUser(request);

    const template = await incrementTemplateUse(id, user?.id);
    if (!template) {
      return jsonError("Template not found.", 404);
    }

    return jsonSuccess({
      template: {
        id: template.id,
        title: template.title,
        description: template.description,
        icon: template.icon,
        content: template.content,
        useCount: template.useCount,
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
