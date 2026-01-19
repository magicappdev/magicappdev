/**
 * Shared logging interface
 */
import type { LogLevel } from "../types/index.js";
/** Log entry */
export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
}
/** Logger configuration */
export interface LoggerConfig {
  level: LogLevel;
  prefix?: string;
  timestamp?: boolean;
}
/** Create a logger instance */
export declare function createLogger(config?: LoggerConfig): {
  debug: (message: string, context?: Record<string, unknown>) => void;
  info: (message: string, context?: Record<string, unknown>) => void;
  warn: (message: string, context?: Record<string, unknown>) => void;
  error: (message: string, context?: Record<string, unknown>) => void;
  child: (childPrefix: string) => /*elided*/ any;
};
/** Logger type */
export type Logger = ReturnType<typeof createLogger>;
/** Default logger instance */
export declare const logger: {
  debug: (message: string, context?: Record<string, unknown>) => void;
  info: (message: string, context?: Record<string, unknown>) => void;
  warn: (message: string, context?: Record<string, unknown>) => void;
  error: (message: string, context?: Record<string, unknown>) => void;
  child: (childPrefix: string) => /*elided*/ any;
};
//# sourceMappingURL=logger.d.ts.map
