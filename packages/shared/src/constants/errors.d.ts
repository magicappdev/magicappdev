/**
 * Error codes and messages
 */
/** Error codes by category */
export declare const ErrorCodes: {
  readonly AUTH_INVALID_CREDENTIALS: "AUTH_1001";
  readonly AUTH_TOKEN_EXPIRED: "AUTH_1002";
  readonly AUTH_TOKEN_INVALID: "AUTH_1003";
  readonly AUTH_UNAUTHORIZED: "AUTH_1004";
  readonly AUTH_FORBIDDEN: "AUTH_1005";
  readonly VALIDATION_FAILED: "VAL_2001";
  readonly VALIDATION_REQUIRED_FIELD: "VAL_2002";
  readonly VALIDATION_INVALID_FORMAT: "VAL_2003";
  readonly VALIDATION_OUT_OF_RANGE: "VAL_2004";
  readonly PROJECT_NOT_FOUND: "PROJ_3001";
  readonly PROJECT_ALREADY_EXISTS: "PROJ_3002";
  readonly PROJECT_INVALID_CONFIG: "PROJ_3003";
  readonly PROJECT_BUILD_FAILED: "PROJ_3004";
  readonly PROJECT_DEPLOY_FAILED: "PROJ_3005";
  readonly TEMPLATE_NOT_FOUND: "TMPL_4001";
  readonly TEMPLATE_INVALID: "TMPL_4002";
  readonly TEMPLATE_GENERATION_FAILED: "TMPL_4003";
  readonly AI_PROVIDER_ERROR: "AI_5001";
  readonly AI_RATE_LIMITED: "AI_5002";
  readonly AI_INVALID_RESPONSE: "AI_5003";
  readonly AI_CONTEXT_TOO_LONG: "AI_5004";
  readonly FS_FILE_NOT_FOUND: "FS_6001";
  readonly FS_PERMISSION_DENIED: "FS_6002";
  readonly FS_WRITE_FAILED: "FS_6003";
  readonly FS_READ_FAILED: "FS_6004";
  readonly NETWORK_TIMEOUT: "NET_7001";
  readonly NETWORK_CONNECTION_FAILED: "NET_7002";
  readonly NETWORK_REQUEST_FAILED: "NET_7003";
  readonly GITHUB_AUTH_FAILED: "GH_8001";
  readonly GITHUB_REPO_NOT_FOUND: "GH_8002";
  readonly GITHUB_RATE_LIMITED: "GH_8003";
  readonly INTERNAL_ERROR: "ERR_9001";
  readonly NOT_IMPLEMENTED: "ERR_9002";
  readonly UNKNOWN_ERROR: "ERR_9999";
};
export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];
/** Error messages */
export declare const ErrorMessages: Record<ErrorCode, string>;
//# sourceMappingURL=errors.d.ts.map
