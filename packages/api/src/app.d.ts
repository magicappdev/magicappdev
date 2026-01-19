/**
 * Hono app configuration
 */
import type { AppContext } from "./types.js";
import { Hono } from "hono";
/** Create the Hono app */
export declare function createApp(): Hono<
  AppContext,
  import("hono/types").BlankSchema,
  "/"
>;
//# sourceMappingURL=app.d.ts.map
