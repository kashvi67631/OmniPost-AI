import type { PlatformCredentials } from "@/lib/platforms/credentials";

const TWITTER_API = "https://api.twitter.com/2";

export type TwitterPublishResult = {
  tweetIds: string[];
  postUrl?: string;
};

export async function publishTwitterThread(
  tweets: string[],
  credentials: PlatformCredentials
): Promise<TwitterPublishResult> {
  const thread = tweets.map((t) => t.trim()).filter(Boolean);
  if (thread.length === 0) {
    throw new Error("Twitter thread is empty.");
  }

  const tweetIds: string[] = [];
  let replyToId: string | undefined;

  for (const text of thread) {
    const body: Record<string, unknown> = { text: text.slice(0, 280) };
    if (replyToId) {
      body.reply = { in_reply_to_tweet_id: replyToId };
    }

    const response = await fetch(`${TWITTER_API}/tweets`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${credentials.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const payload = (await response.json()) as {
      data?: { id: string };
      errors?: Array<{ message: string }>;
      detail?: string;
    };

    if (!response.ok) {
      const message =
        payload.errors?.[0]?.message ||
        payload.detail ||
        `Twitter API error (${response.status})`;
      throw new Error(message);
    }

    const id = payload.data?.id;
    if (!id) throw new Error("Twitter API returned no tweet id.");
    tweetIds.push(id);
    replyToId = id;
  }

  const username =
    credentials.accountName?.replace(/^@/, "") ||
    process.env.TWITTER_USERNAME?.replace(/^@/, "");
  const postUrl = username
    ? `https://x.com/${username}/status/${tweetIds[0]}`
    : `https://x.com/i/web/status/${tweetIds[0]}`;

  return { tweetIds, postUrl };
}
