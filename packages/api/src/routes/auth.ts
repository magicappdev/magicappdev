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
  const platform = c.req.query("platform") || "web";
  const redirectUri =
    c.env.GITHUB_REDIRECT_URI ||
    new URL(c.req.url).origin + "/auth/callback/github";

  if (!clientId) {
    return c.json({ error: "Missing GITHUB_CLIENT_ID" }, 500);
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: "user:email read:user",
    state: platform, // Pass platform in state
  });

  return c.redirect(
    `https://github.com/login/oauth/authorize?${params.toString()}`,
  );
});

// Callback - Handle GitHub response
authRoutes.get("/callback/github", async c => {
  console.log("GitHub callback received");
  const code = c.req.query("code");
  const error = c.req.query("error");
  const platform = c.req.query("state") || "web";

  if (error || !code) {
    console.error("GitHub Auth Error:", error || "No code");
    return c.json({ error: error || "No code provided" }, 400);
  }

  const clientId = c.env.GITHUB_CLIENT_ID;
  const clientSecret = c.env.GITHUB_CLIENT_SECRET;

  console.log("Using Client ID:", clientId ? "Set" : "Missing");
  console.log("Using Client Secret:", clientSecret ? "Set" : "Missing");

  // Use configured redirect URI or fallback to dynamic origin
  const redirectUri =
    c.env.GITHUB_REDIRECT_URI ||
    new URL(c.req.url).origin + "/auth/callback/github";

  console.log("Redirect URI:", redirectUri);

  if (!clientId || !clientSecret) {
    console.error("Missing GitHub credentials");
    return c.json({ error: "Missing GitHub credentials" }, 500);
  }

  try {
    // 1. Exchange code for access token
    console.log("Exchanging code for token...");
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

    if (!tokenResponse.ok) {
      const errText = await tokenResponse.text();
      console.error("GitHub Token Error:", errText);
      return c.json({ error: "Failed to exchange code for token" }, 400);
    }

    const tokenData = (await tokenResponse.json()) as {
      access_token: string;
      error?: string;
    };

    if (tokenData.error || !tokenData.access_token) {
      console.error("Token Exchange Error:", tokenData.error);
      return c.json(
        { error: tokenData.error || "Failed to get access token" },
        400,
      );
    }

    console.log("Token received, fetching user info...");

    // 2. Fetch User Info
    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        "User-Agent": "MagicAppDev",
      },
    });

    if (!userResponse.ok) {
      const errText = await userResponse.text();
      console.error("GitHub User Error:", errText);
      return c.json({ error: "Failed to fetch user info from GitHub" }, 400);
    }

    const githubUser = (await userResponse.json()) as GitHubUser;
    console.log("GitHub User received:", githubUser.login);

    // 3. Fetch Email if missing
    let email = githubUser.email;
    if (!email) {
      console.log("Email missing from user profile, fetching emails...");
      const emailsResponse = await fetch("https://api.github.com/user/emails", {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          "User-Agent": "MagicAppDev",
        },
      });

      if (emailsResponse.ok) {
        const emails = (await emailsResponse.json()) as GitHubEmail[];
        const primary = emails.find(
          (e: GitHubEmail) => e.primary && e.verified,
        );
        if (primary) email = primary.email;
      }
    }

    if (!email) {
      console.error("No verified email found for user");
      return c.json({ error: "No verified email found" }, 400);
    }

    console.log("User email:", email);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = c.var.db as any;

    // 4. Find or Create User
    console.log("Checking for existing account...");
    const existingAccount = await db.query.accounts.findFirst({
      where: and(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        eq((accounts as any).provider, "github"),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        eq((accounts as any).providerAccountId, String(githubUser.id)),
      ),
    });

    let userId = "";

    if (existingAccount) {
      console.log("Existing account found for user:", existingAccount.userId);
      userId = existingAccount.userId;
    } else {
      console.log("No existing account, checking for user with email...");
      // Check if user with email exists (link account)
      const existingUser = await db.query.users.findFirst({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        where: eq((users as any).email, email),
      });

      if (existingUser) {
        console.log("Existing user found with email, linking account...");
        userId = existingUser.id;
      } else {
        console.log("Creating new user...");
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

        console.log("Creating user profile...");
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

      console.log("Linking account...");
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
    console.log("Creating session...");
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

    console.log("Authentication successful, redirecting...");

    // 6. Redirect back to app
    if (platform === "mobile") {
      const mobileUri =
        c.env.MOBILE_REDIRECT_URI || "magicappdev://auth/callback";
      return c.redirect(
        `${mobileUri}?accessToken=${accessToken}&refreshToken=${refreshToken}`,
      );
    }

    const frontendUrl =
      c.env.FRONTEND_URL ||
      (c.env.ENVIRONMENT === "development"
        ? "http://localhost:3100"
        : "https://app.magicappdev.workers.dev");

    return c.redirect(
      `${frontendUrl}/auth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}`,
    );
  } catch (err) {
    console.error("Fatal Error in GitHub Callback:", err);
    throw err; // Re-throw to be caught by app.onError
  }
});

// Refresh Token
authRoutes.post("/refresh", async c => {
  const { refreshToken } = await c.req.json<{ refreshToken: string }>();
  if (!refreshToken) return c.json({ error: "Missing refresh token" }, 400);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = c.var.db as any;

  const session = await db.query.sessions.findFirst({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    where: eq((sessions as any).refreshToken, refreshToken),
  });

  if (!session || new Date(session.expiresAt) < new Date()) {
    return c.json({ error: "Invalid or expired session" }, 401);
  }

  const accessToken = await sign(
    {
      sub: session.userId,
      role: "user",
      exp: Math.floor(Date.now() / 1000) + 60 * 60,
    },
    c.env.JWT_SECRET || "secret-fallback-do-not-use-in-prod",
  );

  return c.json({ success: true, data: { accessToken } });
});

// Logout
authRoutes.post("/logout", async c => {
  const { refreshToken } = await c.req.json<{ refreshToken: string }>();
  if (!refreshToken) return c.json({ success: true }); // Silent fail

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = c.var.db as any;

  await db
    .delete(sessions)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .where(eq((sessions as any).refreshToken, refreshToken));

  return c.json({ success: true });
});

// Get current user (Protected)
authRoutes.get("/me", async c => {
  const userId = c.var.userId;
  if (!userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = c.var.db as any;

  try {
    // Use simple select to avoid relation issues for now
    const user = await db
      .select()
      .from(users)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .where(eq((users as any).id, userId))
      .get();

    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    // Fetch profile separately
    const userProfile = await db
      .select()
      .from(profiles)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .where(eq((profiles as any).userId, userId))
      .get();

    return c.json({
      success: true,
      data: {
        ...user,
        profile: userProfile,
      },
    });
  } catch (err) {
    console.error("Error in /me:", err);
    return c.json(
      {
        success: false,
        error: {
          code: "DB_ERROR",
          message: err instanceof Error ? err.message : "Database query failed",
        },
      },
      500,
    );
  }
});
