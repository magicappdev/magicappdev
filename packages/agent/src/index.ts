import { registry } from "@magicappdev/templates/registry";
import type { Connection, WSMessage } from "agents";
import { Agent } from "agents";

export interface Env {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  AI: any;
  DB: D1Database;
  MagicAgent: DurableObjectNamespace;
  IssueReviewer: DurableObjectNamespace;
  FeatureSuggester: DurableObjectNamespace;
  MODEL_ID?: string;
}

export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
  timestamp: number;
}

export interface AgentState {
  messages: Message[];
  projectId?: string;
  config: Record<string, unknown>;
  suggestedTemplate?: string;
}

const MODELS = {
  chat: "@cf/meta/llama-3.1-8b-instruct",
  complex: "@cf/meta/llama-3.1-70b-instruct",
  fast: "@cf/mistral/mistral-7b-instruct-v0.2",
  code: "@cf/deepseek-ai/deepseek-coder-33b-instruct",
};

class ModelRouter {
  static route(content: string): keyof typeof MODELS {
    const complexityScore = (
      content.match(/code|function|class|api|database|schema/gi) || []
    ).length;
    if (content.length > 500 || complexityScore > 3) return "complex";
    if (content.match(/write|generate|create/i) && complexityScore > 0)
      return "code";
    if (content.length < 50) return "fast";
    return "chat";
  }
}

/**
 * MagicAgent - Stateful AI App Builder
 */
export class MagicAgent extends Agent<Env, AgentState> {
  initialState: AgentState = {
    messages: [],
    config: {},
  };

  async onMessage(connection: Connection, message: WSMessage) {
    if (typeof message !== "string") return;
    try {
      const data = JSON.parse(message);
      if (data.type === "chat") {
        await this.handleChat(connection, data.content);
      }
    } catch {
      connection.send(
        JSON.stringify({ type: "error", message: "Invalid JSON" }),
      );
    }
  }

  private async handleChat(connection: Connection, content: string) {
    const userMessage: Message = {
      role: "user",
      content,
      timestamp: Date.now(),
    };
    const updatedMessages = [...this.state.messages, userMessage];
    this.setState({ ...this.state, messages: updatedMessages });

    // Determine Model
    const modelKey = ModelRouter.route(content);
    const model = MODELS[modelKey];

    const templates = registry.getMetadata();
    const templateContext = templates
      .map(t => `- ${t.name} (${t.slug}): ${t.description}`)
      .join("\n");

    const systemPrompt = `You are the MagicAppDev assistant, an expert AI App Builder.
You are running on Cloudflare Workers and using ${modelKey} model.

Available templates:
${templateContext}

GOAL: Help the user build their app. 
1. Understand the user's intent.
2. If a template fits, suggest it using "SUGGEST_TEMPLATE: [slug]" in your response.
3. Provide code snippets, architectural advice, and commands using the CLI.
4. Be concise but helpful.

User Request: ${content}`;

    try {
      const stream = await this.env.AI.run(model, {
        messages: [
          { role: "system", content: systemPrompt },
          ...updatedMessages.map(m => ({ role: m.role, content: m.content })),
        ],
        stream: true,
      });

      let assistantContent = "";
      const decoder = new TextDecoder();
      for await (const chunk of stream as any) {
        const text = decoder.decode(chunk);
        const lines = text.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") break;
            try {
              const parsed = JSON.parse(data);
              if (parsed.response) {
                assistantContent += parsed.response;
                connection.send(
                  JSON.stringify({
                    type: "chat_chunk",
                    content: parsed.response,
                  }),
                );
              }
            } catch {
              // Ignore parse errors
            }
          }
        }
      }

      // Extract template suggestion
      const match = assistantContent.match(/SUGGEST_TEMPLATE: ([a-zA-Z0-9-]+)/);
      if (match) {
        this.setState({ ...this.state, suggestedTemplate: match[1] });
      }

      this.setState({
        ...this.state,
        messages: [
          ...this.state.messages,
          {
            role: "assistant",
            content: assistantContent,
            timestamp: Date.now(),
          },
        ],
      });
      connection.send(
        JSON.stringify({
          type: "chat_done",
          suggestedTemplate: this.state.suggestedTemplate,
        }),
      );
    } catch (err: any) {
      connection.send(
        JSON.stringify({ type: "error", message: "AI failed: " + err.message }),
      );
    }
  }
}

/**
 * IssueReviewer - Autonomous Repo Maintenance
 */
export class IssueReviewer extends Agent<Env, { lastProcessedIssue?: string }> {
  async onRequest(): Promise<Response> {
    // const { issue } = await request.json() as any;
    // Analysis logic here...
    return Response.json({
      status: "reviewed",
      suggestions: ["Add more tests", "Refactor auth"],
    });
  }
}

/**
 * FeatureSuggester - Roadmap Generator
 */
export class FeatureSuggester extends Agent<Env, { ideas: string[] }> {
  async onRequest(request: Request): Promise<Response> {
    const { context } = (await request.json().catch(() => ({}))) as {
      context?: string;
    };

    const systemPrompt = `You are a product manager expert.
Generate 3-5 high-impact feature suggestions for a software project.
Context: ${context || "A fullstack app builder platform"}
Output JSON format: { "suggestions": ["Idea 1", "Idea 2"] }`;

    try {
      const response = await this.env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
        messages: [{ role: "system", content: systemPrompt }],
        response_format: { type: "json_object" },
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = (response as any).response
        ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
          JSON.parse((response as any).response)
        : response;

      return Response.json(result);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An error occurred";
      return Response.json(
        { error: "AI failed", details: message },
        { status: 500 },
      );
    }
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path.startsWith("/api/agent/")) {
      const id = path.split("/")[3] || "default";
      return env.MagicAgent.get(env.MagicAgent.idFromName(id)).fetch(request);
    }
    if (path.startsWith("/api/reviewer/")) {
      return env.IssueReviewer.get(
        env.IssueReviewer.idFromName("global"),
      ).fetch(request);
    }
    if (path.startsWith("/api/suggester/")) {
      return env.FeatureSuggester.get(
        env.FeatureSuggester.idFromName("global"),
      ).fetch(request);
    }

    return new Response("MagicAppDev Agents Worker", { status: 200 });
  },
};
