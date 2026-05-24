import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { findOrCreateUser } from "@/lib/services/user.service";

export async function resolveRequestUser(request: NextRequest) {
  const session = await auth();

  if (session?.user?.email && session.user.id) {
    return {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name ?? null,
      image: session.user.image ?? null,
    };
  }

  const headerEmail = request.headers.get("x-user-email");
  if (headerEmail) {
    return findOrCreateUser(headerEmail.toLowerCase());
  }

  return null;
}
