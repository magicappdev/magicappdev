export interface Config {
  accessToken?: string;
  refreshToken?: string;
  apiUrl?: string;
  agentHost?: string;
}
export declare function saveConfig(config: Partial<Config>): Promise<void>;
export declare function loadConfig(): Promise<Config>;
export declare function clearConfig(): Promise<void>;
//# sourceMappingURL=config.d.ts.map
