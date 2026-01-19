/**
 * Validation utilities
 */
import type { Result } from "../types/index.js";
import type { ZodType } from "zod";
/** Validate data against a Zod schema */
export declare function validate<T>(
  schema: ZodType<T>,
  data: unknown,
): Result<
  T,
  {
    field: string;
    message: string;
  }[]
>;
/** Check if value is defined (not null or undefined) */
export declare function isDefined<T>(value: T | null | undefined): value is T;
/** Check if value is empty (null, undefined, empty string, empty array, empty object) */
export declare function isEmpty(value: unknown): boolean;
/** Check if value is a non-empty string */
export declare function isNonEmptyString(value: unknown): value is string;
/** Check if value is a positive number */
export declare function isPositiveNumber(value: unknown): value is number;
/** Check if value is a valid UUID */
export declare function isValidUuid(value: string): boolean;
/** Check if value is a valid semver version */
export declare function isValidSemver(value: string): boolean;
/** Assert condition and throw if false */
export declare function assert(
  condition: unknown,
  message: string,
): asserts condition;
/** Assert value is defined and return it */
export declare function assertDefined<T>(
  value: T | null | undefined,
  message: string,
): T;
//# sourceMappingURL=validation.d.ts.map
