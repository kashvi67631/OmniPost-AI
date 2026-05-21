import { NextRequest, NextResponse } from "next/server";

// Check if database is configured
const isDatabaseConfigured = !!process.env.DATABASE_URL;

// ============================================
// Mock Data Store (Fallback when no database)
// ============================================

// In-memory storage for users and posts
const mockUsers: Array<{
  id: string;
  email: string;
  name: string | null;
  createdAt: Date;
}> = [
  // Pre-seed a demo user for testing
  {
    id: "demo-user-001",
    email: "demo@omnipost.ai",
    name: "Demo User",
    createdAt: new Date(),
  },
];

const mockPosts: Array<{
  id: string;
  rawPrompt: string;
  generatedAi: string;
  status: string;
  scheduledAt: Date;
  userId: string;
}> = [];

// Mock Prisma-like interface
const mockDb = {
  user: {
    findUnique: ({ where }: { where: { id: string } }) => {
      return Promise.resolve(mockUsers.find((u) => u.id === where.id) || null);
    },
  },
  post: {
    create: (data: {
      data: {
        userId: string;
        rawPrompt: string;
        generatedAi: string;
        status: string;
        scheduledAt: Date;
      };
      include?: { user?: { select: { id: boolean; email: boolean; name: boolean } } };
    }) => {
      const newPost = {
        id: crypto.randomUUID(),
        ...data.data,
      };
      mockPosts.push(newPost);

      if (data.include?.user) {
        const user = mockUsers.find((u) => u.id === data.data.userId);
        return Promise.resolve({
          ...newPost,
          user: user
            ? {
                id: user.id,
                email: user.email,
                name: user.name,
              }
            : null,
        });
      }

      return Promise.resolve(newPost);
    },
    findMany: ({
      where,
      orderBy,
      include,
    }: {
      where?: { userId?: string; status?: string };
      orderBy?: { scheduledAt?: "asc" | "desc" };
      include?: { user?: { select: { id: boolean; email: boolean; name: boolean } } };
    }) => {
      let results = [...mockPosts];

      // Apply filters
      if (where?.userId) {
        results = results.filter((p) => p.userId === where.userId);
      }
      if (where?.status) {
        results = results.filter((p) => p.status === where.status);
      }

      // Apply ordering
      if (orderBy?.scheduledAt === "desc") {
        results.sort((a, b) => b.scheduledAt.getTime() - a.scheduledAt.getTime());
      } else if (orderBy?.scheduledAt === "asc") {
        results.sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime());
      }

      // Include user data if requested
      if (include?.user) {
        results = results.map((post) => {
          const user = mockUsers.find((u) => u.id === post.userId);
          return {
            ...post,
            user: user
              ? {
                  id: user.id,
                  email: user.email,
                  name: user.name,
                }
              : null,
          };
        });
      }

      return Promise.resolve(results);
    },
  },
};

// ============================================
// Database Layer (Prisma - loaded dynamically)
// ============================================

// Types for Prisma client
interface PrismaClientType {
  user: {
    findUnique: (args: { where: { id: string } }) => Promise<unknown>;
  };
  post: {
    create: (args: {
      data: {
        userId: string;
        rawPrompt: string;
        generatedAi: string;
        status: string;
        scheduledAt: Date;
      };
      include?: { user?: { select: { id: boolean; email: boolean; name: boolean } } };
    }) => Promise<unknown>;
    findMany: (args: {
      where?: { userId?: string; status?: string };
      orderBy?: { scheduledAt?: "asc" | "desc" };
      include?: { user?: { select: { id: boolean; email: boolean; name: boolean } } };
    }) => Promise<unknown>;
  };
}

// Dynamically load Prisma client only when database is configured
let prisma: PrismaClientType | null = null;

if (isDatabaseConfigured) {
  try {
    // Dynamic import to avoid build errors when Prisma client isn't generated
    const { PrismaClient } = require("@prisma/client");
    prisma = new PrismaClient();
  } catch (error) {
    console.warn("⚠️ Failed to load Prisma client. Falling back to mock mode.");
    console.warn("Run `npx prisma generate` to generate the Prisma client.");
  }
}

