/**
 * Tickets routes
 */

import { eq, desc } from "@magicappdev/database";
import { tickets } from "@magicappdev/database";
import type { AppContext } from "../types.js";
import { Hono } from "hono";

export const ticketsRoutes = new Hono<AppContext>();

// List tickets
ticketsRoutes.get("/", async c => {
  const userId = c.get("userId") as string;
  const db = c.get("db");
  const userRole = c.get("userRole");

  if (userRole === "admin") {
    // Admins see all tickets
    const allTickets = await db.query.tickets.findMany({
      with: {
        user: true,
      },
      orderBy: [desc(tickets.createdAt)],
    });

    // Map to the expected format if needed, or return as is
    const mapped = allTickets.map(t => ({
      id: t.id,
      subject: t.subject,
      status: t.status,
      createdAt: t.createdAt,
      userName: t.user?.name,
      userEmail: t.user?.email,
    }));

    return c.json({ success: true, data: mapped });
  }

  // Users see only their own
  const userTickets = await db.query.tickets.findMany({
    where: eq(tickets.userId, userId),
    orderBy: [desc(tickets.createdAt)],
  });

  return c.json({ success: true, data: userTickets });
});

// Get ticket detail
ticketsRoutes.get("/:id", async c => {
  const userId = c.get("userId") as string;
  const userRole = c.get("userRole");
  const db = c.get("db");
  const ticketId = c.req.param("id");

  const ticket = await db.query.tickets.findFirst({
    where: eq(tickets.id, ticketId),
    with: {
      user: true,
    },
  });

  if (!ticket) {
    return c.json({ error: "Ticket not found" }, 404);
  }

  // Check permission
  if (userRole !== "admin" && ticket.userId !== userId) {
    return c.json({ error: "Forbidden" }, 403);
  }

  const mapped = {
    id: ticket.id,
    userId: ticket.userId,
    subject: ticket.subject,
    message: ticket.message,
    status: ticket.status,
    createdAt: ticket.createdAt,
    updatedAt: ticket.updatedAt,
    userName: ticket.user?.name,
    userEmail: ticket.user?.email,
  };

  return c.json({ success: true, data: mapped });
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
    .where(eq(tickets.id, ticketId))
    .run();

  return c.json({ success: true });
});
