import { z } from "zod";

export const UserKey = z.object({
  id: z.string().uuid().describe("Local PK"),
  apiKey: z.string().min(32).describe("Gemini API key encrypted"),
  createdAt: z.date().default(() => new Date()),
});

export const Style = z.object({
  id: z.string().uuid(),
  name: z.string(),
  thumbnailUrl: z.string().url(),
});

export const Transformation = z.object({
  id: z.string().uuid(),
  styleId: z.string().uuid(),
  originalImageUrl: z.string().url(),
  styledImageUrl: z.string().url(),
  createdAt: z.date().default(() => new Date()),
});

// Type exports
export type UserKeyType = z.infer<typeof UserKey>;
export type StyleType = z.infer<typeof Style>;
export type TransformationType = z.infer<typeof Transformation>; 