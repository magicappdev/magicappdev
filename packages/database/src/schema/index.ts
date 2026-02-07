/**
 * Database schema exports
 */

import { tickets, ticketsRelations } from "./tickets.js";
import { projectCommands } from "./project-commands.js";
import { projectErrors } from "./project-errors.js";
import { adminApiKeys } from "./admin-api-keys.js";
import { projectFiles } from "./project-files.js";
import { chatSessions } from "./chat-sessions.js";
import { chatMessages } from "./chat-messages.js";
import { fileHistory } from "./file-history.js";
import { systemLogs } from "./system-logs.js";
import { sessions } from "./sessions.js";
import { projects } from "./projects.js";
import { profiles } from "./profiles.js";
import { accounts } from "./accounts.js";
import { apiKeys } from "./api-keys.js";
import { users } from "./users.js";

export const schema = {
  users,
  projects,
  sessions,
  accounts,
  profiles,
  tickets,
  ticketsRelations,
  apiKeys,
  systemLogs,
  adminApiKeys,
  projectFiles,
  fileHistory,
  projectCommands,
  projectErrors,
  chatSessions,
  chatMessages,
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
export * from "./project-files.js";
export * from "./file-history.js";
export * from "./project-commands.js";
export * from "./project-errors.js";
export * from "./chat-sessions.js";
export * from "./chat-messages.js";
