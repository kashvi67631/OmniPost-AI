import { NextResponse } from "next/server";

// Check if database is configured
const isDatabaseConfigured = !!process.env.DATABASE_URL;

// Demo user for testing in mock mode
const demoUser = {
  id: "demo-user-001",
  email: "demo@omnipost.ai",
  name: "Demo User",
  createdAt: new Date().toISOString(),
};

/**
 * GET /api/post/demo
 *
 * Returns information about the current mode and available demo users.
 * Useful for development and testing.
 */
export async function GET() {
  return NextResponse.json({
    mode: isDatabaseConfigured ? "database" : "mock",
    databaseUrlConfigured: isDatabaseConfigured,
    demoUser,
    usage: isDatabaseConfigured
      ? {
          message: "Database mode active - using PostgreSQL via Prisma",
          nextSteps: [
            "Run `npx prisma generate` to generate Prisma client",
            "Run `npx prisma db push` to sync schema with database",
            "Create a user in the database to test the API",
          ],
        }
      : {
          message:
            "Mock mode active - using in-memory storage for development",
          nextSteps: [
            "Use demo-user-001 as userId when creating posts",
            "Set DATABASE_URL environment variable to use real database",
            "Run `npx prisma generate` when database is configured",
          ],
          exampleRequest: {
            method: "POST",
            url: "/api/post",
            body: {
              userId: demoUser.id,
              rawPrompt: "Check out our new product launch at https://example.com",
              scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
            },
          },
        },
  });
}