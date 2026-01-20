import type { AiMessage, Project } from "../types/index.js";
export declare class ApiClient {
  private baseUrl;
  constructor(baseUrl: string);
  request<T>(path: string, options?: RequestInit): Promise<T>;
  getProjects(): Promise<Project[]>;
  createProject(data: { name: string; description?: string }): Promise<Project>;
  sendMessage(messages: AiMessage[]): Promise<AiMessage>;
  streamMessage(messages: AiMessage[]): AsyncGenerator<string>;
}
//# sourceMappingURL=client.d.ts.map
