/**
 * GitHub-based template generator
 * Downloads templates from GitHub repository and replaces comments
 */

import * as fs from "node:fs/promises";
import * as path from "node:path";

interface GitHubTemplateFile {
  path: string;
  repo: string;
  branch: string;
}

interface GitHubTemplate {
  id: string;
  name: string;
  slug: string;
  description: string;
  version: string;
  category: string;
  frameworks: string[];
  files: GitHubTemplateFile[];
  variables: {
    name: string;
    type: string;
    default?: string | boolean | number;
  }[];
}

/** Download a file from GitHub */
async function downloadGitHubFile(
  repo: string,
  branch: string,
  filePath: string,
): Promise<string> {
  const url = `https://raw.githubusercontent.com/${repo}/${branch}/${filePath}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download ${url}: ${response.statusText}`);
  }
  return await response.text();
}

/** Replace comment placeholders in template content */
function replacePlaceholders(
  content: string,
  variables: Record<string, unknown>,
): string {
  let result = content;

  // Replace {{variableName}} patterns
  result = result.replace(/\{\{(.*?)\}\}/g, (_, variableName) => {
    const value = variables[variableName.trim()];
    return value !== undefined ? String(value) : `/* {{${variableName}}} */`;
  });

  return result;
}

/** Download and generate project from GitHub template */
export async function downloadAndGenerateProject(
  template: GitHubTemplate,
  outputDir: string,
  variables: Record<string, unknown>,
): Promise<void> {
  // Create output directory
  await fs.mkdir(outputDir, { recursive: true });

  // Download and create each file
  for (const file of template.files) {
    const fullContent = await downloadGitHubFile(
      file.repo,
      file.branch,
      file.path,
    );

    // Replace placeholders
    const finalContent = replacePlaceholders(fullContent, variables);

    const outputPath = path.join(outputDir, file.path);

    // Security: Ensure the output path is within the output directory (prevent traversal)
    const relative = path.relative(outputDir, outputPath);
    if (relative.startsWith("..") || path.isAbsolute(relative)) {
      throw new Error(
        `Security violation: Invalid template file path ${file.path}`,
      );
    }

    const outputDirPath = path.dirname(outputPath);

    // Create parent directories if they don't exist
    await fs.mkdir(outputDirPath, { recursive: true });

    // Write the file
    await fs.writeFile(outputPath, finalContent, "utf-8");
  }
}

/** List available templates from GitHub repository */
export async function listGitHubTemplates(repo: string, branch: string) {
  const url = `https://api.github.com/repos/${repo}/git/trees/${branch}?recursive=1`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to list templates: ${response.statusText}`);
  }

  const data = await response.json();

  // Filter for template files (e.g., files starting with "templates/")
  const templateFiles = data.tree
    .filter(
      (file: { type: string; path: string }) =>
        file.type === "blob" && file.path.startsWith("templates/"),
    )
    .map((file: { type: string; path: string; sha: string; url: string }) => ({
      path: file.path,
      sha: file.sha,
      url: file.url,
    }));

  return templateFiles;
}

/** Get template metadata from GitHub */
export async function getGitHubTemplateMetadata(
  _repo: string,
  _branch: string,
): Promise<GitHubTemplate[]> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const repo = _repo;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const branch = _branch;

  // This would fetch template metadata files from the GitHub repo
  // For now, return empty array - would need template metadata files in repo
  return [];
}
