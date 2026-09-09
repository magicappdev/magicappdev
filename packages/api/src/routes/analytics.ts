/**
 * Analytics routes
 */

import { analyticsEvents, count, eq } from "@magicappdev/database";
import { authMiddleware } from "../middlewares/auth.js";
import type { AppContext } from "../types.js";
import { Hono } from "hono";

export const analyticsRoutes = new Hono<AppContext>();

// Track an analytics event
analyticsRoutes.post("/", authMiddleware, async c => {
  const userId = c.get("userId") as string | undefined;
  const body = await c.req.json<{
    event: string;
    category: string;
    properties?: Record<string, unknown>;
  }>();

  if (!body.event || !body.category) {
    return c.json({ error: "Missing required fields: event, category" }, 400);
  }

  try {
    const db = c.get("db");

    await db.insert(analyticsEvents).values({
      event: body.event,
      category: body.category,
      userId: userId || null,
      properties: body.properties ? JSON.stringify(body.properties) : null,
    });

    return c.json({ success: true });
  } catch (err) {
    console.error("Failed to track analytics event:", err);
    return c.json({ error: "Failed to track event" }, 500);
  }
});

// Get analytics summary (admin only)
analyticsRoutes.get("/summary", async c => {
  const userRole = c.get("userRole");
  const db = c.get("db");

  if (userRole !== "admin") {
    return c.json({ error: "Forbidden" }, 403);
  }

  try {
    const totalEventsResult = await db
      .select({ value: count() })
      .from(analyticsEvents)
      .get();

    const totalEvents = totalEventsResult?.value || 0;

    const onboardingCompleteResult = await db
      .select({ value: count() })
      .from(analyticsEvents)
      .where(eq(analyticsEvents.event, "onboarding_complete"))
      .get();

    const onboardingComplete = onboardingCompleteResult?.value || 0;

    const onboardingSkippedResult = await db
      .select({ value: count() })
      .from(analyticsEvents)
      .where(eq(analyticsEvents.event, "onboarding_skip"))
      .get();

    const onboardingSkipped = onboardingSkippedResult?.value || 0;

    return c.json({
      success: true,
      data: {
        totalEvents,
        onboarding: {
          complete: onboardingComplete,
          skipped: onboardingSkipped,
          completionRate:
            totalEvents > 0 ? (onboardingComplete / totalEvents) * 100 : 0,
        },
      },
    });
  } catch (err) {
    console.error("Failed to fetch analytics summary:", err);
    return c.json({ error: "Failed to fetch analytics" }, 500);
  }
});
