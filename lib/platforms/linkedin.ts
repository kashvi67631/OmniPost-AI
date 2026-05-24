import type { PlatformCredentials } from "@/lib/platforms/credentials";

const LINKEDIN_API = "https://api.linkedin.com/v2";

function resolveAuthorUrn(credentials: PlatformCredentials): string {
  const raw = credentials.externalId?.trim();
  if (!raw) {
    throw new Error(
      "LinkedIn person URN is required. Set LINKEDIN_PERSON_URN or save it in Integrations."
    );
  }
  if (raw.startsWith("urn:li:")) return raw;
  return `urn:li:person:${raw}`;
}

export type LinkedInPublishResult = {
  postId: string;
  postUrl?: string;
};

export async function publishLinkedInPost(
  text: string,
  credentials: PlatformCredentials
): Promise<LinkedInPublishResult> {
  const postText = text.trim();
  if (!postText) throw new Error("LinkedIn post text is empty.");

  const author = resolveAuthorUrn(credentials);
  const body = {
    author,
    lifecycleState: "PUBLISHED",
    specificContent: {
      "com.linkedin.ugc.ShareContent": {
        shareCommentary: { text: postText.slice(0, 3000) },
        shareMediaCategory: "NONE",
      },
    },
    visibility: {
      "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
    },
  };

  const response = await fetch(`${LINKEDIN_API}/ugcPosts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${credentials.accessToken}`,
      "Content-Type": "application/json",
      "X-Restli-Protocol-Version": "2.0.0",
    },
    body: JSON.stringify(body),
  });

  const payload = (await response.json()) as {
    id?: string;
    message?: string;
    serviceErrorCode?: number;
  };

  if (!response.ok) {
    throw new Error(
      payload.message || `LinkedIn API error (${response.status})`
    );
  }

  const postId = payload.id;
  if (!postId) throw new Error("LinkedIn API returned no post id.");

  const encodedId = encodeURIComponent(postId);
  return {
    postId,
    postUrl: `https://www.linkedin.com/feed/update/${encodedId}`,
  };
}
