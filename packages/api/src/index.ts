/**
 * @magicappdev/api
 *
 * MagicAppDev API - Cloudflare Workers backend
 */

import type { Env } from "./types";
import { createApp } from "./app";

const app = createApp();

export default {
  fetch(request: Request, env: Env, ctx: ExecutionContext) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return app.fetch(request, env, ctx as any);
  },
};

// Re-export for use as a library
export { createApp };
export type { AppContext, Env, Variables } from "./types";
