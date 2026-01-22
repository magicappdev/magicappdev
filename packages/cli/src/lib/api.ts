import { ApiClient } from "@magicappdev/shared/api";
import { loadConfig } from "./config.js";

const config = await loadConfig();

const API_URL =
  process.env.MAGICAPPDEV_API_URL ||
  config.apiUrl ||
  "https://magicappdev-api.magicappdev.workers.dev";

export const AGENT_HOST =
  process.env.MAGICAPPDEV_AGENT_HOST ||
  config.agentHost ||
  "magicappdev-agent.magicappdev.workers.dev";

export const api = new ApiClient(API_URL);

if (config.accessToken) {
  api.setToken(config.accessToken);
}

export type { User, Project } from "@magicappdev/shared";
