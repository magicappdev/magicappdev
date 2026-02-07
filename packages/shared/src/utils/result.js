/**
 * Result type utilities for functional error handling
 */
/** Create a successful result */
export function ok(data) {
  return { success: true, data };
}
/** Create a failed result */
export function err(error) {
  return { success: false, error };
}
/** Check if result is successful */
export function isOk(result) {
  return result.success;
}
/** Check if result is a failure */
export function isErr(result) {
  return !result.success;
}
/** Unwrap a successful result or throw the error */
export function unwrap(result) {
  if (result.success) {
    return result.data;
  }
  throw result.error;
}
/** Unwrap a successful result or return a default value */
export function unwrapOr(result, defaultValue) {
  if (result.success) {
    return result.data;
  }
  return defaultValue;
}
/** Map the successful value of a result */
export function mapResult(result, fn) {
  if (result.success) {
    return ok(fn(result.data));
  }
  return result;
}
/** Map the error of a result */
export function mapError(result, fn) {
  if (!result.success) {
    return err(fn(result.error));
  }
  return result;
}
/** Chain results (flatMap) */
export function flatMap(result, fn) {
  if (result.success) {
    return fn(result.data);
  }
  return result;
}
/** Try to execute a function and wrap the result */
export function tryCatch(fn) {
  try {
    return ok(fn());
  } catch (error) {
    return err(error instanceof Error ? error : new Error(String(error)));
  }
}
/** Try to execute an async function and wrap the result */
export async function tryCatchAsync(fn) {
  try {
    return ok(await fn());
  } catch (error) {
    return err(error instanceof Error ? error : new Error(String(error)));
  }
}
/** Combine multiple results into a single result */
export function combine(results) {
  const data = [];
  for (const result of results) {
    if (!result.success) {
      return result;
    }
    data.push(result.data);
  }
  return ok(data);
}
