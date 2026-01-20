import { ApiClient } from "@magicappdev/shared/api";

const API_URL =
  process.env.MAGICAPPDEV_API_URL ||
  "https://magicappdev-api.magicappdev.workers.dev";

export const api = new ApiClient(API_URL);

export type { User, Project } from "@magicappdev/shared";
