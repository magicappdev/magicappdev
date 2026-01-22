import { mkdir, readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";

export interface Config {
  accessToken?: string;
  refreshToken?: string;
  apiUrl?: string;
  agentHost?: string;
}

const CONFIG_DIR = join(homedir(), ".magicappdev");
const CONFIG_FILE = join(CONFIG_DIR, "config.json");

export async function saveConfig(config: Partial<Config>): Promise<void> {
  try {
    await mkdir(CONFIG_DIR, { recursive: true });
    let existingConfig: Config = {};
    try {
      const data = await readFile(CONFIG_FILE, "utf-8");
      existingConfig = JSON.parse(data);
    } catch {
      // Ignore if file doesn't exist
    }

    const updatedConfig = { ...existingConfig, ...config };
    await writeFile(CONFIG_FILE, JSON.stringify(updatedConfig, null, 2));
  } catch (error) {
    console.error("Failed to save config:", error);
  }
}

export async function loadConfig(): Promise<Config> {
  try {
    const data = await readFile(CONFIG_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return {};
  }
}

export async function clearConfig(): Promise<void> {
  try {
    await writeFile(CONFIG_FILE, JSON.stringify({}));
  } catch (error) {
    console.error("Failed to clear config:", error);
  }
}
