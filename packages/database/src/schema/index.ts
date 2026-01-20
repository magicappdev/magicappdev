/**
 * Database schema exports
 */

import { sessions } from "./sessions.js";
import { projects } from "./projects.js";
import { profiles } from "./profiles.js";
import { accounts } from "./accounts.js";
import { users } from "./users.js";

export const schema = {
  users,
  projects,
  sessions,
  accounts,
  profiles,
};

export * from "./accounts.js";
export * from "./profiles.js";
export * from "./projects.js";
export * from "./sessions.js";
export * from "./users.js";
