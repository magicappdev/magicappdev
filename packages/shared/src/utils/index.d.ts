/**
 * Utility functions for MagicAppDev platform
 */
export {
  createLogger,
  logger,
  type Logger,
  type LogEntry,
  type LoggerConfig,
} from "./logger";
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
//# sourceMappingURL=index.d.ts.map
