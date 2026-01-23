/**
 * CLI UI utilities using Chalk
 */
/** Print a header */
export declare function header(text: string): void;
/** Print the app logo */
export declare function logo(): void;
/** Print a success message */
export declare function success(text: string): void;
/** Print an error message */
export declare function error(text: string): void;
/** Print a warning message */
export declare function warn(text: string): void;
/** Print an info message */
export declare function info(text: string): void;
/** Print a step message */
export declare function step(number: number, text: string): void;
/** Print a key-value pair */
export declare function keyValue(key: string, value: string): void;
/** Print a list item */
export declare function listItem(text: string, indent?: number): void;
/** Print a code block */
export declare function code(text: string): void;
/** Print a command suggestion */
export declare function command(text: string): void;
/** Print a divider */
export declare function divider(): void;
/** Print a newline */
export declare function newline(): void;
/** Color function type */
type ColorFn = (text: string | number) => string;
/** Colors for exports */
export declare const colors: Record<string, ColorFn>;
export {};
//# sourceMappingURL=ui.d.ts.map
