/**
 * Authentication routes
 */

import { accounts, profiles, sessions, users } from "@magicappdev/database";
import type { AppContext } from "../types.js";
import { eq, and } from "drizzle-orm";
import { sign } from "hono/jwt";
import bcrypt from "bcryptjs";
import { Hono } from "hono";

export const authRoutes = new Hono<AppContext>();

// Manual Register
authRoutes.post("/register", async c => {
  const { email, password, name } = await c.req.json();
  if (!email || !password || !name) {
    return c.json({ error: "Missing required fields" }, 400);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = c.var.db as any;

  // Check if user exists
  const existingUser = await db.query.users.findFirst({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    where: (u: any, { eq }: any) => eq(u.email, email),
  });

  if (existingUser) {
    return c.json({ error: "User already exists" }, 400);
  }

  const userId = crypto.randomUUID();
  const passwordHash = await bcrypt.hash(password, 10);

  await db.insert(users).values({
    id: userId,
    email,
    name,
    passwordHash,
    role: "user",
    emailVerified: false,
  });

  await db.insert(profiles).values({
    id: crypto.randomUUID(),
    userId,
  });

  return c.json({ success: true, message: "User registered successfully" });
});

// Manual Login
authRoutes.post("/login", async c => {
  const { email, password } = await c.req.json();
  if (!email || !password) {
    return c.json({ error: "Email and password required" }, 400);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = c.var.db as any;

  const user = await db.query.users.findFirst({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    where: (u: any, { eq }: any) => eq(u.email, email),
  });

  if (!user || !user.passwordHash) {
    return c.json({ error: "Invalid credentials" }, 401);
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    return c.json({ error: "Invalid credentials" }, 401);
  }

  // Create Session
  const accessToken = await sign(
    {
      sub: user.id,
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + 60 * 60,
    },
    c.env.JWT_SECRET || "secret-fallback-do-not-use-in-prod",
  );

  const refreshToken = crypto.randomUUID();
  await db.insert(sessions).values({
    id: crypto.randomUUID(),
    userId: user.id,
    refreshToken,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    userAgent: c.req.header("User-Agent"),
    ipAddress: c.req.header("CF-Connecting-IP"),
  });

  return c.json({
    success: true,
    data: {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    },
  });
});

// Login - Redirect to GitHub
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

interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  global_name: string | null;
  avatar: string | null;
  email: string | null;
  verified: boolean;
}

// Login - Redirect to Discord
authRoutes.get("/login/discord", c => {
  const clientId = c.env.DISCORD_CLIENT_ID;
  const platform = c.req.query("platform") || "web";
  const clientRedirectUri = c.req.query("redirect_uri");

  const apiRedirectUri =
    c.env.DISCORD_REDIRECT_URI ||
    new URL(c.req.url).origin + "/auth/callback/discord";

  if (!clientId) {
    return c.json(
      {
        success: false,
        error: {
          code: "NOT_CONFIGURED",
          message: "Discord OAuth not configured",
        },
      },
      500,
    );
  }

  // Encode platform and client redirect URI into state
  const state = JSON.stringify({
    platform,
    redirect_uri: clientRedirectUri,
  });

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: apiRedirectUri,
    response_type: "code",
    scope: "identify email",
    state,
  });

  return c.redirect(
    `https://discord.com/api/oauth2/authorize?${params.toString()}`,
  );
});