// Get the appropriate database layer based on configuration
const db = prisma ? prisma : mockDb;

// Log the current mode on startup
console.log(
  `📮 OmniPost API: Running in ${prisma ? "DATABASE" : "MOCK"} mode`
);

/**
 * POST /api/post
 *
 * Creates a new post in the queue for a user.
 * This simulates the initial step of the post creation workflow where
 * a founder submits a URL or description that will be processed by AI.
 *
 * Request Body:
 * - userId: string - The ID/email of the user creating the post
 * - rawPrompt: string - The URL or description input by the founder
 * - channels: string[] - Array of selected platforms
 * - scheduledAt: string (ISO datetime) - When the post should be published
 *
 * Response:
 * - The created Post object with generated content
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, rawPrompt, scheduledAt, channels } = body;

    // Validate required fields
    if (!userId || !rawPrompt || !scheduledAt) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          required: ["userId", "rawPrompt", "scheduledAt"],
        },
        { status: 400 }
      );
    }

    // Generate AI content for both modes
    const generatedContent = generateMockAiContent(rawPrompt);
    const isMockMode = !prisma;

    // ============================================
    // DATABASE MODE - Use Prisma ORM
    // ============================================
    if (prisma) {
      const { PrismaClient } = require("@prisma/client");
      const prismaClient = new PrismaClient();

      try {
        // Find or create user by email
        let user = await prismaClient.user.findUnique({
          where: { email: userId },
        });

        if (!user) {
          user = await prismaClient.user.create({
            data: {
              email: userId,
              name: userId.split('@')[0], // Extract name from email
            },
          });
        }

        // Create the post with platforms
        const post = await prismaClient.post.create({
          data: {
            userId: user.id,
            prompt: rawPrompt,
            platforms: JSON.stringify(channels || ["Twitter / X"]),
          },
        });

        // Create the generated content linked to the post
        const content = await prismaClient.generatedContent.create({
          data: {
            postId: post.id,
            userId: user.id,
            twitterThread: JSON.stringify(generatedContent.twitterThread),
            linkedinPost: generatedContent.linkedinPost,
          },
        });

        return NextResponse.json({
          id: post.id,
          userId: user.id,
          prompt: post.prompt,
          platforms: post.platforms,
          createdAt: post.createdAt,
          generatedContent: {
            twitterThread: generatedContent.twitterThread,
            linkedinPost: generatedContent.linkedinPost,
          },
          mode: "database",
        }, { status: 201 });
      } finally {
        await prismaClient.$disconnect();
      }
    }

    // ============================================
    // MOCK MODE - Use in-memory storage
    // ============================================
    const postId = crypto.randomUUID();
    
    // Create user if not exists in mock
    if (!mockUsers.find(u => u.id === userId)) {
      mockUsers.push({
        id: userId,
        email: userId,
        name: userId.split('@')[0],
        createdAt: new Date(),
      });
    }

    // Store post in mock
    mockPosts.push({
      id: postId,
      rawPrompt: rawPrompt,
      generatedAi: JSON.stringify(generatedContent),
      status: "PENDING",
      scheduledAt: new Date(scheduledAt),
      userId: userId,
    });

    return NextResponse.json({
      id: postId,
      userId: userId,
      prompt: rawPrompt,
      platforms: channels || ["Twitter / X"],
      generatedContent,
      mode: "mock",
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { error: "Failed to create post" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/post
 *
 * Retrieves posts from the queue.
 * Supports optional filtering by userId and status.
 *
 * Query Parameters:
 * - userId?: string - Filter by user ID
 * - status?: string - Filter by status (PENDING, PUBLISHED, FAILED)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const status = searchParams.get("status");

    // Build where clause based on provided filters
    const where: {
      userId?: string;
      status?: string;
    } = {};

    if (userId) {
      where.userId = userId;
    }

    if (status) {
      where.status = status;
    }

    const posts = await db.post.findMany({
      where,
      orderBy: {
        scheduledAt: "desc",
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      posts,
      mode: prisma ? "database" : "mock",
    });
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}

// ============================================
// Mock AI Content Generation Engine
// ============================================

/**
 * Generates simulated AI content for multi-channel distribution
 * Used only in Mock Mode to simulate the AI generation pipeline
 */
