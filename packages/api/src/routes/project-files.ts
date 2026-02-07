/**
 * Project Files routes
 *
 * Provides CRUD operations for project files stored in D1
 */

import {
  projects,
  projectFiles,
  fileHistory,
  type ProjectFile,
  type NewProjectFile,
  type NewFileHistory,
} from "@magicappdev/database";
import type { AppContext } from "../types.js";
import { eq, and, desc } from "drizzle-orm";
import { Hono, type Context } from "hono";

export const projectFilesRoutes = new Hono<AppContext>();

// Helper to detect language from file path
function detectLanguage(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase();
  const languageMap: Record<string, string> = {
    ts: "typescript",
    tsx: "typescript",
    js: "javascript",
    jsx: "javascript",
    json: "json",
    md: "markdown",
    css: "css",
    html: "html",
    xml: "xml",
    java: "java",
    kt: "kotlin",
    swift: "swift",
    py: "python",
    rb: "ruby",
    go: "go",
    rs: "rust",
    cpp: "cpp",
    c: "c",
    h: "c",
    yaml: "yaml",
    yml: "yaml",
    toml: "toml",
    sh: "shell",
    sql: "sql",
  };
  return languageMap[ext || ""] || "text";
}

/**
 * Verify project ownership
 * Returns the project if owned/admin, otherwise throws or returns null
 */
async function verifyProjectAccess(c: Context<AppContext>, projectId: string) {
  const db = c.var.db;
  const userId = c.var.userId;
  const userRole = c.var.userRole;

  const project = await db.query.projects.findFirst({
    where: eq(projects.id, projectId),
  });

  if (!project) return null;

  if (userRole !== "admin" && project.userId !== userId) {
    return "FORBIDDEN";
  }

  return project;
}

// List all files for a project
projectFilesRoutes.get("/:projectId/files", async c => {
  const projectId = c.req.param("projectId");
  const db = c.var.db;

  const access = await verifyProjectAccess(c, projectId);
  if (!access) return c.json({ error: "Project not found" }, 404);
  if (access === "FORBIDDEN") return c.json({ error: "Forbidden" }, 403);

  const results = await db.query.projectFiles.findMany({
    where: eq(projectFiles.projectId, projectId),
    orderBy: [projectFiles.path],
  });

  return c.json({
    success: true,
    data: results,
  });
});

// Get specific file
projectFilesRoutes.get("/:projectId/files/*", async c => {
  const projectId = c.req.param("projectId");
  const path = c.req.param("*");
  const db = c.var.db;

  const access = await verifyProjectAccess(c, projectId);
  if (!access) return c.json({ error: "Project not found" }, 404);
  if (access === "FORBIDDEN") return c.json({ error: "Forbidden" }, 403);

  if (!path) {
    return c.json(
      {
        success: false,
        error: { code: "BAD_REQUEST", message: "path is required" },
      },
      400,
    );
  }

  const file = await db.query.projectFiles.findFirst({
    where: and(
      eq(projectFiles.projectId, projectId),
      eq(projectFiles.path, path),
    ),
  });

  if (!file) {
    return c.json(
      {
        success: false,
        error: { code: "NOT_FOUND", message: "File not found" },
      },
      404,
    );
  }

  return c.json({
    success: true,
    data: file,
  });
});

// Get file history
projectFilesRoutes.get("/:projectId/files/*/history", async c => {
  const projectId = c.req.param("projectId");
  const path = c.req.param("*");
  const db = c.var.db;

  const access = await verifyProjectAccess(c, projectId);
  if (!access) return c.json({ error: "Project not found" }, 404);
  if (access === "FORBIDDEN") return c.json({ error: "Forbidden" }, 403);

  if (!path) {
    return c.json(
      {
        success: false,
        error: { code: "BAD_REQUEST", message: "path is required" },
      },
      400,
    );
  }

  // First get the file
  const file = await db.query.projectFiles.findFirst({
    where: and(
      eq(projectFiles.projectId, projectId),
      eq(projectFiles.path, path),
    ),
  });

  if (!file) {
    return c.json(
      {
        success: false,
        error: { code: "NOT_FOUND", message: "File not found" },
      },
      404,
    );
  }

  // Get history
  const history = await db.query.fileHistory.findMany({
    where: eq(fileHistory.fileId, file.id),
    orderBy: [desc(fileHistory.changedAt)],
  });

  return c.json({
    success: true,
    data: history,
  });
});

