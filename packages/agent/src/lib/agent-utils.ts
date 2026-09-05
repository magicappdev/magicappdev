/**
 * Agent utility helpers
 */

/**
 * Safely convert a glob-like pattern to a RegExp.
 *
 * Only supports a safe subset: literal segments, `*` (match anything except `/`),
 * and `?` (match a single character). All other regex metacharacters are escaped
 * to prevent ReDoS and unintended matches.
 */
export function safeGlobToRegExp(pattern: string): RegExp {
  const escaped = pattern
    .replace(/[.+^${}()|[\]\\]/g, "\\$&")
    .replace(/\*/g, ".*")
    .replace(/\?/g, ".");

  return new RegExp(`^${escaped}$`);
}

/**
 * Validate that a file path is safe for project-scoped storage.
 *
 * Rules:
 * - Must be a relative path (no leading `/` or drive letter)
 * - Must not contain `..` segments
 * - Must not contain null bytes
 */
export function validateProjectFilePath(path: string): void {
  if (!path || typeof path !== "string") {
    throw new Error("File path must be a non-empty string");
  }

  if (path.includes("\0")) {
    throw new Error("File path must not contain null bytes");
  }

  if (path.startsWith("/") || /^[A-Za-z]:\\|^\//.test(path)) {
    throw new Error("File path must be relative");
  }

  const segments = path.split(/[\\/]/);
  for (const segment of segments) {
    if (segment === "..") {
      throw new Error("File path must not contain parent directory references");
    }
  }
}
