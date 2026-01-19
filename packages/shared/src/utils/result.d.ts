/**
 * Result type utilities for functional error handling
 */
import type { AsyncResult, Result } from "../types/index.js";
/** Create a successful result */
export declare function ok<T>(data: T): Result<T, never>;
/** Create a failed result */
export declare function err<E>(error: E): Result<never, E>;
/** Check if result is successful */
export declare function isOk<T, E>(
  result: Result<T, E>,
): result is {
  success: true;
  data: T;
};
/** Check if result is a failure */
export declare function isErr<T, E>(
  result: Result<T, E>,
): result is {
  success: false;
  error: E;
};
/** Unwrap a successful result or throw the error */
export declare function unwrap<T, E>(result: Result<T, E>): T;
/** Unwrap a successful result or return a default value */
export declare function unwrapOr<T, E>(
  result: Result<T, E>,
  defaultValue: T,
): T;
/** Map the successful value of a result */
export declare function mapResult<T, U, E>(
  result: Result<T, E>,
  fn: (data: T) => U,
): Result<U, E>;
/** Map the error of a result */
export declare function mapError<T, E, F>(
  result: Result<T, E>,
  fn: (error: E) => F,
): Result<T, F>;
/** Chain results (flatMap) */
export declare function flatMap<T, U, E>(
  result: Result<T, E>,
  fn: (data: T) => Result<U, E>,
): Result<U, E>;
/** Try to execute a function and wrap the result */
export declare function tryCatch<T>(fn: () => T): Result<T, Error>;
/** Try to execute an async function and wrap the result */
export declare function tryCatchAsync<T>(
  fn: () => Promise<T>,
): AsyncResult<T, Error>;
/** Combine multiple results into a single result */
export declare function combine<T extends readonly Result<unknown, unknown>[]>(
  results: T,
): Result<
  {
    [K in keyof T]: T[K] extends Result<infer U, unknown> ? U : never;
  },
  T[number] extends Result<unknown, infer E> ? E : never
>;
//# sourceMappingURL=result.d.ts.map
