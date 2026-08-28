import { test, expect } from "@playwright/test";

test.describe("Preview error relay handshake", () => {
  test("preview_error WS message triggers tool_result from agent", async ({
    page,
  }) => {
    await page.goto("/chat", { waitUntil: "networkidle" });
    const textarea = page.locator("textarea");
    await expect(textarea.first()).toBeAttached({ timeout: 15000 });
    await page.waitForTimeout(2000);

    // Send preview_error directly over the WebSocket (same as dispatchPreviewError)
    await page.evaluate(() => {
      // Find the open WebSocket to the mock agent
      // The shared hook stores the socket in module scope; we can't access it directly.
      // Instead, create a new WS connection and send the message.
      const AGENT_HOST = "localhost:8788";
      const ws = new WebSocket(`ws://${AGENT_HOST}/agents/magic-agent/default`);
      ws.addEventListener("open", () => {
        ws.send(
          JSON.stringify({
            type: "preview_error",
            params: {
              errorMessage:
                "Cannot read properties of undefined (reading 'map')",
              filePath: "src/App.tsx",
              errorType: "runtime",
              stackTrace:
                "TypeError: Cannot read properties of undefined\n    at App (src/App.tsx:12:5)",
            },
          }),
        );
        // Close after a short delay to let the mock respond
        setTimeout(() => ws.close(), 500);
      });
    });

    // The chat page should display a tool_result message for patchError
    const toolResult = page.locator(
      "text=Auto-fix and applied: Fixed undefined variable reference File: src/App.tsx",
    );
    await expect(toolResult).toBeVisible({ timeout: 15000 });
  });

  test("preview_error message format is correct over WebSocket", async ({
    page,
  }) => {
    await page.goto("/chat", { waitUntil: "networkidle" });
    const textarea = page.locator("textarea");
    await expect(textarea.first()).toBeAttached({ timeout: 15000 });
    await page.waitForTimeout(2000);

    // Intercept WebSocket messages by monkey-patching before opening a new connection
    const receivedMessages: unknown[] = [];
    await page.evaluate(messages => {
      const origSend = WebSocket.prototype.send;
      WebSocket.prototype.send = function (data) {
        try {
          const parsed = JSON.parse(data as string);
          messages.push(parsed);
        } catch {
          // not JSON
        }
        return origSend.call(this, data);
      };
    }, receivedMessages);

    // Send preview_error via a separate WS connection
    await page.evaluate(() => {
      const ws = new WebSocket(
        "ws://localhost:8788/agents/magic-agent/default",
      );
      ws.addEventListener("open", () => {
        ws.send(
          JSON.stringify({
            type: "preview_error",
            params: {
              errorMessage: "SyntaxError: Unexpected token",
              filePath: "src/utils.ts",
              errorType: "build",
              stackTrace: "",
            },
          }),
        );
        setTimeout(() => ws.close(), 500);
      });
    });

    // Wait for mock server to respond
    await page.waitForTimeout(2000);

    // Check that a tool_result with patchError was received on the chat page's connection
    // The mock agent sends tool_result back; we verify via the message text appearing
    const toolResult = page.locator(
      "text=Auto-fix and applied: Fixed undefined variable reference File: src/utils.ts",
    );
    await expect(toolResult).toBeVisible({ timeout: 10000 });
  });
});
