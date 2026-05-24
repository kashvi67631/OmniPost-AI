import { z } from "zod";

export const ALLOWED_PLATFORMS = ["twitter", "linkedin"] as const;

export const publishSchema = z.object({
  email: z.string().email("Valid founder email is required."),
  content: z.string().min(1, "Content context is required."),
  contentType: z.string().default("Article"),
  channels: z
    .array(z.enum(ALLOWED_PLATFORMS))
    .min(1, "Select at least one channel."),
});

export const userUpdateSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).optional(),
  timezone: z.string().optional(),
  company: z.string().optional(),
  image: z.string().url().optional().or(z.literal("")),
});

export const userEmailSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
});

export type PublishInput = z.infer<typeof publishSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
