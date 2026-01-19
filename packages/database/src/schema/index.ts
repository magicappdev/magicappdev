/**
 * Database schema exports
 */

import { sessions } from "./sessions.js";
import { projects } from "./projects.js";
import { users } from "./users.js";

export const schema = {
  users,
  projects,
  sessions,
};

export * from "./users.js";
export * from "./projects.js";
export * from "./sessions.js";
