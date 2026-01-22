/**
 * Custom error classes for MagicAppDev platform
 */

import { ErrorCodes, ErrorMessages, type ErrorCode } from "../constants/index";

/** Base application error */
export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly details?: Record<string, unknown>;
  public readonly timestamp: string;

  constructor(
    code: ErrorCode,
    message?: string,
    details?: Record<string, unknown>,
  ) {
    super(message || ErrorMessages[code] || "An error occurred");
    this.name = "AppError";
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();

    // Maintain proper stack trace in V8 environments
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((Error as any).captureStackTrace) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (Error as any).captureStackTrace(this, this.constructor);
    }
  }

  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      details: this.details,
      timestamp: this.timestamp,
    };
  }
}

/** Authentication error */
export class AuthError extends AppError {
  constructor(
    code: ErrorCode = ErrorCodes.AUTH_UNAUTHORIZED,
    message?: string,
    details?: Record<string, unknown>,
  ) {
    super(code, message, details);
    this.name = "AuthError";
  }
}

/** Validation error */
export class ValidationError extends AppError {
  public readonly fields?: { field: string; message: string }[];

  constructor(
    message?: string,
    fields?: { field: string; message: string }[],
    details?: Record<string, unknown>,
  ) {
    super(ErrorCodes.VALIDATION_FAILED, message, details);
    this.name = "ValidationError";
    this.fields = fields;
  }

  override toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      fields: this.fields,
    };
  }
}

/** Not found error */
export class NotFoundError extends AppError {
  public readonly resource: string;

  constructor(resource: string, details?: Record<string, unknown>) {
    super(ErrorCodes.PROJECT_NOT_FOUND, `${resource} not found`, details);
    this.name = "NotFoundError";
    this.resource = resource;
  }
}

/** API error */
export class ApiError extends AppError {
  public readonly statusCode: number;

  constructor(
    statusCode: number,
    code: ErrorCode,
    message?: string,
    details?: Record<string, unknown>,
  ) {
    super(code, message, details);
    this.name = "ApiError";
    this.statusCode = statusCode;
  }

  override toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      statusCode: this.statusCode,
    };
  }
}

/** Network error */
export class NetworkError extends AppError {
  constructor(message?: string, details?: Record<string, unknown>) {
    super(ErrorCodes.NETWORK_REQUEST_FAILED, message, details);
    this.name = "NetworkError";
  }
}

/** AI provider error */
export class AiError extends AppError {
  public readonly provider?: string;

  constructor(
    code: ErrorCode = ErrorCodes.AI_PROVIDER_ERROR,
    message?: string,
    provider?: string,
    details?: Record<string, unknown>,
  ) {
    super(code, message, details);
    this.name = "AiError";
    this.provider = provider;
  }

  override toJSON(): Record<string, unknown> {
    return {
      ...super.toJSON(),
      provider: this.provider,
    };
  }
}

/** Check if error is an AppError */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/** Convert unknown error to AppError */
export function toAppError(error: unknown): AppError {
  if (isAppError(error)) {
    return error;
  }

  if (error instanceof Error) {
    return new AppError(ErrorCodes.UNKNOWN_ERROR, error.message, {
      originalError: error.name,
      stack: error.stack,
    });
  }

  return new AppError(ErrorCodes.UNKNOWN_ERROR, String(error));
}
