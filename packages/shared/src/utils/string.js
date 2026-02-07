/**
 * String manipulation utilities
 */
/** Convert string to kebab-case */
export function toKebabCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase();
}
/** Convert string to camelCase */
export function toCamelCase(str) {
  return str
    .replace(/[-_\s]+(.)?/g, (_, char) => (char ? char.toUpperCase() : ""))
    .replace(/^(.)/, char => char.toLowerCase());
}
/** Convert string to PascalCase */
export function toPascalCase(str) {
  const camel = toCamelCase(str);
  return camel.charAt(0).toUpperCase() + camel.slice(1);
}
/** Convert string to snake_case */
export function toSnakeCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, "$1_$2")
    .replace(/[-\s]+/g, "_")
    .toLowerCase();
}
/** Convert string to CONSTANT_CASE */
export function toConstantCase(str) {
  return toSnakeCase(str).toUpperCase();
}
/** Truncate string to specified length with ellipsis */
export function truncate(str, maxLength) {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + "...";
}
/** Capitalize first letter */
export function capitalize(str) {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}
/** Generate a URL-friendly slug */
export function slugify(str) {
  // Limit input length to prevent ReDoS
  const input = str.slice(0, 500);
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
/** Check if string is a valid URL */
export function isValidUrl(str) {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}
/** Check if string is a valid email */
export function isValidEmail(str) {
  // Limit input length to prevent ReDoS
  if (str.length > 254) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(str);
}
/** Generate a random string */
export function randomString(length) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
/** Pluralize a word based on count */
export function pluralize(word, count, plural) {
  if (count === 1) return word;
  return plural || word + "s";
}
