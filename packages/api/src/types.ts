/**
 * API types and environment bindings
 */

import type { Database } from "@magicappdev/database";

/** Cloudflare environment bindings */
export interface Env {
  /** D1 database binding */
  DB: D1Database;
  /** Workers AI binding */
  AI: Ai;
  /** Environment name */
  ENVIRONMENT: string;
  /** JWT secret for auth */
  JWT_SECRET?: string;
  /** OpenAI API key */
  OPENAI_API_KEY?: string;
  /** Anthropic API key */
  ANTHROPIC_API_KEY?: string;
  /** Google AI API key */
  GOOGLE_AI_API_KEY?: string;
  /** OpenRouter API key */
  OPENROUTER_API_KEY?: string;
}

/** App context variables */
export interface Variables {
  /** Database client */
  db: Database;
  /** Current user ID (set after auth) */
  userId?: string;
}

/** Request context with typed env and variables */
export type AppContext = {
  Bindings: Env;
  Variables: Variables;
};
