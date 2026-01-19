/**
 * Cloudflare Workers type declarations
 */

declare global {
  /** Cloudflare D1 Database */
  interface D1Database {
    prepare(query: string): D1PreparedStatement;
    dump(): Promise<ArrayBuffer>;
    batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>;
    exec(query: string): Promise<D1ExecResult>;
  }

  interface D1PreparedStatement {
    bind(...values: unknown[]): D1PreparedStatement;
    first<T = unknown>(colName?: string): Promise<T | null>;
    run<T = unknown>(): Promise<D1Result<T>>;
    all<T = unknown>(): Promise<D1Result<T>>;
    raw<T = unknown>(): Promise<T[]>;
  }

  interface D1Result<T = unknown> {
    results: T[];
    success: boolean;
    error?: string;
    meta: D1Meta;
  }

  interface D1Meta {
    duration: number;
    changes: number;
    last_row_id: number;
    rows_read: number;
    rows_written: number;
  }

  interface D1ExecResult {
    count: number;
    duration: number;
  }

  /** Cloudflare Workers AI */
  interface Ai {
    run<T = unknown>(
      model: string,
      inputs: AiTextGenerationInput | AiTextEmbeddingsInput | AiImageClassificationInput,
      options?: AiOptions
    ): Promise<T>;
  }

  interface AiTextGenerationInput {
    prompt?: string;
    messages?: Array<{ role: string; content: string }>;
    max_tokens?: number;
    temperature?: number;
    top_p?: number;
    stream?: boolean;
  }

  interface AiTextEmbeddingsInput {
    text: string | string[];
  }

  interface AiImageClassificationInput {
    image: ArrayBuffer | Uint8Array;
  }

  interface AiOptions {
    gateway?: {
      id: string;
      skipCache?: boolean;
      cacheTtl?: number;
    };
  }

  /** Execution context */
  interface ExecutionContext {
    waitUntil(promise: Promise<unknown>): void;
    passThroughOnException(): void;
  }
}

export {};
