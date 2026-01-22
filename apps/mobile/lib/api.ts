import { ApiClient } from "@magicappdev/shared";

// In a real app, this should come from process.env or a config file
const API_URL = "https://magicappdev-api.magicappdev.workers.dev";
export const CHAT_API_URL =
  "https://magicappdev-llmchat.magicappdev.workers.dev";
export const AGENT_HOST = "magicappdev-agent.magicappdev.workers.dev";

export const api = new ApiClient(API_URL);

export type { AiMessage, Project } from "@magicappdev/shared";
