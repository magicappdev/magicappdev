import type { Connection, WSMessage } from "agents";
import { Agent } from "agents";
export interface Env {
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
/**
 * MagicAgent - Stateful AI App Builder
 */
export declare class MagicAgent extends Agent<Env, AgentState> {
  initialState: AgentState;
  onMessage(connection: Connection, message: WSMessage): Promise<void>;
  private handleChat;
}
/**
 * IssueReviewer - Autonomous Repo Maintenance
 */
export declare class IssueReviewer extends Agent<
  Env,
  {
    lastProcessedIssue?: string;
  }
> {
  onRequest(): Promise<Response>;
}
/**
 * FeatureSuggester - Roadmap Generator
 */
export declare class FeatureSuggester extends Agent<
  Env,
  {
    ideas: string[];
  }
> {
  onRequest(request: Request): Promise<Response>;
}
declare const _default: {
  fetch(request: Request, env: Env): Promise<Response>;
};
export default _default;
//# sourceMappingURL=index.d.ts.map
