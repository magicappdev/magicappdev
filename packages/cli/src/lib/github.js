/**
 * GitHub API client for fetching templates from the magicappdev/templates repo
 */
const TEMPLATES_REPO = "magicappdev/templates";
const GITHUB_RAW_BASE = `https://raw.githubusercontent.com/${TEMPLATES_REPO}/main`;
/** Fetch the template index from GitHub */
export async function fetchTemplateIndex() {
  const url = `${GITHUB_RAW_BASE}/templates/index.json`;
  const response = await fetch(url, {
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) {
    throw new Error(
      `Failed to fetch template index: ${response.status} ${response.statusText}`,
    );
  }
  return response.json();
}
/** Fetch full template definition from GitHub */
export async function fetchTemplate(id) {
  const url = `${GITHUB_RAW_BASE}/templates/${id}/template.json`;
  const response = await fetch(url, {
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) {
    throw new Error(
      `Failed to fetch template "${id}": ${response.status} ${response.statusText}`,
    );
  }
  return response.json();
}
/** Fetch a single file from a template */
export async function fetchTemplateFile(templateId, filePath) {
  const url = `${GITHUB_RAW_BASE}/templates/${templateId}/${filePath}`;
  const response = await fetch(url, {
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) {
    throw new Error(
      `Failed to fetch file "${filePath}" from template "${templateId}": ${response.status}`,
    );
  }
  return response.text();
}
/** Get the cache directory for downloaded templates */
export function getTemplateCacheDir() {
  const home = process.env.HOME || process.env.USERPROFILE || "~";
  return `${home}/.magicappdev/templates`;
}
/** Check if a template is already cached */
export async function isTemplateCached(id) {
  const fs = await import("node:fs/promises");
  const path = await import("node:path");
  const cacheDir = getTemplateCacheDir();
  const templateDir = path.join(cacheDir, id);
  try {
    await fs.access(templateDir);
    return true;
  } catch {
    return false;
  }
}
