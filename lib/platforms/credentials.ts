import { prisma } from "@/lib/prisma";

export type PlatformCredentials = {
  accessToken: string;
  externalId?: string | null;
  accountName?: string | null;
};

export async function getPlatformCredentials(
  userId: string,
  platform: "twitter" | "linkedin"
): Promise<PlatformCredentials | null> {
  const connection = await prisma.platformConnection.findUnique({
    where: { userId_platform: { userId, platform } },
  });

  if (connection?.accessToken) {
    return {
      accessToken: connection.accessToken,
      externalId: connection.externalId,
      accountName: connection.accountName,
    };
  }

  if (platform === "twitter") {
    const token = process.env.TWITTER_ACCESS_TOKEN?.trim();
    if (token) {
      return {
        accessToken: token,
        externalId: process.env.TWITTER_USER_ID?.trim() || null,
        accountName: process.env.TWITTER_USERNAME?.trim() || null,
      };
    }
  }

  if (platform === "linkedin") {
    const token = process.env.LINKEDIN_ACCESS_TOKEN?.trim();
    if (token) {
      return {
        accessToken: token,
        externalId:
          process.env.LINKEDIN_PERSON_URN?.trim() ||
          process.env.LINKEDIN_PERSON_ID?.trim() ||
          null,
        accountName: process.env.LINKEDIN_ACCOUNT_NAME?.trim() || null,
      };
    }
  }

  return null;
}

export function maskToken(token: string): string {
  if (token.length <= 8) return "••••••••";
  return `${token.slice(0, 4)}••••${token.slice(-4)}`;
}
