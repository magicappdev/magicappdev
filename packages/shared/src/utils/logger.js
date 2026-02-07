/**
 * Shared logging interface
 */
/** Log level priority */
const LOG_LEVEL_PRIORITY = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};
/** Create a logger instance */
export function createLogger(config = { level: "info" }) {
  const { level: minLevel, prefix = "", timestamp = true } = config;
  const shouldLog = level => {
    return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[minLevel];
  };
  const formatMessage = (level, message, context) => {
    const parts = [];
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
  const log = (level, message, context) => {
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
    debug: (message, context) => log("debug", message, context),
    info: (message, context) => log("info", message, context),
    warn: (message, context) => log("warn", message, context),
    error: (message, context) => log("error", message, context),
    child: childPrefix =>
      createLogger({
        level: minLevel,
        prefix: prefix ? `${prefix}:${childPrefix}` : childPrefix,
        timestamp,
      }),
  };
}
/** Default logger instance */
export const logger = createLogger();
