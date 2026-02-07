/**
 * Chat Context routes
 *
 * Provides endpoints for managing chat sessions linked to projects
 * with full context including files, errors, and commands
 */

import {
  chatSessions,
  chatMessages,
  projectFiles,
  projectErrors,
  projectCommands,
  type NewChatSession,
  type NewChatMessage,
} from "@magicappdev/database";
import { eq, desc } from "@magicappdev/database";
import type { AppContext } from "../types.js";
import { Hono } from "hono";

export const chatContextRoutes = new Hono<AppContext>();

// Create a new chat session
chatContextRoutes.post("/sessions", async c => {
  const body = await c.req.json<{
    projectId?: string;
    title?: string;
  }>();
  const db = c.var.db;
  const userId = c.var.userId;

  if (!userId) {
    return c.json(
      {
        success: false,
        error: { code: "UNAUTHORIZED", message: "User not authenticated" },
      },
      401,
    );
  }

  const sessionId = crypto.randomUUID();
  const title = body.title || "New Chat Session";

  const newSession = await db
    .insert(chatSessions)
    .values({
      id: sessionId,
      userId,
      projectId: body.projectId || null,
      title,
    } satisfies NewChatSession)
    .returning()
    .get();

  return c.json(
    {
      success: true,
      data: newSession,
    },
    201,
  );
});

// Get chat session with messages
chatContextRoutes.get("/sessions/:id", async c => {
  const sessionId = c.req.param("id");
  const db = c.var.db;

  const session = await db.query.chatSessions.findFirst({
    where: eq(chatSessions.id, sessionId),
  });

  if (!session) {
    return c.json(
      {
        success: false,
        error: { code: "NOT_FOUND", message: "Session not found" },
      },
      404,
    );
  }

  const messages = await db.query.chatMessages.findMany({
    where: eq(chatMessages.sessionId, sessionId),
    orderBy: [chatMessages.timestamp],
  });

  return c.json({
    success: true,
    data: {
      session,
      messages,
    },
  });
});

// List user's chat sessions
chatContextRoutes.get("/sessions", async c => {
  const db = c.var.db;
  const userId = c.var.userId;

  if (!userId) {
    return c.json(
      {
        success: false,
        error: { code: "UNAUTHORIZED", message: "User not authenticated" },
      },
      401,
    );
  }

  const sessions = await db.query.chatSessions.findMany({
    where: eq(chatSessions.userId, userId),
    orderBy: [desc(chatSessions.updatedAt)],
  });

  return c.json({
    success: true,
    data: sessions,
  });
});

// Get project context for AI (files, errors, commands)
chatContextRoutes.get("/sessions/:id/context", async c => {
  const sessionId = c.req.param("id");
  const db = c.var.db;

  const session = await db.query.chatSessions.findFirst({
    where: eq(chatSessions.id, sessionId),
  });

  if (!session) {
    return c.json(
      {
        success: false,
        error: { code: "NOT_FOUND", message: "Session not found" },
      },
      404,
    );
  }

  const context: {
    files: (typeof projectFiles.$inferSelect)[];
    errors: (typeof projectErrors.$inferSelect)[];
    commands: (typeof projectCommands.$inferSelect)[];
    unresolvedErrors: number;
  } = {
    files: [],
    errors: [],
    commands: [],
    unresolvedErrors: 0,
  };

  if (session.projectId) {
    // Get project files
    context.files = await db.query.projectFiles.findMany({
      where: eq(projectFiles.projectId, session.projectId),
    });

    // Get project errors
    context.errors = await db.query.projectErrors.findMany({
      where: eq(projectErrors.projectId, session.projectId),
      orderBy: [desc(projectErrors.occurredAt)],
    });

    // Count unresolved errors
    context.unresolvedErrors = context.errors.filter(
      (e: typeof projectErrors.$inferSelect) => !e.resolved,
    ).length;

    // Get recent commands
    context.commands = await db.query.projectCommands.findMany({
      where: eq(projectCommands.projectId, session.projectId),
      orderBy: [desc(projectCommands.executedAt)],
      limit: 10,
    });
  }

  return c.json({
    success: true,
    data: context,
  });
});

// Add message to session
chatContextRoutes.post("/sessions/:id/message", async c => {
  const sessionId = c.req.param("id");
  const body = await c.req.json<{
    role: "user" | "assistant" | "system";
    content: string;
  }>();
  const db = c.var.db;

  const session = await db.query.chatSessions.findFirst({
    where: eq(chatSessions.id, sessionId),
  });

  if (!session) {
    return c.json(
      {
        success: false,
        error: { code: "NOT_FOUND", message: "Session not found" },
      },
      404,
    );
  }

  const message = await db
    .insert(chatMessages)
    .values({
      id: crypto.randomUUID(),
      sessionId,
      role: body.role,
      content: body.content,
    } satisfies NewChatMessage)
    .returning()
    .get();

  // Update session timestamp
  await db
    .update(chatSessions)
    .set({
      updatedAt: new Date().toISOString(),
    })
    .where(eq(chatSessions.id, sessionId))
    .run();

  return c.json(
    {
      success: true,
      data: message,
    },
    201,
  );
});

// Update session (e.g., link to project, change title)
chatContextRoutes.patch("/sessions/:id", async c => {
  const sessionId = c.req.param("id");
  const body = await c.req.json<{
    projectId?: string | null;
    title?: string;
  }>();
  const db = c.var.db;

  const existing = await db.query.chatSessions.findFirst({
    where: eq(chatSessions.id, sessionId),
  });

  if (!existing) {
    return c.json(
      {
        success: false,
        error: { code: "NOT_FOUND", message: "Session not found" },
      },
      404,
    );
  }

  const updatedSession = await db
    .update(chatSessions)
    .set({
      ...(body.projectId !== undefined && { projectId: body.projectId }),
      ...(body.title && { title: body.title }),
      updatedAt: new Date().toISOString(),
    })
    .where(eq(chatSessions.id, sessionId))
    .returning()
    .get();

  return c.json({
    success: true,
    data: updatedSession,
  });
});

// Delete session
chatContextRoutes.delete("/sessions/:id", async c => {
  const sessionId = c.req.param("id");
  const db = c.var.db;

  const result = await db
    .delete(chatSessions)
    .where(eq(chatSessions.id, sessionId))
    .returning()
    .get();

  if (!result) {
    return c.json(
      {
        success: false,
        error: { code: "NOT_FOUND", message: "Session not found" },
      },
      404,
    );
  }

  return c.json({
    success: true,
    data: { id: sessionId },
  });
});
