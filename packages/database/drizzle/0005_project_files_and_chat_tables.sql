-- Create project_files table
CREATE TABLE IF NOT EXISTS "project_files" (
    "id" TEXT PRIMARY KEY,
    "project_id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "created_at" TEXT NOT NULL,
    "updated_at" TEXT NOT NULL
);

-- Create file_history table
CREATE TABLE IF NOT EXISTS "file_history" (
    "id" TEXT PRIMARY KEY,
    "file_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "change_type" TEXT NOT NULL,
    "changed_by" TEXT NOT NULL,
    "changed_at" TEXT NOT NULL
);

-- Create project_commands table
CREATE TABLE IF NOT EXISTS "project_commands" (
    "id" TEXT PRIMARY KEY,
    "project_id" TEXT NOT NULL,
    "command" TEXT NOT NULL,
    "exit_code" INTEGER,
    "output" TEXT,
    "error" TEXT,
    "executed_at" TEXT NOT NULL
);

-- Create project_errors table
CREATE TABLE IF NOT EXISTS "project_errors" (
    "id" TEXT PRIMARY KEY,
    "project_id" TEXT NOT NULL,
    "error_type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "stack_trace" TEXT,
    "file_path" TEXT,
    "line_number" INTEGER,
    "occurred_at" TEXT NOT NULL,
    "resolved" INTEGER NOT NULL DEFAULT 0
);

-- Create chat_sessions table
CREATE TABLE IF NOT EXISTS "chat_sessions" (
    "id" TEXT PRIMARY KEY,
    "project_id" TEXT,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "created_at" TEXT NOT NULL,
    "updated_at" TEXT NOT NULL
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS "chat_messages" (
    "id" TEXT PRIMARY KEY,
    "session_id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "timestamp" INTEGER NOT NULL
);
