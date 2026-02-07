/**
 * Validation utilities
 */
/** Validate data against a Zod schema */
export function validate(schema, data) {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const errors = result.error.issues.map(issue => ({
    field: issue.path.join("."),
    message: issue.message,
  }));
  return { success: false, error: errors };
}
/** Check if value is defined (not null or undefined) */
export function isDefined(value) {
  return value !== null && value !== undefined;
}
/** Check if value is empty (null, undefined, empty string, empty array, empty object) */
export function isEmpty(value) {
  if (value === null || value === undefined) return true;
  if (typeof value === "string") return value.trim() === "";
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === "object") return Object.keys(value).length === 0;
  return false;
}
/** Check if value is a non-empty string */
export function isNonEmptyString(value) {
  return typeof value === "string" && value.trim() !== "";
}
/** Check if value is a positive number */
export function isPositiveNumber(value) {
  return typeof value === "number" && value > 0 && isFinite(value);
}
/** UUID validation regex (RFC 4122 versions 1-5) */
export const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
/** Check if value is a valid UUID */
export function isValidUuid(value) {
  if (typeof value !== "string") return false;
  return UUID_REGEX.test(value);
}
/** Regular expression implementing the SemVer 2.0.0 specification:
 *  - MAJOR.MINOR.PATCH
 *  - optional pre-release (e.g. -alpha.1)
 *  - optional build metadata (e.g. +001)
 */
const SEMVER_REGEX =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;
/** Check if value is a valid semver version */
export function isValidSemver(value) {
  if (typeof value !== "string") return false;
  return SEMVER_REGEX.test(value);
}
/** Assert condition and throw if false */
export function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}
/** Assert value is defined and return it */
export function assertDefined(value, message) {
  if (value === null || value === undefined) {
    throw new Error(message);
  }
  return value;
}
