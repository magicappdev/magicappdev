/**
 * Utility functions for MagicAppDev platform
 */
// Logger
export { createLogger, logger } from "./logger";
// String utilities
export {
  capitalize,
  isValidEmail,
  isValidUrl,
  pluralize,
  randomString,
  slugify,
  toCamelCase,
  toConstantCase,
  toKebabCase,
  toPascalCase,
  toSnakeCase,
  truncate,
} from "./string";
// Validation utilities
export {
  assert,
  assertDefined,
  isDefined,
  isEmpty,
  isNonEmptyString,
  isPositiveNumber,
  isValidSemver,
  isValidUuid,
  validate,
} from "./validation";
// Result utilities
export {
  combine,
  err,
  flatMap,
  isErr,
  isOk,
  mapError,
  mapResult,
  ok,
  tryCatch,
  tryCatchAsync,
  unwrap,
  unwrapOr,
} from "./result";
