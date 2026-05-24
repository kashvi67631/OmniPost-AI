import { maskToken } from "@/lib/platforms/credentials";
import { prisma } from "@/lib/prisma";

const PLATFORMS = ["twitter", "linkedin"] as const;

export type IntegrationStatus = {
  platform: string;
  connected: boolean;
  accountName: string | null;
  tokenPreview: string | null;
  externalId: string | null;
  updatedAt: string | null;
};

export async function getIntegrationsForUser(
  userId: string
): Promise<IntegrationStatus[]> {
  const connections = await prisma.platformConnection.findMany({
    where: { userId, platform: { in: [...PLATFORMS] } },
  });

  const byPlatform = new Map(connections.map((c) => [c.platform, c]));

  return PLATFORMS.map((platform) => {
    const row = byPlatform.get(platform);
    const envConnected =
      platform === "twitter"
        ? Boolean(process.env.TWITTER_ACCESS_TOKEN?.trim())
        : Boolean(process.env.LINKEDIN_ACCESS_TOKEN?.trim());

    if (row) {
      return {
        platform,
        connected: true,
        accountName: row.accountName,
        tokenPreview: maskToken(row.accessToken),
        externalId: row.externalId,
        updatedAt: row.updatedAt.toISOString(),
      };
    }

    if (envConnected) {
      return {
        platform,
        connected: true,
        accountName:
          platform === "twitter"
            ? process.env.TWITTER_USERNAME ?? "Env configured"
            : process.env.LINKEDIN_ACCOUNT_NAME ?? "Env configured",
        tokenPreview: "env",
        externalId:
          platform === "linkedin"
            ? process.env.LINKEDIN_PERSON_URN ??
              process.env.LINKEDIN_PERSON_ID ??
              null
            : process.env.TWITTER_USER_ID ?? null,
        updatedAt: null,
      };
    }

    return {
      platform,
      connected: false,
      accountName: null,
      tokenPreview: null,
      externalId: null,
      updatedAt: null,
    };
  });
}

export async function upsertIntegration(
  userId: string,
  platform: "twitter" | "linkedin",
  data: {
    accessToken: string;
    externalId?: string;
    accountName?: string;
  }
) {
  return prisma.platformConnection.upsert({
    where: { userId_platform: { userId, platform } },
    create: {
      userId,
      platform,
      accessToken: data.accessToken,
      externalId: data.externalId,
      accountName: data.accountName,
    },
    update: {
      accessToken: data.accessToken,
      externalId: data.externalId,
      accountName: data.accountName,
    },
  });
}

export async function removeIntegration(
  userId: string,
  platform: "twitter" | "linkedin"
) {
  await prisma.platformConnection.deleteMany({
    where: { userId, platform },
  });
}
