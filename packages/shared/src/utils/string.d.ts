/**
 * String manipulation utilities
 */
/** Convert string to kebab-case */
export declare function toKebabCase(str: string): string;
/** Convert string to camelCase */
export declare function toCamelCase(str: string): string;
/** Convert string to PascalCase */
export declare function toPascalCase(str: string): string;
/** Convert string to snake_case */
export declare function toSnakeCase(str: string): string;
/** Convert string to CONSTANT_CASE */
export declare function toConstantCase(str: string): string;
/** Truncate string to specified length with ellipsis */
export declare function truncate(str: string, maxLength: number): string;
/** Capitalize first letter */
export declare function capitalize(str: string): string;
/** Generate a URL-friendly slug */
export declare function slugify(str: string): string;
/** Check if string is a valid URL */
export declare function isValidUrl(str: string): boolean;
/** Check if string is a valid email */
export declare function isValidEmail(str: string): boolean;
/** Generate a random string */
export declare function randomString(length: number): string;
/** Pluralize a word based on count */
export declare function pluralize(
  word: string,
  count: number,
  plural?: string,
): string;
//# sourceMappingURL=string.d.ts.map
