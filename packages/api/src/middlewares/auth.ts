/**
 * Authentication middleware
 */

import { createMiddleware } from "hono/factory";
import type { AppContext } from "../types.js";
import { verify } from "hono/jwt";

/** JWT payload structure */
interface JwtPayload {
  sub: string;
  role: string;
  exp: number;
}

/** Auth middleware */
export const authMiddleware = createMiddleware<AppContext>(async (c, next) => {
  const authHeader = c.req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json(
      {
        success: false,
        error: { code: "AUTH_UNAUTHORIZED", message: "Unauthorized" },
      },
      401,
    );
  }

  const token = authHeader.split(" ")[1];
  const secret = c.env.JWT_SECRET || "secret-fallback-do-not-use-in-prod";

  try {
    const payload = (await verify(
      token,
      secret,
      "HS256",
    )) as unknown as JwtPayload;
    c.set("userId", payload.sub);
    c.set("userRole", payload.role);
    return await next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    return c.json(
      {
        success: false,
        error: { code: "AUTH_INVALID_TOKEN", message: "Invalid token" },
      },
      401,
    );
  }
});
