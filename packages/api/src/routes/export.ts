/**
 * Export/Clone routes
 *
 * Provides endpoints for exporting projects from the database
 * for use with CLI clone command
 */

import {
  projects,
  projectFiles,
  projectCommands,
  projectErrors,
} from "@magicappdev/database";
import type { AppContext } from "../types.js";
import { eq } from "drizzle-orm";
import { Hono } from "hono";

export const exportRoutes = new Hono<AppContext>();

/**
 * Export a project as JSON structure
 * Compatible with CLI clone command
 */
exportRoutes.get("/:id/export", async c => {
  const projectId = c.req.param("id");
  const userId = c.var.userId;
  const userRole = c.var.userRole;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = c.var.db as any;

  // Get project details
  const project = await db.query.projects.findFirst({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    where: eq((projects as any).id, projectId),
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

  // Check ownership
  if (userRole !== "admin" && project.userId !== userId) {
    return c.json(
      {
        success: false,
        error: { code: "FORBIDDEN", message: "Forbidden" },
      },
      403,
    );
  }

  // Get all project files
  const files = await db.query.projectFiles.findMany({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    where: eq((projectFiles as any).projectId, projectId),
  });

  // Get project commands
  const commands = await db.query.projectCommands.findMany({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    where: eq((projectCommands as any).projectId, projectId),
  });

  // Get project errors
  const errors = await db.query.projectErrors.findMany({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    where: eq((projectErrors as any).projectId, projectId),
  });

  // Build export structure
  const exportData = {
    version: "1.0.0",
    exportedAt: new Date().toISOString(),
    project: {
      id: project.id,
      name: project.name,
      slug: project.slug,
      description: project.description,
      status: project.status,
      framework: project.framework,
      config: project.config,
      githubUrl: project.githubUrl,
      deploymentUrl: project.deploymentUrl,
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    },
    files: files.map((f: typeof projectFiles.$inferSelect) => ({
      path: f.path,
      content: f.content,
      language: f.language,
      size: f.size,
      createdAt: f.createdAt,
      updatedAt: f.updatedAt,
    })),
    metadata: {
      fileCount: files.length,
      totalSize: files.reduce(
        (acc: number, f: typeof projectFiles.$inferSelect) => acc + f.size,
        0,
      ),
      commandCount: commands.length,
      errorCount: errors.length,
      unresolvedErrorCount: errors.filter(
        (e: typeof projectErrors.$inferSelect) => !e.resolved,
      ).length,
    },
    commands: commands.map((cmd: typeof projectCommands.$inferSelect) => ({
      command: cmd.command,
      exitCode: cmd.exitCode,
      output: cmd.output,
      error: cmd.error,
      executedAt: cmd.executedAt,
    })),
    errors: errors.map((err: typeof projectErrors.$inferSelect) => ({
      errorType: err.errorType,
      message: err.message,
      stackTrace: err.stackTrace,
      filePath: err.filePath,
      lineNumber: err.lineNumber,
      occurredAt: err.occurredAt,
      resolved: err.resolved,
    })),
  };

  return c.json({
    success: true,
    data: exportData,
  });
});

/**
 * Get minimal export (just files) for quick clone
 */
exportRoutes.get("/:id/export/minimal", async c => {
  const projectId = c.req.param("id");
  const userId = c.var.userId;
  const userRole = c.var.userRole;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = c.var.db as any;

  const project = await db.query.projects.findFirst({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    where: eq((projects as any).id, projectId),
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

  // Check ownership
  if (userRole !== "admin" && project.userId !== userId) {
    return c.json(
      {
        success: false,
        error: { code: "FORBIDDEN", message: "Forbidden" },
      },
      403,
    );
  }

  const files = await db.query.projectFiles.findMany({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    where: eq((projectFiles as any).projectId, projectId),
  });

  const exportData = {
    name: project.name,
    framework: project.framework,
    files: files.map((f: typeof projectFiles.$inferSelect) => ({
      path: f.path,
      content: f.content,
    })),
  };

  return c.json({
    success: true,
    data: exportData,
  });
});

/**
 * List available projects for clone
 * Returns public projects or user's own projects
 */
exportRoutes.get("/export/list", async c => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = c.var.db as any;
  const userId = c.var.userId;
  const userRole = c.var.userRole;

  // List user's own projects (or all projects for admin)
  const projects_list = await db.query.projects.findMany({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    orderBy: [(projects as any).updatedAt],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    where: userRole === "admin" ? undefined : eq((projects as any).userId, userId),
  });

  // Get file counts for each project
  const projectsWithCounts = await Promise.all(
    projects_list.map(async (p: typeof projects.$inferSelect) => {
      const files = await db.query.projectFiles.findMany({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        where: eq((projectFiles as any).projectId, p.id),
      });

      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        framework: p.framework,
        status: p.status,
        fileCount: files.length,
        updatedAt: p.updatedAt,
      };
    }),
  );

  return c.json({
    success: true,
    data: projectsWithCounts,
  });
});
