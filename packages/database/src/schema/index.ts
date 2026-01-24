/**
 * Database schema exports
 */

import { adminApiKeys } from "./admin-api-keys.js";
import { systemLogs } from "./system-logs.js";
import { sessions } from "./sessions.js";
import { projects } from "./projects.js";
import { profiles } from "./profiles.js";
import { accounts } from "./accounts.js";
import { apiKeys } from "./api-keys.js";
import { tickets } from "./tickets.js";
import { users } from "./users.js";

export const schema = {
  users,
  projects,
  sessions,
  accounts,
  profiles,
  tickets,
  apiKeys,
  systemLogs,
  adminApiKeys,
};

export * from "./accounts.js";
export * from "./profiles.js";
export * from "./projects.js";
export * from "./sessions.js";
export * from "./users.js";
export * from "./tickets.js";
export * from "./api-keys.js";
export * from "./system-logs.js";
export * from "./admin-api-keys.js";
