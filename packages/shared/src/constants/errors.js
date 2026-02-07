/**
 * Error codes and messages
 */
/** Error codes by category */
export const ErrorCodes = {
  // Authentication errors (1xxx)
  AUTH_INVALID_CREDENTIALS: "AUTH_1001",
  AUTH_TOKEN_EXPIRED: "AUTH_1002",
  AUTH_TOKEN_INVALID: "AUTH_1003",
  AUTH_UNAUTHORIZED: "AUTH_1004",
  AUTH_FORBIDDEN: "AUTH_1005",
  // Validation errors (2xxx)
  VALIDATION_FAILED: "VAL_2001",
  VALIDATION_REQUIRED_FIELD: "VAL_2002",
  VALIDATION_INVALID_FORMAT: "VAL_2003",
  VALIDATION_OUT_OF_RANGE: "VAL_2004",
  // Project errors (3xxx)
  PROJECT_NOT_FOUND: "PROJ_3001",
  PROJECT_ALREADY_EXISTS: "PROJ_3002",
  PROJECT_INVALID_CONFIG: "PROJ_3003",
  PROJECT_BUILD_FAILED: "PROJ_3004",
  PROJECT_DEPLOY_FAILED: "PROJ_3005",
  // Template errors (4xxx)
  TEMPLATE_NOT_FOUND: "TMPL_4001",
  TEMPLATE_INVALID: "TMPL_4002",
  TEMPLATE_GENERATION_FAILED: "TMPL_4003",
  // AI errors (5xxx)
  AI_PROVIDER_ERROR: "AI_5001",
  AI_RATE_LIMITED: "AI_5002",
  AI_INVALID_RESPONSE: "AI_5003",
  AI_CONTEXT_TOO_LONG: "AI_5004",
  // File system errors (6xxx)
  FS_FILE_NOT_FOUND: "FS_6001",
  FS_PERMISSION_DENIED: "FS_6002",
  FS_WRITE_FAILED: "FS_6003",
  FS_READ_FAILED: "FS_6004",
  // Network errors (7xxx)
  NETWORK_TIMEOUT: "NET_7001",
  NETWORK_CONNECTION_FAILED: "NET_7002",
  NETWORK_REQUEST_FAILED: "NET_7003",
  // GitHub errors (8xxx)
  GITHUB_AUTH_FAILED: "GH_8001",
  GITHUB_REPO_NOT_FOUND: "GH_8002",
  GITHUB_RATE_LIMITED: "GH_8003",
  // General errors (9xxx)
  INTERNAL_ERROR: "ERR_9001",
  NOT_IMPLEMENTED: "ERR_9002",
  UNKNOWN_ERROR: "ERR_9999",
};
/** Error messages */
export const ErrorMessages = {
  [ErrorCodes.AUTH_INVALID_CREDENTIALS]: "Invalid email or password",
  [ErrorCodes.AUTH_TOKEN_EXPIRED]: "Authentication token has expired",
  [ErrorCodes.AUTH_TOKEN_INVALID]: "Invalid authentication token",
  [ErrorCodes.AUTH_UNAUTHORIZED]: "Authentication required",
  [ErrorCodes.AUTH_FORBIDDEN]: "Access denied",
  [ErrorCodes.VALIDATION_FAILED]: "Validation failed",
  [ErrorCodes.VALIDATION_REQUIRED_FIELD]: "Required field is missing",
  [ErrorCodes.VALIDATION_INVALID_FORMAT]: "Invalid format",
  [ErrorCodes.VALIDATION_OUT_OF_RANGE]: "Value is out of allowed range",
  [ErrorCodes.PROJECT_NOT_FOUND]: "Project not found",
  [ErrorCodes.PROJECT_ALREADY_EXISTS]: "Project with this name already exists",
  [ErrorCodes.PROJECT_INVALID_CONFIG]: "Invalid project configuration",
  [ErrorCodes.PROJECT_BUILD_FAILED]: "Project build failed",
  [ErrorCodes.PROJECT_DEPLOY_FAILED]: "Project deployment failed",
  [ErrorCodes.TEMPLATE_NOT_FOUND]: "Template not found",
  [ErrorCodes.TEMPLATE_INVALID]: "Invalid template",
  [ErrorCodes.TEMPLATE_GENERATION_FAILED]: "Template generation failed",
  [ErrorCodes.AI_PROVIDER_ERROR]: "AI provider error",
  [ErrorCodes.AI_RATE_LIMITED]: "AI rate limit exceeded",
  [ErrorCodes.AI_INVALID_RESPONSE]: "Invalid AI response",
  [ErrorCodes.AI_CONTEXT_TOO_LONG]: "Context too long for AI model",
  [ErrorCodes.FS_FILE_NOT_FOUND]: "File not found",
  [ErrorCodes.FS_PERMISSION_DENIED]: "Permission denied",
  [ErrorCodes.FS_WRITE_FAILED]: "Failed to write file",
  [ErrorCodes.FS_READ_FAILED]: "Failed to read file",
  [ErrorCodes.NETWORK_TIMEOUT]: "Request timed out",
  [ErrorCodes.NETWORK_CONNECTION_FAILED]: "Connection failed",
  [ErrorCodes.NETWORK_REQUEST_FAILED]: "Request failed",
  [ErrorCodes.GITHUB_AUTH_FAILED]: "GitHub authentication failed",
  [ErrorCodes.GITHUB_REPO_NOT_FOUND]: "GitHub repository not found",
  [ErrorCodes.GITHUB_RATE_LIMITED]: "GitHub rate limit exceeded",
  [ErrorCodes.INTERNAL_ERROR]: "Internal server error",
  [ErrorCodes.NOT_IMPLEMENTED]: "Feature not implemented",
  [ErrorCodes.UNKNOWN_ERROR]: "An unknown error occurred",
};
