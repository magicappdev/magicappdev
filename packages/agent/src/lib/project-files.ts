import { and, createDatabase, eq, projectFiles } from "@magicappdev/database";

type Database = ReturnType<typeof createDatabase>;

/**
 * Upsert a project file in D1. Shared by agent tools so file writes stay
 * consistent regardless of which tool path performs them.
 *
 * NOTE: this writes `project_files` only — no `file_history` entry is
 * recorded here (history is written on the API write paths). Restoring
 * agent-side history is tracked as P8 rollback work.
 */
export async function upsertProjectFile(
  db: Database,
  projectId: string,
  path: string,
  content: string,
): Promise<void> {
  const language = path.split(".").pop() || "text";
  const size = content.length;

  const existing = await db.query.projectFiles.findFirst({
    where: and(
      eq(projectFiles.projectId, projectId),
      eq(projectFiles.path, path),
    ),
  });

  if (existing) {
    await db
      .update(projectFiles)
      .set({
        content,
        language,
        size,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(projectFiles.id, existing.id));
    return;
  }

  await db.insert(projectFiles).values({
    id: crypto.randomUUID(),
    projectId,
    path,
    content,
    language,
    size,
  });
}
