"use client";

function headers(email: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    "x-user-email": email,
  };
}

async function parseJson<T>(response: Response): Promise<T> {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message ?? data.error ?? "Request failed.");
  }
  return data as T;
}

export async function fetchUser(email: string) {
  const response = await fetch(`/api/user?email=${encodeURIComponent(email)}`, {
    headers: headers(email),
  });
  return parseJson<import("@/lib/types/api").ApiUserResponse>(response);
}

export async function updateUserProfile(
  email: string,
  data: { name?: string; timezone?: string; company?: string }
) {
  const response = await fetch("/api/user", {
    method: "PATCH",
    headers: headers(email),
    body: JSON.stringify({ email, ...data }),
  });
  return parseJson<{ user: import("@/lib/types/api").ApiUser }>(response);
}

export async function publishDispatch(
  email: string,
  payload: {
    content: string;
    contentType: string;
    channels: string[];
  }
) {
  const response = await fetch("/api/publish", {
    method: "POST",
    headers: headers(email),
    body: JSON.stringify({ email, ...payload }),
  });
  return parseJson<import("@/lib/types/api").PublishResponse & { status: string }>(
    response
  );
}

export async function fetchHistory(email: string) {
  const response = await fetch("/api/history", { headers: headers(email) });
  return parseJson<{ items: import("@/lib/types/api").HistoryItem[] }>(response);
}

export async function fetchAnalytics(email: string) {
  const response = await fetch("/api/analytics", { headers: headers(email) });
  return parseJson<
    import("@/lib/types/api").AnalyticsResponse & { status: string }
  >(response);
}

export async function fetchTemplates(email: string) {
  const response = await fetch("/api/templates", {
    headers: headers(email || "guest@omnipost.ai"),
  });
  return parseJson<{ templates: import("@/lib/types/api").TemplateItem[] }>(
    response
  );
}

export async function useTemplate(email: string, templateId: string) {
  const response = await fetch(`/api/templates/${templateId}/use`, {
    method: "POST",
    headers: headers(email),
  });
  return parseJson<{ template: import("@/lib/types/api").TemplateItem }>(
    response
  );
}

export async function fetchPosts(email: string, dispatchId?: string) {
  const query = dispatchId ? `?dispatchId=${dispatchId}` : "";
  const response = await fetch(`/api/posts${query}`, { headers: headers(email) });
  return parseJson<{ posts: import("@/lib/types/api").GeneratedPostResponse[] }>(
    response
  );
}
