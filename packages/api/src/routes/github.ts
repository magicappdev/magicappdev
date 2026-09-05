/**
 * GitHub integration routes
 * POST /github/create-repo — creates a GitHub repo and pushes generated files
 * POST /github/push-repo — creates/pushes an existing project's files to GitHub
 */

import { schema } from "@magicappdev/database";
import type { AppContext } from "../types.js";
import { eq, and } from "drizzle-orm";
import { Hono } from "hono";

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let index = 0;
  const workers: Promise<void>[] = [];

  for (let w = 0; w < concurrency; w++) {
    workers.push(
      (async (): Promise<void> => {
        while (index < items.length) {
          const i = index++;
          results[i] = await fn(items[i], i);
        }
      })(),
    );
  }

  await Promise.all(workers);
  return results;
}

function normalizePath(rawPath: string): string {
  const parts = rawPath.split("/");
  const result: string[] = [];
  for (const part of parts) {
    if (part === "..") {
      result.pop();
    } else if (part !== "." && part !== "") {
      result.push(part);
    }
  }
  return result.join("/");
}

function sanitizePath(rawPath: string): string {
  const normalized = normalizePath(rawPath.replace(/\\/g, "/"));
  if (
    normalized.startsWith("/") ||
    normalized.startsWith("..") ||
    normalized.includes("/..")
  ) {
    throw new Error("path_traversal");
  }
  return normalized;
}

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

interface PushRepoBody {
  projectId: string;
  repoName: string;
  isPrivate?: boolean;
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

  // Push each file via the Contents API (parallelized)
  const results = await mapWithConcurrency(files, 10, async file => {
    const safePath = sanitizePath(file.path);
    const encoded = btoa(unescape(encodeURIComponent(file.content)));
    const putResp = await fetch(
      `https://api.github.com/repos/${owner}/${name}/contents/${safePath}`,
      {
        method: "PUT",
        headers,
        body: JSON.stringify({
          message: `Add ${safePath}`,
          content: encoded,
        }),
      },
    );
    return { ok: putResp.ok, path: safePath };
  });

  const failures = results.filter(r => !r.ok).map(r => r.path);

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

githubRoutes.post("/push-repo", async c => {
  const userId = c.get("userId") as string;
  const db = c.get("db");

  const body = await c.req.json<PushRepoBody>();
  const { projectId, repoName, isPrivate = false } = body;

  if (!projectId || !repoName) {
    return c.json(
      {
        success: false,
        error: {
          code: "INVALID_INPUT",
          message: "projectId and repoName are required",
        },
      },
      400,
    );
  }

  // Verify project ownership
  const project = await db.query.projects.findFirst({
    where: eq(schema.projects.id, projectId),
  });

  if (!project) {
    return c.json(
      {
        success: false,
        error: { code: "NOT_FOUND", message: "Project not found" },
      },
      404,
    );
  }

  const userRole = c.var.userRole;
  if (userRole !== "admin" && project.userId !== userId) {
    return c.json(
      {
        success: false,
        error: { code: "FORBIDDEN", message: "Forbidden" },
      },
      403,
    );
  }

  // Fetch the user's GitHub OAuth token
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
      name: repoName,
      description:
        project.description || `Generated by MagicAppDev — ${project.name}`,
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

  // Fetch all project files
  const files = await db.query.projectFiles.findMany({
    where: eq(schema.projectFiles.projectId, projectId),
    limit: 500,
  });

  // Push each file via the Contents API (parallelized)
  const results = await mapWithConcurrency(files, 10, async file => {
    const safePath = sanitizePath(file.path);
    const encoded = btoa(unescape(encodeURIComponent(file.content)));
    const putResp = await fetch(
      `https://api.github.com/repos/${owner}/${name}/contents/${safePath}`,
      {
        method: "PUT",
        headers,
        body: JSON.stringify({
          message: `Add ${safePath}`,
          content: encoded,
        }),
      },
    );
    return { ok: putResp.ok, path: safePath };
  });

  const failures = results.filter(r => !r.ok).map(r => r.path);

  return c.json({
    success: true,
    data: {
      repoUrl: repo.html_url,
      cloneUrl: repo.clone_url,
      owner,
      name: repoName,
      failedFiles: failures,
    },
  });
});
