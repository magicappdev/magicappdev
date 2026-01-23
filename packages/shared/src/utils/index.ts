/**
 * Utility functions for MagicAppDev platform
 */

// Logger
export {
  createLogger,
  logger,
  type Logger,
  type LogEntry,
  type LoggerConfig,
} from "./logger.js";

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
} from "./string.js";

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
} from "./validation.js";

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
} from "./result.js";
