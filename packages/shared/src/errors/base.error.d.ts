/**
 * Custom error classes for MagicAppDev platform
 */
import { type ErrorCode } from "../constants/index.js";
/** Base application error */
export declare class AppError extends Error {
  readonly code: ErrorCode;
  readonly details?: Record<string, unknown>;
  readonly timestamp: string;
  constructor(
    code: ErrorCode,
    message?: string,
    details?: Record<string, unknown>,
  );
  toJSON(): Record<string, unknown>;
}
/** Authentication error */
export declare class AuthError extends AppError {
  constructor(
    code?: ErrorCode,
    message?: string,
    details?: Record<string, unknown>,
  );
}
/** Validation error */
export declare class ValidationError extends AppError {
  readonly fields?: {
    field: string;
    message: string;
  }[];
  constructor(
    message?: string,
    fields?: {
      field: string;
      message: string;
    }[],
    details?: Record<string, unknown>,
  );
  toJSON(): Record<string, unknown>;
}
/** Not found error */
export declare class NotFoundError extends AppError {
  readonly resource: string;
  constructor(resource: string, details?: Record<string, unknown>);
}
/** API error */
export declare class ApiError extends AppError {
  readonly statusCode: number;
  constructor(
    statusCode: number,
    code: ErrorCode,
    message?: string,
    details?: Record<string, unknown>,
  );
  toJSON(): Record<string, unknown>;
}
/** Network error */
export declare class NetworkError extends AppError {
  constructor(message?: string, details?: Record<string, unknown>);
}
/** AI provider error */
export declare class AiError extends AppError {
  readonly provider?: string;
  constructor(
    code?: ErrorCode,
    message?: string,
    provider?: string,
    details?: Record<string, unknown>,
  );
  toJSON(): Record<string, unknown>;
}
/** Check if error is an AppError */
export declare function isAppError(error: unknown): error is AppError;
/** Convert unknown error to AppError */
export declare function toAppError(error: unknown): AppError;
//# sourceMappingURL=base.error.d.ts.map
