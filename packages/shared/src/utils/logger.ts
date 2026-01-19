/**
 * Shared logging interface
 */

import type { LogLevel } from "../types";

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

/** Log level priority */
const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

/** Create a logger instance */
export function createLogger(config: LoggerConfig = { level: "info" }) {
  const { level: minLevel, prefix = "", timestamp = true } = config;

  const shouldLog = (level: LogLevel): boolean => {
    return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[minLevel];
  };

  const formatMessage = (
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
  ): string => {
    const parts: string[] = [];

    if (timestamp) {
      parts.push(`[${new Date().toISOString()}]`);
    }

    parts.push(`[${level.toUpperCase()}]`);

    if (prefix) {
      parts.push(`[${prefix}]`);
    }

    parts.push(message);

    if (context && Object.keys(context).length > 0) {
      parts.push(JSON.stringify(context));
    }

    return parts.join(" ");
  };

  const log = (
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
  ): void => {
    if (!shouldLog(level)) return;

    const formatted = formatMessage(level, message, context);

    switch (level) {
      case "debug":
        console.debug(formatted);
        break;
      case "info":
        console.info(formatted);
        break;
      case "warn":
        console.warn(formatted);
        break;
      case "error":
        console.error(formatted);
        break;
    }
  };

  return {
    debug: (message: string, context?: Record<string, unknown>) =>
      log("debug", message, context),
    info: (message: string, context?: Record<string, unknown>) =>
      log("info", message, context),
    warn: (message: string, context?: Record<string, unknown>) =>
      log("warn", message, context),
    error: (message: string, context?: Record<string, unknown>) =>
      log("error", message, context),
    child: (childPrefix: string) =>
      createLogger({
        level: minLevel,
        prefix: prefix ? `${prefix}:${childPrefix}` : childPrefix,
        timestamp,
      }),
  };
}

/** Logger type */
export type Logger = ReturnType<typeof createLogger>;

/** Default logger instance */
export const logger = createLogger();
