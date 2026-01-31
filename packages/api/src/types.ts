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
  JWT_SECRET: string;
  /** OpenAI API key */
  OPENAI_API_KEY?: string;
  /** Anthropic API key */
  ANTHROPIC_API_KEY?: string;
  /** Google AI API key */
  GOOGLE_AI_API_KEY?: string;
  /** OpenRouter API key */
  OPENROUTER_API_KEY?: string;
  /** GitHub Client ID */
  GITHUB_CLIENT_ID?: string;
  /** GitHub Client Secret */
  GITHUB_CLIENT_SECRET?: string;
  /** GitHub Redirect URI */
  GITHUB_REDIRECT_URI?: string;
  /** Discord Client ID */
  DISCORD_CLIENT_ID?: string;
  /** Discord Client Secret */
  DISCORD_CLIENT_SECRET?: string;
  /** Discord Redirect URI */
  DISCORD_REDIRECT_URI?: string;
  /** Frontend URL for web redirects */
  FRONTEND_URL?: string;
  /** Mobile redirect URI for deep linking */
  MOBILE_REDIRECT_URI?: string;
  /** Cloudflare AI Gateway ID */
  AI_GATEWAY_ID?: string;
  /** Admin API keys (comma-separated) */
  ADMIN_API_KEYS?: string;
  /** Rate limiting KV namespace */
  RATE_LIMIT_KV?: KVNamespace;
}

/** App context variables */
export interface Variables {
  /** Database client */
  db: Database;
  /** Current user ID (set after auth) */
  userId?: string;
  /** Current user role */
  userRole?: string;
}

/** Request context with typed env and variables */
export type AppContext = {
  Bindings: Env;
  Variables: Variables;
};
