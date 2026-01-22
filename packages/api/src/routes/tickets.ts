/**
 * Tickets routes
 */

import { tickets, users } from "@magicappdev/database";
import type { AppContext } from "../types.js";
import { eq, desc } from "drizzle-orm";
import { Hono } from "hono";

export const ticketsRoutes = new Hono<AppContext>();

// List tickets
ticketsRoutes.get("/", async c => {
  const userId = c.get("userId") as string;
  const db = c.get("db");
  const userRole = c.get("userRole");

  if (userRole === "admin") {
    // Admins see all tickets
    const allTickets = await db
      .select({
        id: tickets.id,
        subject: tickets.subject,
        status: tickets.status,
        createdAt: tickets.createdAt,
        userName: users.name,
        userEmail: users.email,
      })
      .from(tickets)
      .innerJoin(users, eq(tickets.userId, users.id))
      .orderBy(desc(tickets.createdAt))
      .all();
    return c.json({ success: true, data: allTickets });
  }

  // Users see only their own
  const userTickets = await db
    .select()
    .from(tickets)
    .where(eq(tickets.userId, userId))
    .orderBy(desc(tickets.createdAt))
    .all();

  return c.json({ success: true, data: userTickets });
});

// Create ticket
ticketsRoutes.post("/", async c => {
  const userId = c.get("userId") as string;
  const db = c.get("db");
  const { subject, message } = await c.req.json();

  if (!subject || !message) {
    return c.json({ error: "Subject and message are required" }, 400);
  }

  const id = crypto.randomUUID();
  await db.insert(tickets).values({
    id,
    userId,
    subject,
    message,
    status: "open",
  });

  return c.json({ success: true, data: { id } });
});

// Update ticket status (Admin only)
ticketsRoutes.patch("/:id", async c => {
  const userRole = c.get("userRole");
  const db = c.get("db");
  const ticketId = c.req.param("id");
  const { status } = await c.req.json();

  if (userRole !== "admin") {
    return c.json({ error: "Forbidden" }, 403);
  }

  await db
    .update(tickets)
    .set({ status, updatedAt: new Date().toISOString() })
    .where(eq(tickets.id, ticketId));

  return c.json({ success: true });
});
