import { getOpenAIClient, getOpenAIModel } from "@/lib/ai/openai";

export type GeneratedContent = {
  twitterThread: string[];
  linkedinPost: string;
  metadata: {
    contentType: string;
    platforms: string[];
    sourceLength: number;
    generatedAt: string;
    provider: "openai" | "fallback";
    model?: string;
  };
};

type AiResponseShape = {
  twitterThread?: string[];
  linkedinPost?: string;
};

/**
 * Generates platform-specific copy via OpenAI when configured,
 * otherwise falls back to the local rule-based generator.
 */
export async function generatePlatformContent(
  content: string,
  contentType: string,
  platforms: string[]
): Promise<GeneratedContent> {
  const openai = getOpenAIClient();
  if (openai) {
    try {
      return await generateWithOpenAI(openai, content, contentType, platforms);
    } catch (error) {
      console.error("[generate-content] OpenAI failed, using fallback:", error);
    }
  }

  return generateFallbackContent(content, contentType, platforms);
}

async function generateWithOpenAI(
  openai: NonNullable<ReturnType<typeof getOpenAIClient>>,
  content: string,
  contentType: string,
  platforms: string[]
): Promise<GeneratedContent> {
  const model = getOpenAIModel();
  const wantsTwitter = platforms.includes("twitter");
  const wantsLinkedIn = platforms.includes("linkedin");

  const completion = await openai.chat.completions.create({
    model,
    response_format: { type: "json_object" },
    temperature: 0.7,
    messages: [
      {
        role: "system",
        content: `You are an expert social media strategist. Adapt source material into high-performing posts.
Rules:
- Twitter: 1-4 tweets, each under 280 characters, engaging hooks, optional relevant hashtags.
- LinkedIn: professional tone, 800-1500 characters, line breaks for readability, 3-5 hashtags at the end.
- Return valid JSON only: { "twitterThread": string[], "linkedinPost": string }
- If a platform is not requested, use an empty array or empty string for that field.`,
      },
      {
        role: "user",
        content: `Content type: ${contentType}
Platforms to generate: ${platforms.join(", ")}
Include Twitter: ${wantsTwitter}
Include LinkedIn: ${wantsLinkedIn}

Source material:
${content}`,
      },
    ],
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) throw new Error("OpenAI returned empty content.");

  const parsed = JSON.parse(raw) as AiResponseShape;
  const twitterThread = wantsTwitter
    ? normalizeThread(parsed.twitterThread)
    : [];
  const linkedinPost = wantsLinkedIn
    ? (parsed.linkedinPost?.trim() ?? "")
    : "";

  if (wantsTwitter && twitterThread.length === 0 && wantsLinkedIn && !linkedinPost) {
    throw new Error("OpenAI response missing platform content.");
  }

  return {
    twitterThread,
    linkedinPost,
    metadata: {
      contentType,
      platforms,
      sourceLength: content.length,
      generatedAt: new Date().toISOString(),
      provider: "openai",
      model,
    },
  };
}

function normalizeThread(thread: unknown): string[] {
  if (!Array.isArray(thread)) return [];
  return thread
    .filter((t): t is string => typeof t === "string")
    .map((t) => t.trim())
    .filter(Boolean)
    .map((t) => t.slice(0, 280));
}

function generateFallbackContent(
  content: string,
  contentType: string,
  platforms: string[]
): GeneratedContent {
  const promptLower = content.toLowerCase();
  const hasUrl = promptLower.includes("http") || promptLower.includes(".com");
  const isTech =
    promptLower.includes("tech") ||
    promptLower.includes("software") ||
    promptLower.includes("app") ||
    promptLower.includes("dashboard") ||
    promptLower.includes("ai");
  const isStartup =
    promptLower.includes("startup") ||
    promptLower.includes("founder") ||
    promptLower.includes("launch") ||
    promptLower.includes("product");

  const tweet1 = hasUrl
    ? `🚀 Just discovered something game-changing in the ${isTech ? "tech" : "startup"} space.\n\nThis is exactly what founders need right now →`
    : `🚀 The ${isStartup ? "startup" : "digital"} landscape is evolving faster than ever.\n\nHere's what every founder needs to know →`;

  const tweet2 = isTech
    ? `💡 The future of software isn't just about features — it's about seamless experiences that adapt to your workflow.\n\n${hasUrl ? "Check it out:" : "Stay ahead of the curve."}\n\n#TechInnovation #StartupLife`
    : `💡 Success isn't about working harder — it's about building systems that scale with your vision.\n\n${hasUrl ? "Learn more:" : "Keep pushing boundaries."}\n\n#Entrepreneurship #GrowthMindset`;

  const twitterThread = platforms.includes("twitter") ? [tweet1, tweet2] : [];

  const linkedinTitle = isStartup ? "The Startup Playbook:" : "Industry Insight:";
  const linkedinOpening = isTech
    ? "In today's rapidly evolving tech landscape, the tools we build aren't just products — they're extensions of how we think, work, and connect."
    : "Every successful venture starts with a single insight: the market doesn't reward effort, it rewards impact.";

  const linkedinPost = platforms.includes("linkedin")
    ? `🎯 ${linkedinTitle}\n\n${linkedinOpening}\n\nContent type: ${contentType}\n\nSource:\n${content.slice(0, 280)}${content.length > 280 ? "…" : ""}\n\n#Leadership #Strategy #BusinessGrowth`
    : "";

  return {
    twitterThread,
    linkedinPost,
    metadata: {
      contentType,
      platforms,
      sourceLength: content.length,
      generatedAt: new Date().toISOString(),
      provider: "fallback",
    },
  };
}
