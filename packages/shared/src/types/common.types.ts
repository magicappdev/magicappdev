/**
 * Common utility types used across the MagicAppDev platform
 */

/** Represents a unique identifier */
export type Id = string;

/** Represents a timestamp in ISO 8601 format */
export type Timestamp = string;

/** Makes all properties of T optional recursively */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/** Extracts the resolved type from a Promise */
export type Awaited<T> = T extends Promise<infer U> ? U : T;

/** Makes specified keys required */
export type RequiredKeys<T, K extends keyof T> = T & Required<Pick<T, K>>;

/** Result type for operations that can fail */
export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

/** Async result type */
export type AsyncResult<T, E = Error> = Promise<Result<T, E>>;

/** Pagination parameters */
export interface PaginationParams {
  page?: number;
  limit?: number;
  cursor?: string;
}

/** Paginated response */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
    nextCursor?: string;
  };
}

/** Sort order */
export type SortOrder = "asc" | "desc";

/** Sort parameters */
export interface SortParams<T = string> {
  field: T;
  order: SortOrder;
}

/** Environment type */
export type Environment = "development" | "staging" | "production";

/** Log level */
export type LogLevel = "debug" | "info" | "warn" | "error";
