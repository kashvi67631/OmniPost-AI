import type { User } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function findOrCreateUser(email: string, name?: string): Promise<User> {
  return prisma.user.upsert({
    where: { email },
    create: {
      email,
      name: name ?? email.split("@")[0],
    },
    update: name ? { name } : {},
  });
}

export async function getUserByEmail(email: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { email } });
}

export async function getUserById(id: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { id } });
}

export async function updateUserProfile(
  email: string,
  data: { name?: string; timezone?: string; company?: string; image?: string }
): Promise<User> {
  return prisma.user.update({
    where: { email },
    data,
  });
}

export async function getUserUsage(userId: string) {
  const dispatchCount = await prisma.dispatch.count({
    where: { userId, status: "SUCCESS" },
  });

  const limit = 50;

  return {
    used: dispatchCount,
    limit,
    percent: Math.min(100, Math.round((dispatchCount / limit) * 100)),
  };
}
