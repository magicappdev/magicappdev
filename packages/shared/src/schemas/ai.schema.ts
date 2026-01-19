/**
 * AI-related validation schemas
 */

import { z } from "zod";

/** AI provider schema */
export const aiProviderSchema = z.enum([
  "workers-ai",
  "openai",
  "anthropic",
  "gemini",
  "openrouter",
]);

/** AI message role schema */
export const aiMessageRoleSchema = z.enum(["system", "user", "assistant"]);

/** AI message schema */
export const aiMessageSchema = z.object({
  role: aiMessageRoleSchema,
  content: z.string().min(1, "Message content is required"),
});

/** AI chat request schema */
export const aiChatRequestSchema = z.object({
  projectId: z.string().uuid().optional(),
  messages: z.array(aiMessageSchema).min(1, "At least one message is required"),
  provider: aiProviderSchema.optional(),
  model: z.string().optional(),
  stream: z.boolean().optional().default(false),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().int().positive().max(100000).optional(),
});

/** AI model configuration schema */
export const aiModelConfigSchema = z.object({
  provider: aiProviderSchema,
  model: z.string(),
  temperature: z.number().min(0).max(2).default(0.7),
  maxTokens: z.number().int().positive().default(4096),
  topP: z.number().min(0).max(1).optional(),
  frequencyPenalty: z.number().min(-2).max(2).optional(),
  presencePenalty: z.number().min(-2).max(2).optional(),
});

/** Inferred types from schemas */
export type AiProviderSchemaType = z.infer<typeof aiProviderSchema>;
export type AiMessageRoleSchemaType = z.infer<typeof aiMessageRoleSchema>;
export type AiMessageSchemaType = z.infer<typeof aiMessageSchema>;
export type AiChatRequestSchemaType = z.infer<typeof aiChatRequestSchema>;
export type AiModelConfigSchemaType = z.infer<typeof aiModelConfigSchema>;
