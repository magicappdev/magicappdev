import { generateSeedSQL, getTableList, buildResetSQL } from "../seed.js";
import { describe, expect, it } from "vitest";

describe("seed utilities", () => {
  describe("getTableList", () => {
    it("returns tables in dependency-safe order (children before parents)", () => {
      const tables = getTableList();

      // Tables with foreign keys should come before their referenced tables
      const chatMessagesIdx = tables.indexOf("chat_messages");
      const chatSessionsIdx = tables.indexOf("chat_sessions");
      const projectsIdx = tables.indexOf("projects");
      const usersIdx = tables.indexOf("users");

      // chat_messages -> chat_sessions (messages deleted first)
      expect(chatMessagesIdx).toBeLessThan(chatSessionsIdx);
      // chat_sessions -> users (sessions deleted first)
      expect(chatSessionsIdx).toBeLessThan(usersIdx);
      // projects -> users
      expect(projectsIdx).toBeLessThan(usersIdx);
    });

    it("includes all core tables", () => {
      const tables = getTableList();
      expect(tables).toContain("users");
      expect(tables).toContain("projects");
      expect(tables).toContain("profiles");
      expect(tables).toContain("chat_sessions");
      expect(tables).toContain("chat_messages");
      expect(tables).toContain("sessions");
      expect(tables).toContain("accounts");
    });
  });

  describe("buildResetSQL", () => {
    it("generates DELETE statements for all tables", () => {
      const sql = buildResetSQL();
      const tables = getTableList();

      tables.forEach(table => {
        expect(sql).toContain(`DELETE FROM ${table};`);
      });
    });

    it("uses only hardcoded table names (no injection vectors)", () => {
      const sql = buildResetSQL();
      const tables = getTableList();

      // Verify each table name is alphanumeric + underscore only (safe identifiers)
      tables.forEach(table => {
        expect(table).toMatch(/^[a-z_]+$/);
      });

      // Verify no malicious characters could enter from table names
      expect(sql).not.toContain("--");
      expect(sql).not.toContain("/*");
      expect(sql).not.toContain("DROP");
    });
  });

  describe("generateSeedSQL", () => {
    it("generates INSERT statements for users with required fields", () => {
      const sql = generateSeedSQL();
      const nowIso = new Date().toISOString();

      expect(sql).toContain("INSERT INTO users");
      expect(sql).toContain("alice@example.com");
      expect(sql).toContain("Bob User");
      expect(sql).toContain("admin");
      expect(sql).toContain("user");
      expect(sql).toContain(nowIso.slice(0, 10)); // date prefix
    });

    it("generates INSERT statements for profiles", () => {
      const sql = generateSeedSQL();

      expect(sql).toContain("INSERT INTO profiles");
      expect(sql).toContain("alice-dev");
      expect(sql).toContain("bob-codes");
    });

    it("generates INSERT statements for projects with JSON config", () => {
      const sql = generateSeedSQL();

      expect(sql).toContain("INSERT INTO projects");
      expect(sql).toContain("demo-app");
      expect(sql).toContain("my-saas");
      expect(sql).toContain("expo");
      expect(sql).toContain("next");
      expect(sql).toContain('"typescript": true');
    });

    it("generates INSERT statements for chat sessions", () => {
      const sql = generateSeedSQL();

      expect(sql).toContain("INSERT INTO chat_sessions");
      expect(sql).toContain("Demo App Chat");
      expect(sql).toContain("My SaaS Chat");
    });

    it("generates INSERT statements for chat messages with both roles", () => {
      const sql = generateSeedSQL();

      expect(sql).toContain("INSERT INTO chat_messages");
      expect(sql).toContain("'user'");
      expect(sql).toContain("'assistant'");
      expect(sql).toContain("Create a login screen");
      expect(sql).toContain("Add a dashboard");
    });

    it("references user IDs consistently across tables", () => {
      const sql = generateSeedSQL();

      expect(sql).toContain("'user-1'");
      expect(sql).toContain("'user-2'");
      expect(sql.match(/'user-1'/g)).toHaveLength(11); // users + profile + project + chat_session + user_ai_keys + tickets + system_logs + admin_api_keys + api_keys + file_history (x2)
      expect(sql.match(/'user-2'/g)).toHaveLength(7); // users + profile + project + chat_session + user_ai_keys + tickets + api_keys
    });

    it("uses valid ISO timestamps for created_at and updated_at", () => {
      const sql = generateSeedSQL();

      // Verify timestamp pattern (ISO 8601)
      const now = new Date().toISOString();
      expect(sql).toContain(now.slice(0, 19));
    });
  });
});