// Create or update file
projectFilesRoutes.post("/:projectId/files", async c => {
  const projectId = c.req.param("projectId");
  const body = await c.req.json<{
    path: string;
    content: string;
    language?: string;
  }>();
  const db = c.var.db;
  const userId = c.var.userId || "system";

  const access = await verifyProjectAccess(c, projectId);
  if (!access) return c.json({ error: "Project not found" }, 404);
  if (access === "FORBIDDEN") return c.json({ error: "Forbidden" }, 403);

  if (!body.path || body.content === undefined) {
    return c.json(
      {
        success: false,
        error: {
          code: "BAD_REQUEST",
          message: "path and content are required",
        },
      },
      400,
    );
  }

  // Check if file exists
  const existing = await db.query.projectFiles.findFirst({
    where: and(
      eq(projectFiles.projectId, projectId),
      eq(projectFiles.path, body.path),
    ),
  });

  const language = body.language || detectLanguage(body.path);
  const size = body.content.length;

  if (existing) {
    // Update existing file
    const updatedFile = await db
      .update(projectFiles)
      .set({
        content: body.content,
        language,
        size,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(projectFiles.id, existing.id))
      .returning()
      .get();

    // Create history entry
    await db.insert(fileHistory).values({
      id: crypto.randomUUID(),
      fileId: existing.id,
      content: body.content,
      changeType: "updated",
      changedBy: userId,
    } satisfies NewFileHistory);

    return c.json({
      success: true,
      data: updatedFile,
    });
  }

  // Create new file
  const fileId = crypto.randomUUID();
  const newFile = await db
    .insert(projectFiles)
    .values({
      id: fileId,
      projectId,
      path: body.path,
      content: body.content,
      language,
      size,
    } satisfies NewProjectFile)
    .returning()
    .get();

  // Create history entry
  await db.insert(fileHistory).values({
    id: crypto.randomUUID(),
    fileId,
    content: body.content,
    changeType: "created",
    changedBy: userId,
  } satisfies NewFileHistory);

  return c.json(
    {
      success: true,
      data: newFile,
    },
    201,
  );
});

// Delete file
projectFilesRoutes.delete("/:projectId/files/*", async c => {
  const projectId = c.req.param("projectId");
  const path = c.req.param("*");
  const db = c.var.db;
  const userId = c.var.userId || "system";

  const access = await verifyProjectAccess(c, projectId);
  if (!access) return c.json({ error: "Project not found" }, 404);
  if (access === "FORBIDDEN") return c.json({ error: "Forbidden" }, 403);

  if (!path) {
    return c.json(
      {
        success: false,
        error: { code: "BAD_REQUEST", message: "path is required" },
      },
      400,
    );
  }

  const existing = await db.query.projectFiles.findFirst({
    where: and(
      eq(projectFiles.projectId, projectId),
      eq(projectFiles.path, path),
    ),
  });

  if (!existing) {
    return c.json(
      {
        success: false,
        error: { code: "NOT_FOUND", message: "File not found" },
      },
      404,
    );
  }

  // Create history entry before deleting
  await db.insert(fileHistory).values({
    id: crypto.randomUUID(),
    fileId: existing.id,
    content: existing.content,
    changeType: "deleted",
    changedBy: userId,
  } satisfies NewFileHistory);

  // Delete file (history entries are cascade deleted)
  await db.delete(projectFiles).where(eq(projectFiles.id, existing.id)).run();

  return c.json({
    success: true,
    data: { path },
  });
});

// Bulk create/update files
projectFilesRoutes.post("/:projectId/files/bulk", async c => {
  const projectId = c.req.param("projectId");
  const body = await c.req.json<{
    files: Array<{ path: string; content: string; language?: string }>;
  }>();
  const db = c.var.db;
  const userId = c.var.userId || "system";

  const access = await verifyProjectAccess(c, projectId);
  if (!access) return c.json({ error: "Project not found" }, 404);
  if (access === "FORBIDDEN") return c.json({ error: "Forbidden" }, 403);

  const results: ProjectFile[] = [];

  for (const fileData of body.files) {
    const language = fileData.language || detectLanguage(fileData.path);
    const size = fileData.content.length;

    const existing = await db.query.projectFiles.findFirst({
      where: and(
        eq(projectFiles.projectId, projectId),
        eq(projectFiles.path, fileData.path),
      ),
    });

    if (existing) {
      const updated = await db
        .update(projectFiles)
        .set({
          content: fileData.content,
          language,
          size,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(projectFiles.id, existing.id))
        .returning()
        .get();

      await db.insert(fileHistory).values({
        id: crypto.randomUUID(),
        fileId: existing.id,
        content: fileData.content,
        changeType: "updated",
        changedBy: userId,
      } satisfies NewFileHistory);

      results.push(updated);
    } else {
      const fileId = crypto.randomUUID();
      const created = await db
        .insert(projectFiles)
        .values({
          id: fileId,
          projectId,
          path: fileData.path,
          content: fileData.content,
          language,
          size,
        } satisfies NewProjectFile)
        .returning()
        .get();

      await db.insert(fileHistory).values({
        id: crypto.randomUUID(),
        fileId,
        content: fileData.content,
        changeType: "created",
        changedBy: userId,
      } satisfies NewFileHistory);

      results.push(created);
    }
  }

  return c.json({
    success: true,
    data: results,
  });
});
