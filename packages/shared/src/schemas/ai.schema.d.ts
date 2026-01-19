/**
 * AI-related validation schemas
 */
import { z } from "zod";
/** AI provider schema */
export declare const aiProviderSchema: z.ZodEnum<
  ["workers-ai", "openai", "anthropic", "gemini", "openrouter"]
>;
/** AI message role schema */
export declare const aiMessageRoleSchema: z.ZodEnum<
  ["system", "user", "assistant"]
>;
/** AI message schema */
export declare const aiMessageSchema: z.ZodObject<
  {
    role: z.ZodEnum<["system", "user", "assistant"]>;
    content: z.ZodString;
  },
  "strip",
  z.ZodTypeAny,
  {
    role: "system" | "user" | "assistant";
    content: string;
  },
  {
    role: "system" | "user" | "assistant";
    content: string;
  }
>;
/** AI chat request schema */
export declare const aiChatRequestSchema: z.ZodObject<
  {
    projectId: z.ZodOptional<z.ZodString>;
    messages: z.ZodArray<
      z.ZodObject<
        {
          role: z.ZodEnum<["system", "user", "assistant"]>;
          content: z.ZodString;
        },
        "strip",
        z.ZodTypeAny,
        {
          role: "system" | "user" | "assistant";
          content: string;
        },
        {
          role: "system" | "user" | "assistant";
          content: string;
        }
      >,
      "many"
    >;
    provider: z.ZodOptional<
      z.ZodEnum<["workers-ai", "openai", "anthropic", "gemini", "openrouter"]>
    >;
    model: z.ZodOptional<z.ZodString>;
    stream: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    temperature: z.ZodOptional<z.ZodNumber>;
    maxTokens: z.ZodOptional<z.ZodNumber>;
  },
  "strip",
  z.ZodTypeAny,
  {
    messages: {
      role: "system" | "user" | "assistant";
      content: string;
    }[];
    stream: boolean;
    provider?:
      | "workers-ai"
      | "openai"
      | "anthropic"
      | "gemini"
      | "openrouter"
      | undefined;
    projectId?: string | undefined;
    model?: string | undefined;
    temperature?: number | undefined;
    maxTokens?: number | undefined;
  },
  {
    messages: {
      role: "system" | "user" | "assistant";
      content: string;
    }[];
    provider?:
      | "workers-ai"
      | "openai"
      | "anthropic"
      | "gemini"
      | "openrouter"
      | undefined;
    projectId?: string | undefined;
    model?: string | undefined;
    stream?: boolean | undefined;
    temperature?: number | undefined;
    maxTokens?: number | undefined;
  }
>;
/** AI model configuration schema */
export declare const aiModelConfigSchema: z.ZodObject<
  {
    provider: z.ZodEnum<
      ["workers-ai", "openai", "anthropic", "gemini", "openrouter"]
    >;
    model: z.ZodString;
    temperature: z.ZodDefault<z.ZodNumber>;
    maxTokens: z.ZodDefault<z.ZodNumber>;
    topP: z.ZodOptional<z.ZodNumber>;
    frequencyPenalty: z.ZodOptional<z.ZodNumber>;
    presencePenalty: z.ZodOptional<z.ZodNumber>;
  },
  "strip",
  z.ZodTypeAny,
  {
    provider: "workers-ai" | "openai" | "anthropic" | "gemini" | "openrouter";
    model: string;
    temperature: number;
    maxTokens: number;
    topP?: number | undefined;
    frequencyPenalty?: number | undefined;
    presencePenalty?: number | undefined;
  },
  {
    provider: "workers-ai" | "openai" | "anthropic" | "gemini" | "openrouter";
    model: string;
    temperature?: number | undefined;
    maxTokens?: number | undefined;
    topP?: number | undefined;
    frequencyPenalty?: number | undefined;
    presencePenalty?: number | undefined;
  }
>;
/** Inferred types from schemas */
export type AiProviderSchemaType = z.infer<typeof aiProviderSchema>;
export type AiMessageRoleSchemaType = z.infer<typeof aiMessageRoleSchema>;
export type AiMessageSchemaType = z.infer<typeof aiMessageSchema>;
export type AiChatRequestSchemaType = z.infer<typeof aiChatRequestSchema>;
export type AiModelConfigSchemaType = z.infer<typeof aiModelConfigSchema>;
//# sourceMappingURL=ai.schema.d.ts.map
