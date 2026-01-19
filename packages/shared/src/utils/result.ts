/**
 * Result type utilities for functional error handling
 */

import type { AsyncResult, Result } from "../types";

/** Create a successful result */
export function ok<T>(data: T): Result<T, never> {
  return { success: true, data };
}

/** Create a failed result */
export function err<E>(error: E): Result<never, E> {
  return { success: false, error };
}

/** Check if result is successful */
export function isOk<T, E>(
  result: Result<T, E>,
): result is { success: true; data: T } {
  return result.success;
}

/** Check if result is a failure */
export function isErr<T, E>(
  result: Result<T, E>,
): result is { success: false; error: E } {
  return !result.success;
}

/** Unwrap a successful result or throw the error */
export function unwrap<T, E>(result: Result<T, E>): T {
  if (result.success) {
    return result.data;
  }
  throw result.error;
}

/** Unwrap a successful result or return a default value */
export function unwrapOr<T, E>(result: Result<T, E>, defaultValue: T): T {
  if (result.success) {
    return result.data;
  }
  return defaultValue;
}

/** Map the successful value of a result */
export function mapResult<T, U, E>(
  result: Result<T, E>,
  fn: (data: T) => U,
): Result<U, E> {
  if (result.success) {
    return ok(fn(result.data));
  }
  return result;
}

/** Map the error of a result */
export function mapError<T, E, F>(
  result: Result<T, E>,
  fn: (error: E) => F,
): Result<T, F> {
  if (!result.success) {
    return err(fn(result.error));
  }
  return result;
}

/** Chain results (flatMap) */
export function flatMap<T, U, E>(
  result: Result<T, E>,
  fn: (data: T) => Result<U, E>,
): Result<U, E> {
  if (result.success) {
    return fn(result.data);
  }
  return result;
}

/** Try to execute a function and wrap the result */
export function tryCatch<T>(fn: () => T): Result<T, Error> {
  try {
    return ok(fn());
  } catch (error) {
    return err(error instanceof Error ? error : new Error(String(error)));
  }
}

/** Try to execute an async function and wrap the result */
export async function tryCatchAsync<T>(
  fn: () => Promise<T>,
): AsyncResult<T, Error> {
  try {
    return ok(await fn());
  } catch (error) {
    return err(error instanceof Error ? error : new Error(String(error)));
  }
}

/** Combine multiple results into a single result */
export function combine<T extends readonly Result<unknown, unknown>[]>(
  results: T,
): Result<
  { [K in keyof T]: T[K] extends Result<infer U, unknown> ? U : never },
  T[number] extends Result<unknown, infer E> ? E : never
> {
  const data: unknown[] = [];

  for (const result of results) {
    if (!result.success) {
      return result as Result<
        never,
        T[number] extends Result<unknown, infer E> ? E : never
      >;
    }
    data.push(result.data);
  }

  return ok(
    data as {
      [K in keyof T]: T[K] extends Result<infer U, unknown> ? U : never;
    },
  );
}
