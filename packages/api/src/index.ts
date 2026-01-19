/**
 * @magicappdev/api
 *
 * MagicAppDev API - Cloudflare Workers backend
 */

import type { Env } from "./types.js";
import { createApp } from "./app.js";

const app = createApp();

export default {
  fetch(request: Request, env: Env, ctx: ExecutionContext) {
    return app.fetch(request, env, ctx as any);
  },
};

// Re-export for use as a library
export { createApp };
export type { AppContext, Env, Variables } from "./types.js";
