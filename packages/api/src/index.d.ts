/**
 * @magicappdev/api
 *
 * MagicAppDev API - Cloudflare Workers backend
 */
import type { Env } from "./types.js";
import { createApp } from "./app.js";
declare const _default: {
  fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Response | Promise<Response>;
};
export default _default;
export { createApp };
export type { AppContext, Env, Variables } from "./types.js";
//# sourceMappingURL=index.d.ts.map
