import { prisma } from "../lib/prisma";

const SYSTEM_TEMPLATES = [
  {
    title: "Product Launch",
    description: "Announce new features with hype-building copy",
    icon: "🚀",
    content:
      "We're launching something big. Share the problem, the solution, and the one-line value prop. Include a clear CTA.",
  },
  {
    title: "Weekly Update",
    description: "Share progress and milestones with your audience",
    icon: "📊",
    content:
      "Weekly founder update: wins, learnings, and what's next. Keep it authentic and concise.",
  },
  {
    title: "Thought Leadership",
    description: "Long-form insights optimized for LinkedIn",
    icon: "💡",
    content:
      "Share a contrarian insight from your industry. Open with a bold statement, support with experience, end with a question.",
  },
  {
    title: "Thread Breakdown",
    description: "Turn articles into engaging Twitter threads",
    icon: "🧵",
    content:
      "Break down a complex topic into 5-8 tweet-sized insights. Hook in tweet 1, payoff in the final tweet.",
  },
  {
    title: "Event Promotion",
    description: "Drive registrations with urgency-driven copy",
    icon: "🎯",
    content:
      "Promote an upcoming event: who it's for, what they'll learn, date/time, and registration link.",
  },
  {
    title: "Customer Story",
    description: "Highlight wins and social proof",
    icon: "⭐",
    content:
      "Customer success story: challenge, how your product helped, measurable outcome, quote if available.",
  },
];

async function main() {
  for (const template of SYSTEM_TEMPLATES) {
    const existing = await prisma.template.findFirst({
      where: { title: template.title, isSystem: true },
    });

    if (existing) {
      await prisma.template.update({
        where: { id: existing.id },
        data: {
          description: template.description,
          icon: template.icon,
          content: template.content,
        },
      });
    } else {
      await prisma.template.create({
        data: { ...template, isSystem: true },
      });
    }
  }

  console.log(`Seeded ${SYSTEM_TEMPLATES.length} system templates.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
