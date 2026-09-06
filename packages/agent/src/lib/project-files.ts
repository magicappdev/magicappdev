import {
  and,
  createDatabase,
  eq,
  fileHistory,
  projectFiles,
  type NewFileHistory,
} from "@magicappdev/database";

type Database = ReturnType<typeof createDatabase>;

/**
 * Upsert a project file in D1. Shared by agent tools so file writes stay
 * consistent regardless of which tool path performs them.
 *
 * Every write appends a `file_history` entry (`created` / `updated`), matching
 * the API write paths, so agent-made changes are restorable via rollback.
 */
export async function upsertProjectFile(
  db: Database,
  projectId: string,
  path: string,
  content: string,
  changedBy = "agent",
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

    await db.insert(fileHistory).values({
      id: crypto.randomUUID(),
      fileId: existing.id,
      content,
      changeType: "updated",
      changedBy,
    } satisfies NewFileHistory);
    return;
  }

  const fileId = crypto.randomUUID();
  await db.insert(projectFiles).values({
    id: fileId,
    projectId,
    path,
    content,
    language,
    size,
  });

  await db.insert(fileHistory).values({
    id: crypto.randomUUID(),
    fileId,
    content,
    changeType: "created",
    changedBy,
  } satisfies NewFileHistory);
}
