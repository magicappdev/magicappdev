/**
 * GitHub integration routes
 * POST /github/create-repo — creates a GitHub repo and pushes generated files
 */

import { schema } from "@magicappdev/database";
import type { AppContext } from "../types.js";
import { eq, and } from "drizzle-orm";
import { Hono } from "hono";

export const githubRoutes = new Hono<AppContext>();

interface FileEntry {
  path: string;
  content: string;
}

interface CreateRepoBody {
  name: string;
  description?: string;
  isPrivate?: boolean;
  files: FileEntry[];
}

githubRoutes.post("/create-repo", async c => {
  const userId = c.get("userId") as string;
  const db = c.get("db");

  const body = await c.req.json<CreateRepoBody>();
  const { name, description = "", isPrivate = false, files } = body;

  if (!name || !files?.length) {
    return c.json(
      {
        success: false,
        error: {
          code: "INVALID_INPUT",
          message: "name and files are required",
        },
      },
      400,
    );
  }

  // Fetch the user's GitHub OAuth token from the accounts table
  const account = await db.query.accounts.findFirst({
    where: and(
      eq(schema.accounts.userId, userId),
      eq(schema.accounts.provider, "github"),
    ),
  });

  if (!account?.access_token) {
    return c.json(
      {
        success: false,
        error: {
          code: "NO_GITHUB_TOKEN",
          message: "Connect your GitHub account first via Settings → Accounts",
        },
      },
      403,
    );
  }

  const token = account.access_token;
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "Content-Type": "application/json",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  // Fetch authenticated GitHub username
  const userResp = await fetch("https://api.github.com/user", { headers });
  if (!userResp.ok) {
    return c.json(
      {
        success: false,
        error: { code: "GITHUB_AUTH_ERROR", message: "Invalid GitHub token" },
      },
      502,
    );
  }
  const ghUser = (await userResp.json()) as { login: string };
  const owner = ghUser.login;

  // Create the repository
  const createResp = await fetch("https://api.github.com/user/repos", {
    method: "POST",
    headers,
    body: JSON.stringify({
      name,
      description,
      private: isPrivate,
      auto_init: false,
    }),
  });

  if (!createResp.ok) {
    const err = (await createResp.json()) as { message?: string };
    return c.json(
      {
        success: false,
        error: {
          code: "GITHUB_CREATE_FAILED",
          message: err.message ?? "Failed to create repository",
        },
      },
      502,
    );
  }

  const repo = (await createResp.json()) as {
    html_url: string;
    clone_url: string;
  };

  // Push each file via the Contents API
  const failures: string[] = [];
  for (const file of files) {
    const encoded = btoa(unescape(encodeURIComponent(file.content)));
    const putResp = await fetch(
      `https://api.github.com/repos/${owner}/${name}/contents/${file.path}`,
      {
        method: "PUT",
        headers,
        body: JSON.stringify({
          message: `Add ${file.path}`,
          content: encoded,
        }),
      },
    );
    if (!putResp.ok) {
      failures.push(file.path);
    }
  }

  return c.json({
    success: true,
    data: {
      repoUrl: repo.html_url,
      cloneUrl: repo.clone_url,
      owner,
      name,
      failedFiles: failures,
    },
  });
});
