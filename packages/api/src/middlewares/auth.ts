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
  const queryToken = c.req.query("token");

  console.log("[Auth Middleware] Request URL:", c.req.url);
  console.log(
    "[Auth Middleware] Auth Header:",
    authHeader ? "Present" : "Missing",
  );
  console.log(
    "[Auth Middleware] Query Token:",
    queryToken ? "Present" : "Missing",
  );

  let token = "";

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  } else if (queryToken) {
    token = queryToken;
  }

  console.log("[Auth Middleware] Token extracted:", token ? "Yes" : "No");

  if (!token) {
    console.log("[Auth Middleware] No token found, returning 401");
    return c.json(
      {
        success: false,
        error: { code: "AUTH_UNAUTHORIZED", message: "Unauthorized" },
      },
      401,
    );
  }

  const secret = c.env.JWT_SECRET || "secret-fallback-do-not-use-in-prod";
  console.log(
    "[Auth Middleware] JWT Secret:",
    secret ? "Set" : "Using fallback",
  );

  try {
    const payload = (await verify(
      token,
      secret,
      "HS256",
    )) as unknown as JwtPayload;
    console.log("[Auth Middleware] Token verified, userId:", payload.sub);
    c.set("userId", payload.sub);
    c.set("userRole", payload.role);
    return await next();
  } catch (error) {
    console.error("[Auth Middleware] Token verification failed:", error);
    return c.json(
      {
        success: false,
        error: { code: "AUTH_INVALID_TOKEN", message: "Invalid token" },
      },
      401,
    );
  }
});
