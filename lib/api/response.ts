import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ status: "ERROR", message }, { status });
}

export function jsonSuccess<T extends Record<string, unknown>>(data: T, status = 200) {
  return NextResponse.json({ status: "SUCCESS", ...data }, { status });
}

export function handleApiError(error: unknown) {
  if (error instanceof ZodError) {
    return jsonError(error.issues[0]?.message ?? "Validation failed.", 400);
  }

  console.error("[API Error]", error);
  return jsonError("Internal server error.", 500);
}

export function getEmailFromRequest(request: Request): string | null {
  const headerEmail = request.headers.get("x-user-email");
  if (headerEmail) return headerEmail.trim().toLowerCase();

  const url = new URL(request.url);
  const queryEmail = url.searchParams.get("email");
  if (queryEmail) return queryEmail.trim().toLowerCase();

  return null;
}
