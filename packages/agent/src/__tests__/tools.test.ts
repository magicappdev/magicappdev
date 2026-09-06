import {
  AGENT_TOOLS,
  createPendingApproval,
  generateApprovalId,
  getTool,
  getToolsPrompt,
  parseToolCalls,
  requiresApproval,
  type ToolCall,
} from "../tools.js";
import { describe, expect, it, vi } from "vitest";

describe("requiresApproval", () => {
  it("does not require approval for read-only tools", () => {
    expect(requiresApproval("readFile")).toBe(false);
    expect(requiresApproval("listFiles")).toBe(false);
    expect(requiresApproval("searchCode")).toBe(false);
  });

  it("requires approval for mutating tools", () => {
    expect(requiresApproval("writeFile")).toBe(true);
    expect(requiresApproval("deleteFile")).toBe(true);
    expect(requiresApproval("runCommand")).toBe(true);
    expect(requiresApproval("generateComponent")).toBe(true);
    expect(requiresApproval("generateMultiFileProject")).toBe(true);
    expect(requiresApproval("batchWriteFiles")).toBe(true);
    expect(requiresApproval("patchError")).toBe(true);
  });

  it("defaults to requiring approval for unknown tools", () => {
    expect(requiresApproval("doesNotExist")).toBe(true);
  });
});

describe("parseToolCalls", () => {
  it("parses a single flat tool call", () => {
    const calls = parseToolCalls(
      'Let me read it TOOL_CALL:readFile{"path":"src/app.ts"} done',
    );
    expect(calls).toHaveLength(1);
    expect(calls[0].tool).toBe("readFile");
    expect(calls[0].parameters).toEqual({ path: "src/app.ts" });
    expect(calls[0].status).toBe("pending");
    expect(typeof calls[0].id).toBe("string");
  });

  it("parses multiple tool calls in one response", () => {
    const calls = parseToolCalls(
      'TOOL_CALL:readFile{"path":"a.ts"} then TOOL_CALL:readFile{"path":"b.ts"}',
    );
    expect(calls).toHaveLength(2);
    expect(calls.map(c => c.parameters)).toEqual([
      { path: "a.ts" },
      { path: "b.ts" },
    ]);
  });

  it("returns an empty array when there are no tool calls", () => {
    expect(parseToolCalls("Just a normal chat response")).toEqual([]);
  });

  it("skips calls with invalid JSON and warns", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    try {
      const calls = parseToolCalls("TOOL_CALL:readFile{not-json}");
      expect(calls).toEqual([]);
      expect(warn).toHaveBeenCalledOnce();
    } finally {
      warn.mockRestore();
    }
  });

  it("does not support nested JSON objects in parameters", () => {
    // The regex stops at the first closing brace, so nested objects
    // (e.g. generateMultiFileProject variables) fail to parse as a whole.
    // Pinned as a known limitation, not desired behavior.
    const calls = parseToolCalls(
      'TOOL_CALL:generateMultiFileProject{"templateSlug":"x","variables":{"a":1}}',
    );
    expect(calls).toEqual([]);
  });
});

describe("getTool", () => {
  it("returns the definition for a known tool", () => {
    expect(getTool("writeFile")?.requiresApproval).toBe(true);
  });

  it("returns undefined for an unknown tool", () => {
    expect(getTool("nope")).toBeUndefined();
  });
});

describe("getToolsPrompt", () => {
  it("marks approval-gated tools", () => {
    const prompt = getToolsPrompt();
    expect(prompt).toContain("writeFile");
    expect(prompt).toContain("[REQUIRES APPROVAL]");
  });

  it("covers every registered tool", () => {
    const prompt = getToolsPrompt();
    for (const name of Object.keys(AGENT_TOOLS)) {
      expect(prompt).toContain(name);
    }
  });
});

describe("generateApprovalId", () => {
  it("generates unique approval-scoped ids", () => {
    const a = generateApprovalId();
    const b = generateApprovalId();
    expect(a.startsWith("approval_")).toBe(true);
    expect(a).not.toBe(b);
  });
});

describe("createPendingApproval", () => {
  const toolCall: ToolCall = {
    id: "call-1",
    tool: "writeFile",
    parameters: { path: "src/app.ts", content: "hi" },
    status: "pending",
    timestamp: Date.now(),
  };

  it("builds a pending approval from a known tool", () => {
    const approval = createPendingApproval("agent-1", "session-1", toolCall);
    expect(approval.status).toBe("pending");
    expect(approval.agentId).toBe("agent-1");
    expect(approval.sessionId).toBe("session-1");
    expect(approval.tool).toBe("writeFile");
    expect(approval.parameters).toEqual(toolCall.parameters);
    expect(approval.description).toContain("Write or create a file");
  });

  it("falls back to an unknown-tool description", () => {
    const approval = createPendingApproval("agent-1", "session-1", {
      ...toolCall,
      tool: "mystery",
    });
    expect(approval.description).toContain("Unknown tool: mystery");
  });
});