function generateMockAiContent(rawPrompt: string) {
  // Extract key themes from the prompt for personalization
  const promptLower = rawPrompt.toLowerCase();
  const hasUrl = promptLower.includes('http') || promptLower.includes('.com');
  const isTech = promptLower.includes('tech') || promptLower.includes('software') || promptLower.includes('app') || promptLower.includes('dashboard') || promptLower.includes('ai');
  const isStartup = promptLower.includes('startup') || promptLower.includes('founder') || promptLower.includes('launch') || promptLower.includes('product');

  // Generate Twitter Thread (2 tweets)
  const tweet1 = hasUrl
    ? "🚀 Just discovered something game-changing in the " + (isTech ? 'tech' : 'startup') + " space.\n\nThis is exactly what founders need right now →"
    : "🚀 The " + (isStartup ? 'startup' : 'digital') + " landscape is evolving faster than ever.\n\nHere's what every founder needs to know →";

  const tweet2 = isTech
    ? "💡 The future of software isn't just about features — it's about seamless experiences that adapt to your workflow.\n\n" + (hasUrl ? 'Check it out:' : 'Stay ahead of the curve.') + "\n\n#TechInnovation #StartupLife"
    : "💡 Success isn't about working harder — it's about building systems that scale with your vision.\n\n" + (hasUrl ? 'Learn more:' : 'Keep pushing boundaries.') + "\n\n#Entrepreneurship #GrowthMindset";

  const twitterThread = [tweet1, tweet2];

  // Generate LinkedIn Post (long-form)
  const linkedinTitle = isStartup ? 'The Startup Playbook:' : 'Industry Insight:';
  const linkedinOpening = isTech
    ? "In today's rapidly evolving tech landscape, the tools we build aren't just products — they're extensions of how we think, work, and connect."
    : "Every successful venture starts with a single insight: the market doesn't reward effort, it rewards impact.";
  const linkedinInsight = rawPrompt.length > 30 ? 'deep research and analysis' : 'studying the patterns';
  const bullet1 = isTech ? 'User experience is the new competitive moat' : 'Clarity beats complexity every single time';
  const bullet2 = isStartup ? 'Speed of execution > perfection of planning' : 'Small, consistent improvements compound exponentially';
  const bullet3 = hasUrl ? 'The best solutions emerge from real user feedback' : 'Data-driven decisions separate winners from dreamers';
  const linkedinCta = hasUrl
    ? "I've been exploring " + rawPrompt.replace(/https?:\/\//, '').split('/')[0] + " and the potential is incredible.\n\nWhat's your take on this shift? Drop your thoughts below. 👇"
    : "The companies that win tomorrow are the ones rethinking their approach today.\n\nAgree or disagree? Let's discuss in the comments. 👇";
  const linkedinHashtags = isTech
    ? '#Technology #Innovation #ProductDevelopment'
    : '#Leadership #Strategy #BusinessGrowth';
  const extraHashtags = isStartup ? '#StartupLife #Founders' : '#ProfessionalDevelopment';

  const linkedinPost =
    '🎯 ' + linkedinTitle + '\n\n' +
    linkedinOpening + '\n\n' +
    "Here's what I've learned from " + linkedinInsight + ':\n\n' +
    '   • ' + bullet1 + '\n' +
    '   • ' + bullet2 + '\n' +
    '   • ' + bullet3 + '\n\n' +
    linkedinCta + '\n\n' +
    linkedinHashtags + ' ' + extraHashtags;

  return {
    twitterThread,
    linkedinPost,
  };
}

// Export mock data and configuration for use in other routes or testing
export { mockUsers, mockPosts, generateMockAiContent };
