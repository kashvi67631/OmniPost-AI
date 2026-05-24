import { prisma } from "@/lib/prisma";

export async function getTemplatesForUser(userId?: string) {
  return prisma.template.findMany({
    where: {
      OR: [{ isSystem: true }, ...(userId ? [{ userId }] : [])],
    },
    orderBy: [{ isSystem: "desc" }, { useCount: "desc" }],
  });
}

export async function incrementTemplateUse(templateId: string, userId?: string) {
  const template = await prisma.template.findFirst({
    where: {
      id: templateId,
      OR: [{ isSystem: true }, ...(userId ? [{ userId }] : [])],
    },
  });

  if (!template) return null;

  return prisma.template.update({
    where: { id: templateId },
    data: { useCount: { increment: 1 } },
  });
}
