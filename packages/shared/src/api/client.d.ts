import type { AiMessage, Project, User } from "../types/index.js";
export declare class ApiClient {
  private baseUrl;
  private accessToken;
  constructor(baseUrl: string);
  setToken(token: string | null): void;
  request<T>(path: string, options?: RequestInit): Promise<T>;
  getGitHubLoginUrl(platform?: "web" | "mobile"): string;
  logout(refreshToken: string): Promise<void>;
  refresh(refreshToken: string): Promise<string>;
  getCurrentUser(): Promise<User>;
  getProjects(): Promise<Project[]>;
  createProject(data: { name: string; description?: string }): Promise<Project>;
  sendMessage(messages: AiMessage[]): Promise<AiMessage>;
  streamMessage(messages: AiMessage[]): AsyncGenerator<string>;
}
//# sourceMappingURL=client.d.ts.map
