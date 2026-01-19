/**
 * @magicappdev/api
 *
 * MagicAppDev API - Cloudflare Workers backend
 */

import { createApp } from "./app";
import type { Env } from "./types";

const app = createApp();

export default {
  fetch(request: Request, env: Env, ctx: ExecutionContext) {
    return app.fetch(request, env, ctx);
  },
};

// Re-export for use as a library
export { createApp };
export type { AppContext, Env, Variables } from "./types";