// Callback - Handle Discord response
authRoutes.get("/callback/discord", async c => {
  console.log("Discord callback received");
  const code = c.req.query("code");
  const error = c.req.query("error");
  const stateStr = c.req.query("state");

  let platform = "web";
  let clientRedirectUri: string | undefined;

  try {
    if (stateStr) {
      const state = JSON.parse(stateStr);
      if (typeof state === "object") {
        platform = state.platform || "web";
        clientRedirectUri = state.redirect_uri;
      } else {
        platform = stateStr;
      }
    }
  } catch {
    platform = stateStr || "web";
  }

  if (error || !code) {
    console.error("Discord Auth Error:", error || "No code");
    return c.json({ error: error || "No code provided" }, 400);
  }

  const clientId = c.env.DISCORD_CLIENT_ID;
  const clientSecret = c.env.DISCORD_CLIENT_SECRET;

  const redirectUri =
    c.env.DISCORD_REDIRECT_URI ||
    new URL(c.req.url).origin + "/auth/callback/discord";

  if (!clientId || !clientSecret) {
    console.error("Missing Discord credentials");
    return c.json({ error: "Missing Discord credentials" }, 500);
  }

  try {
    // 1. Exchange code for access token
    console.log("Exchanging Discord code for token...");
    const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      const errText = await tokenResponse.text();
      console.error("Discord Token Error:", errText);
      return c.json({ error: "Failed to exchange code for token" }, 400);
    }

    const tokenData = (await tokenResponse.json()) as {
      access_token: string;
      token_type: string;
      error?: string;
    };

    if (tokenData.error || !tokenData.access_token) {
      console.error("Token Exchange Error:", tokenData.error);
      return c.json(
        { error: tokenData.error || "Failed to get access token" },
        400,
      );
    }

    console.log("Discord token received, fetching user info...");

    // 2. Fetch User Info
    const userResponse = await fetch("https://discord.com/api/users/@me", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    if (!userResponse.ok) {
      const errText = await userResponse.text();
      console.error("Discord User Error:", errText);
      return c.json({ error: "Failed to fetch user info from Discord" }, 400);
    }

    const discordUser = (await userResponse.json()) as DiscordUser;
    console.log("Discord User received:", discordUser.username);

    const email = discordUser.email;
    if (!email || !discordUser.verified) {
      console.error("No verified email found for Discord user");
      return c.json(
        { error: "Discord account must have a verified email" },
        400,
      );
    }

    console.log("User email:", email);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = c.var.db as any;

    // 3. Find or Create User
    console.log("Checking for existing Discord account...");
    const existingAccount = await db.query.accounts.findFirst({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      where: (acc: any, { and, eq }: any) =>
        and(
          eq(acc.provider, "discord"),
          eq(acc.providerAccountId, discordUser.id),
        ),
    });

    let userId = "";

    if (existingAccount) {
      console.log(
        "Existing Discord account found for user:",
        existingAccount.userId,
      );
      userId = existingAccount.userId;
    } else {
      console.log("No existing account, checking for user with email...");
      const existingUser = await db.query.users.findFirst({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        where: (u: any, { eq }: any) => eq(u.email, email),
      });

      if (existingUser) {
        console.log(
          "Existing user found with email, linking Discord account...",
        );
        userId = existingUser.id;

        // Build Discord avatar URL
        const avatarUrl = discordUser.avatar
          ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
          : null;

        await db
          .update(users)
          .set({
            name:
              existingUser.name ||
              discordUser.global_name ||
              discordUser.username,
            avatarUrl: existingUser.avatarUrl || avatarUrl,
          })
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .where(eq(users.id as any, userId));
      } else {
        console.log("Creating new user from Discord...");
        userId = crypto.randomUUID();

        const avatarUrl = discordUser.avatar
          ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
          : null;

        await db.insert(users).values({
          id: userId,
          email,
          name: discordUser.global_name || discordUser.username,
          avatarUrl,
          emailVerified: true,
          role: "user",
        });

        console.log("Creating user profile...");
        await db.insert(profiles).values({
          id: crypto.randomUUID(),
          userId,
        });
      }

      console.log("Linking Discord account...");
      await db.insert(accounts).values({
        id: crypto.randomUUID(),
        userId,
        type: "oauth",
        provider: "discord",
        providerAccountId: discordUser.id,
        access_token: tokenData.access_token,
      });
    }

    // 4. Create Session
    console.log("Creating session...");

    const user = await db.query.users.findFirst({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      where: (u: any, { eq }: any) => eq(u.id, userId),
    });

    const accessToken = await sign(
      {
        sub: userId,
        role: user?.role || "user",
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

    console.log("Discord authentication successful, redirecting...");

    // 5. Redirect back to app
    if (platform === "mobile") {
      const mobileUri =
        clientRedirectUri ||
        c.env.MOBILE_REDIRECT_URI ||
        "magicappdev://auth/callback";

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
    console.error("Fatal Error in Discord Callback:", err);
    throw err;
  }
});

// Login - Redirect to GitHub
authRoutes.get("/login/github", c => {
  const clientId = c.env.GITHUB_CLIENT_ID;
  const platform = c.req.query("platform") || "web";
  const clientRedirectUri = c.req.query("redirect_uri");

  const apiRedirectUri =
    c.env.GITHUB_REDIRECT_URI ||
    new URL(c.req.url).origin + "/auth/callback/github";

  if (!clientId) {
    return c.json({ error: "Missing GITHUB_CLIENT_ID" }, 500);
  }

  // Encode platform and client redirect URI into state
  const state = JSON.stringify({
    platform,
    redirect_uri: clientRedirectUri,
  });

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: apiRedirectUri,
    scope: "user:email read:user",
    state,
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
  const stateStr = c.req.query("state");

  let platform = "web";
  let clientRedirectUri: string | undefined;

  try {
    if (stateStr) {
      // Try to parse state as JSON
      const state = JSON.parse(stateStr);
      if (typeof state === "object") {
        platform = state.platform || "web";
        clientRedirectUri = state.redirect_uri;
      } else {
        platform = stateStr;
      }
    }
  } catch {
    // Fallback to simple string state
    platform = stateStr || "web";
  }

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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      where: (acc: any, { and, eq }: any) =>
        and(
          eq(acc.provider, "github"),
          eq(acc.providerAccountId, String(githubUser.id)),
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
        where: (u: any, { eq }: any) => eq(u.email, email),
      });

      if (existingUser) {
        console.log("Existing user found with email, linking account...");
        userId = existingUser.id;

        // Update user name/avatar if not set or if we want to sync
        await db
          .update(users)
          .set({
            name: existingUser.name || githubUser.name || githubUser.login,
            avatarUrl: existingUser.avatarUrl || githubUser.avatar_url,
          })
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .where(eq(users.id as any, userId));
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

    // Fetch latest user data to get role
    const user = await db.query.users.findFirst({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      where: (u: any, { eq }: any) => eq(u.id, userId),
    });

    const accessToken = await sign(
      {
        sub: userId,
        role: user?.role || "user",
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
        clientRedirectUri ||
        c.env.MOBILE_REDIRECT_URI ||
        "magicappdev://auth/callback";

      console.log("Redirecting to mobile URI:", mobileUri);

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
    where: (s: any, { eq }: any) => eq(s.refreshToken, refreshToken),
  });

  if (!session || new Date(session.expiresAt) < new Date()) {
    return c.json({ error: "Invalid or expired session" }, 401);
  }

  const user = await db.query.users.findFirst({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    where: (u: any, { eq }: any) => eq(u.id, session.userId),
  });

  const accessToken = await sign(
    {
      sub: session.userId,
      role: user?.role || "user",
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

// Change Password
authRoutes.post("/change-password", async c => {
  const userId = c.var.userId;
  if (!userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const { currentPassword, newPassword } = await c.req.json<{
    currentPassword: string;
    newPassword: string;
  }>();

  if (!currentPassword || !newPassword) {
    return c.json(
      { error: "Current password and new password are required" },
      400,
    );
  }

  if (newPassword.length < 6) {
    return c.json({ error: "New password must be at least 6 characters" }, 400);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = c.var.db as any;

  const user = await db.query.users.findFirst({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    where: (u: any, { eq }: any) => eq(u.id, userId),
  });

  if (!user || !user.passwordHash) {
    return c.json({ error: "User not found" }, 404);
  }

  const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isValid) {
    return c.json({ error: "Current password is incorrect" }, 401);
  }

  const newPasswordHash = await bcrypt.hash(newPassword, 10);

  await db
    .update(users)
    .set({ passwordHash: newPasswordHash, updatedAt: new Date().toISOString() })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .where(eq((users as any).id, userId));

  return c.json({ success: true, message: "Password changed successfully" });
});

// Update Profile
authRoutes.put("/profile", async c => {
  const userId = c.var.userId;
  if (!userId) {
    return c.json(
      {
        success: false,
        error: { code: "UNAUTHORIZED", message: "Unauthorized" },
      },
      401,
    );
  }

  const { name, bio } = await c.req.json<{
    name?: string;
    bio?: string;
  }>();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = c.var.db as any;

  try {
    // Update user name if provided
    if (name !== undefined) {
      await db
        .update(users)
        .set({ name, updatedAt: new Date().toISOString() })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .where(eq((users as any).id, userId));
    }

    // Update profile bio if provided
    if (bio !== undefined) {
      await db
        .update(profiles)
        .set({ bio, updatedAt: new Date().toISOString() })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .where(eq((profiles as any).userId, userId));
    }

    return c.json({ success: true, message: "Profile updated successfully" });
  } catch (err) {
    console.error("Error updating profile:", err);
    return c.json(
      {
        success: false,
        error: {
          code: "UPDATE_FAILED",
          message:
            err instanceof Error ? err.message : "Failed to update profile",
        },
      },
      500,
    );
  }
});

// Delete Account
authRoutes.delete("/account", async c => {
  const userId = c.var.userId;
  if (!userId) {
    return c.json(
      {
        success: false,
        error: { code: "UNAUTHORIZED", message: "Unauthorized" },
      },
      401,
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = c.var.db as any;

  try {
    // Delete in order: sessions, accounts, profiles, then users
    await db
      .delete(sessions)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .where(eq((sessions as any).userId, userId));

    await db
      .delete(accounts)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .where(eq((accounts as any).userId, userId));

    await db
      .delete(profiles)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .where(eq((profiles as any).userId, userId));

    await db
      .delete(users)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .where(eq((users as any).id, userId));

    return c.json({ success: true, message: "Account deleted successfully" });
  } catch (err) {
    console.error("Error deleting account:", err);
    return c.json(
      {
        success: false,
        error: {
          code: "DELETE_FAILED",
          message:
            err instanceof Error ? err.message : "Failed to delete account",
        },
      },
      500,
    );
  }
});

// Get Linked Accounts
authRoutes.get("/accounts", async c => {
  const userId = c.var.userId;
  if (!userId) {
    return c.json(
      {
        success: false,
        error: { code: "UNAUTHORIZED", message: "Unauthorized" },
      },
      401,
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = c.var.db as any;

  try {
    const linkedAccounts = await db
      .select({
        id: accounts.id,
        provider: accounts.provider,
        providerAccountId: accounts.providerAccountId,
      })
      .from(accounts)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .where(eq((accounts as any).userId, userId));

    return c.json({ success: true, data: linkedAccounts });
  } catch (err) {
    console.error("Error fetching linked accounts:", err);
    return c.json(
      {
        success: false,
        error: {
          code: "FETCH_FAILED",
          message:
            err instanceof Error ? err.message : "Failed to fetch accounts",
        },
      },
      500,
    );
  }
});

// Unlink OAuth Account
authRoutes.delete("/accounts/:provider", async c => {
  const userId = c.var.userId;
  const provider = c.req.param("provider");

  if (!userId) {
    return c.json(
      {
        success: false,
        error: { code: "UNAUTHORIZED", message: "Unauthorized" },
      },
      401,
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = c.var.db as any;

  try {
    // Check if user has a password set (can't unlink all OAuth if no password)
    const user = await db.query.users.findFirst({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      where: (u: any, { eq }: any) => eq(u.id, userId),
    });

    const linkedAccounts = await db
      .select()
      .from(accounts)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .where(eq((accounts as any).userId, userId));

    // Prevent unlinking if it's the only auth method
    if (!user.passwordHash && linkedAccounts.length <= 1) {
      return c.json(
        {
          success: false,
          error: {
            code: "CANNOT_UNLINK",
            message:
              "Cannot unlink the only authentication method. Set a password first.",
          },
        },
        400,
      );
    }

    await db.delete(accounts).where(
      and(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        eq((accounts as any).userId, userId),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        eq((accounts as any).provider, provider),
      ),
    );

    return c.json({
      success: true,
      message: `${provider} account unlinked successfully`,
    });
  } catch (err) {
    console.error("Error unlinking account:", err);
    return c.json(
      {
        success: false,
        error: {
          code: "UNLINK_FAILED",
          message:
            err instanceof Error ? err.message : "Failed to unlink account",
        },
      },
      500,
    );
  }
});

// Link OAuth Account (for already logged in users)
authRoutes.get("/link/:provider", c => {
  const userId = c.var.userId;
  const provider = c.req.param("provider");

  if (!userId) {
    return c.json(
      {
        success: false,
        error: { code: "UNAUTHORIZED", message: "Unauthorized" },
      },
      401,
    );
  }

  // Encode userId and action in state for the callback
  const state = JSON.stringify({
    action: "link",
    userId,
  });

  if (provider === "github") {
    const clientId = c.env.GITHUB_CLIENT_ID;
    const redirectUri =
      c.env.GITHUB_REDIRECT_URI ||
      new URL(c.req.url).origin + "/auth/callback/github";

    if (!clientId) {
      return c.json(
        {
          success: false,
          error: {
            code: "NOT_CONFIGURED",
            message: "GitHub OAuth not configured",
          },
        },
        500,
      );
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: "user:email read:user",
      state,
    });

    return c.redirect(
      `https://github.com/login/oauth/authorize?${params.toString()}`,
    );
  }

  if (provider === "discord") {
    const clientId = c.env.DISCORD_CLIENT_ID;
    const redirectUri =
      c.env.DISCORD_REDIRECT_URI ||
      new URL(c.req.url).origin + "/auth/callback/discord";

    if (!clientId) {
      return c.json(
        {
          success: false,
          error: {
            code: "NOT_CONFIGURED",
            message: "Discord OAuth not configured",
          },
        },
        500,
      );
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "identify email",
      state,
    });

    return c.redirect(
      `https://discord.com/api/oauth2/authorize?${params.toString()}`,
    );
  }

  return c.json(
    {
      success: false,
      error: { code: "INVALID_PROVIDER", message: "Invalid provider" },
    },
    400,
  );
});
