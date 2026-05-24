export type GeneratedContent = {
  twitterThread: string[];
  linkedinPost: string;
  metadata: {
    contentType: string;
    platforms: string[];
    sourceLength: number;
    generatedAt: string;
  };
};

/**
 * Rule-based content generator. Swap this module for an LLM API in production.
 */
export function generatePlatformContent(
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
    },
  };
}
