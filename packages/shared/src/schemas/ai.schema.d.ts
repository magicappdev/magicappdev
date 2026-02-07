/**
 * AI-related validation schemas
 */
import { z } from "zod";
/** AI provider schema */
export declare const aiProviderSchema: z.ZodEnum<{
  "workers-ai": "workers-ai";
  openai: "openai";
  anthropic: "anthropic";
  gemini: "gemini";
  openrouter: "openrouter";
}>;
/** AI message role schema */
export declare const aiMessageRoleSchema: z.ZodEnum<{
  user: "user";
  system: "system";
  assistant: "assistant";
}>;
/** AI message schema */
export declare const aiMessageSchema: z.ZodObject<
  {
    role: z.ZodEnum<{
      user: "user";
      system: "system";
      assistant: "assistant";
    }>;
    content: z.ZodString;
  },
  z.core.$strip
>;
/** AI chat request schema */
export declare const aiChatRequestSchema: z.ZodObject<
  {
    projectId: z.ZodOptional<z.ZodString>;
    messages: z.ZodArray<
      z.ZodObject<
        {
          role: z.ZodEnum<{
            user: "user";
            system: "system";
            assistant: "assistant";
          }>;
          content: z.ZodString;
        },
        z.core.$strip
      >
    >;
    provider: z.ZodOptional<
      z.ZodEnum<{
        "workers-ai": "workers-ai";
        openai: "openai";
        anthropic: "anthropic";
        gemini: "gemini";
        openrouter: "openrouter";
      }>
    >;
    model: z.ZodOptional<z.ZodString>;
    stream: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    temperature: z.ZodOptional<z.ZodNumber>;
    maxTokens: z.ZodOptional<z.ZodNumber>;
  },
  z.core.$strip
>;
/** AI model configuration schema */
export declare const aiModelConfigSchema: z.ZodObject<
  {
    provider: z.ZodEnum<{
      "workers-ai": "workers-ai";
      openai: "openai";
      anthropic: "anthropic";
      gemini: "gemini";
      openrouter: "openrouter";
    }>;
    model: z.ZodString;
    temperature: z.ZodDefault<z.ZodNumber>;
    maxTokens: z.ZodDefault<z.ZodNumber>;
    topP: z.ZodOptional<z.ZodNumber>;
    frequencyPenalty: z.ZodOptional<z.ZodNumber>;
    presencePenalty: z.ZodOptional<z.ZodNumber>;
  },
  z.core.$strip
>;
/** Inferred types from schemas */
export type AiProviderSchemaType = z.infer<typeof aiProviderSchema>;
export type AiMessageRoleSchemaType = z.infer<typeof aiMessageRoleSchema>;
export type AiMessageSchemaType = z.infer<typeof aiMessageSchema>;
export type AiChatRequestSchemaType = z.infer<typeof aiChatRequestSchema>;
export type AiModelConfigSchemaType = z.infer<typeof aiModelConfigSchema>;
//# sourceMappingURL=ai.schema.d.ts.map
