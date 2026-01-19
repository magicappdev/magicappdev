/**
 * Type declarations for drizzle-orm
 *
 * Minimal declarations to satisfy TypeScript compilation.
 */

declare module "drizzle-orm/sqlite-core" {
  export interface SQLiteColumnBuilderBase<T = unknown> {
    $type<TType>(): SQLiteColumnBuilderBase<TType>;
    notNull(): SQLiteColumnBuilderBase<T>;
    default(value: unknown): SQLiteColumnBuilderBase<T>;
    unique(): SQLiteColumnBuilderBase<T>;
    primaryKey(): SQLiteColumnBuilderBase<T>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    references(
      ref: () => any,
      options?: { onDelete?: string },
    ): SQLiteColumnBuilderBase<T>;
    $defaultFn(fn: () => unknown): SQLiteColumnBuilderBase<T>;
  }

  export interface SQLiteColumn<
    T = unknown,
  > extends SQLiteColumnBuilderBase<T> {
    $inferSelect: T;
    $inferInsert: T;
  }

  export interface SQLiteTableWithColumns<T extends Record<string, unknown>> {
    $inferSelect: { [K in keyof T]: T[K] };
    $inferInsert: Partial<{ [K in keyof T]: T[K] }>;
    // Allow column access
    [key: string]: SQLiteColumnBuilderBase | unknown;
  }

  export function sqliteTable<
    TName extends string,
    TColumns extends Record<string, SQLiteColumnBuilderBase>,
  >(
    name: TName,
    columns: TColumns,
  ): SQLiteTableWithColumns<{
    [K in keyof TColumns]: TColumns[K] extends SQLiteColumnBuilderBase<infer T>
      ? T
      : never;
  }> &
    TColumns;

  export function text<TName extends string>(
    name: TName,
    options?: { enum?: readonly string[]; mode?: "json" },
  ): SQLiteColumnBuilderBase<string>;

  export function integer<TName extends string>(
    name: TName,
    options?: { mode?: "boolean" | "number" },
  ): SQLiteColumnBuilderBase<number>;
}

declare module "drizzle-orm/d1" {
  import type { SQLiteTableWithColumns } from "drizzle-orm/sqlite-core";

  export interface DrizzleD1Database<
    TSchema extends Record<string, unknown> = Record<string, never>,
  > {
    select<T>(from: SQLiteTableWithColumns<T>): unknown;
    insert<T>(into: SQLiteTableWithColumns<T>): unknown;
    update<T>(table: SQLiteTableWithColumns<T>): unknown;
    delete<T>(from: SQLiteTableWithColumns<T>): unknown;
    query: TSchema;
  }

  export function drizzle<TSchema extends Record<string, unknown>>(
    client: D1Database,
    config?: { schema?: TSchema; logger?: boolean },
  ): DrizzleD1Database<TSchema>;
}
