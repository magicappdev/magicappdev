import { mkdir, readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
const CONFIG_DIR = join(homedir(), ".magicappdev");
const CONFIG_FILE = join(CONFIG_DIR, "config.json");
export async function saveConfig(config) {
  try {
    await mkdir(CONFIG_DIR, { recursive: true });
    let existingConfig = {};
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
export async function loadConfig() {
  try {
    const data = await readFile(CONFIG_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return {};
  }
}
export async function clearConfig() {
  try {
    await writeFile(CONFIG_FILE, JSON.stringify({}));
  } catch (error) {
    console.error("Failed to clear config:", error);
  }
}
