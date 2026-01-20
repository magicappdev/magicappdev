/**
 * Authentication routes
 */

import { accounts, profiles, sessions, users } from "@magicappdev/database";
import type { AppContext } from "../types.js";
import { and, eq } from "drizzle-orm";
import { sign } from "hono/jwt";
import { Hono } from "hono";

export const authRoutes = new Hono<AppContext>();

// Types for GitHub API responses
interface GitHubUser {
  id: number;
  login: string;
  name: string;
  email: string | null;
  avatar_url: string;
  bio: string | null;
  location: string | null;
  blog: string | null;
}

interface GitHubEmail {
  email: string;
  primary: boolean;
  verified: boolean;
  visibility: string | null;
}

// Login - Redirect to GitHub
authRoutes.get("/login/github", c => {
  const clientId = c.env.GITHUB_CLIENT_ID;
  const redirectUri = new URL(c.req.url).origin + "/auth/callback/github";

  if (!clientId) {
    return c.json({ error: "Missing GITHUB_CLIENT_ID" }, 500);
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: "user:email read:user",
  });

  return c.redirect(
    `https://github.com/login/oauth/authorize?${params.toString()}`,
  );
});

// Callback - Handle GitHub response
authRoutes.get("/callback/github", async c => {
  const code = c.req.query("code");
  const error = c.req.query("error");

  if (error || !code) {
    return c.json({ error: error || "No code provided" }, 400);
  }

  const clientId = c.env.GITHUB_CLIENT_ID;
  const clientSecret = c.env.GITHUB_CLIENT_SECRET;

  // Dynamic redirect URI verification
  const redirectUri = new URL(c.req.url).origin + "/auth/callback/github";

  if (!clientId || !clientSecret) {
    return c.json({ error: "Missing GitHub credentials" }, 500);
  }

  // 1. Exchange code for access token
  const tokenResponse = await fetch(
    "https://github.com/login/oauth/access_token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
      }),
    },
  );

  const tokenData = (await tokenResponse.json()) as {
    access_token: string;
    error?: string;
  };

  if (tokenData.error || !tokenData.access_token) {
    return c.json(
      { error: tokenData.error || "Failed to get access token" },
      400,
    );
  }

  // 2. Fetch User Info
  const userResponse = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
      "User-Agent": "MagicAppDev",
    },
  });

  const githubUser = (await userResponse.json()) as GitHubUser;

  // 3. Fetch Email if missing
  let email = githubUser.email;
  if (!email) {
    const emailsResponse = await fetch("https://api.github.com/user/emails", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        "User-Agent": "MagicAppDev",
      },
    });
    const emails = (await emailsResponse.json()) as GitHubEmail[];
    const primary = emails.find((e: GitHubEmail) => e.primary && e.verified);
    if (primary) email = primary.email;
  }

  if (!email) {
    return c.json({ error: "No verified email found" }, 400);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = c.var.db as any;

  // 4. Find or Create User
  // Check if account exists
  const existingAccount = await db.query.accounts.findFirst({
    // Using manual query for composite handling simulation if needed, but simple filtering works

    where: and(
      eq((accounts as any).provider, "github"),
      eq((accounts as any).providerAccountId, githubUser.id.toString()),
    ),
  });

  let userId = "";

  if (existingAccount) {
    userId = existingAccount.userId;
    // Update tokens?
  } else {
    // Check if user with email exists (link account)
    const existingUser = await db.query.users.findFirst({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      where: eq((users as any).email, email),
    });

    if (existingUser) {
      userId = existingUser.id;
    } else {
      // Create new user
      userId = crypto.randomUUID();
      await db.insert(users).values({
        id: userId,
        email,
        name: githubUser.name || githubUser.login,
        avatarUrl: githubUser.avatar_url,
        emailVerified: true,
        role: "user",
      });

      // Create profile
      await db.insert(profiles).values({
        id: crypto.randomUUID(),
        userId,
        bio: githubUser.bio,
        location: githubUser.location,
        website: githubUser.blog,
        githubUsername: githubUser.login,
      });
    }

    // Link Account
    await db.insert(accounts).values({
      id: crypto.randomUUID(),
      userId,
      type: "oauth",
      provider: "github",
      providerAccountId: githubUser.id.toString(),
      access_token: tokenData.access_token,
    });
  }

  // 5. Create Session
  const accessToken = await sign(
    {
      sub: userId,
      role: "user",
      exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour
    },
    c.env.JWT_SECRET || "secret-fallback-do-not-use-in-prod",
  );

  const refreshToken = crypto.randomUUID();
  const expiresAt = new Date(
    Date.now() + 7 * 24 * 60 * 60 * 1000,
  ).toISOString(); // 7 days

  await db.insert(sessions).values({
    id: crypto.randomUUID(),
    userId,
    refreshToken,
    expiresAt,
    userAgent: c.req.header("User-Agent"),
    ipAddress: c.req.header("CF-Connecting-IP"),
  });

  // Redirect to frontend with tokens
  // In production, use environment variable for frontend URL
  const frontendUrl =
    c.env.ENVIRONMENT === "development"
      ? "http://localhost:3000"
      : "https://magicappdev.pages.dev"; // Placeholder

  // Using query params for simplicity; in prod use cookies or secure postMessage
  return c.redirect(
    `${frontendUrl}/auth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}`,
  );
});

// Get current user (Protected)
authRoutes.get("/me", async c => {
  const userId = c.var.userId;
  if (!userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = c.var.db as any;

  const user = await db.query.users.findFirst({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    where: eq((users as any).id, userId),
    with: {
      profile: true,
    },
  });

  if (!user) {
    return c.json({ error: "User not found" }, 404);
  }

  return c.json({ data: user });
});
