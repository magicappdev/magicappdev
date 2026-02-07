/**
 * Custom error classes for MagicAppDev platform
 */
import { ErrorCodes, ErrorMessages } from "../constants/index";
/** Base application error */
export class AppError extends Error {
  code;
  details;
  timestamp;
  constructor(code, message, details) {
    super(message || ErrorMessages[code] || "An error occurred");
    this.name = "AppError";
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();
    // Maintain proper stack trace in V8 environments

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
  toJSON() {
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
  constructor(code = ErrorCodes.AUTH_UNAUTHORIZED, message, details) {
    super(code, message, details);
    this.name = "AuthError";
  }
}
/** Validation error */
export class ValidationError extends AppError {
  fields;
  constructor(message, fields, details) {
    super(ErrorCodes.VALIDATION_FAILED, message, details);
    this.name = "ValidationError";
    this.fields = fields;
  }
  toJSON() {
    return {
      ...super.toJSON(),
      fields: this.fields,
    };
  }
}
/** Not found error */
export class NotFoundError extends AppError {
  resource;
  constructor(resource, details) {
    super(ErrorCodes.PROJECT_NOT_FOUND, `${resource} not found`, details);
    this.name = "NotFoundError";
    this.resource = resource;
  }
}
/** API error */
export class ApiError extends AppError {
  statusCode;
  constructor(statusCode, code, message, details) {
    super(code, message, details);
    this.name = "ApiError";
    this.statusCode = statusCode;
  }
  toJSON() {
    return {
      ...super.toJSON(),
      statusCode: this.statusCode,
    };
  }
}
/** Network error */
export class NetworkError extends AppError {
  constructor(message, details) {
    super(ErrorCodes.NETWORK_REQUEST_FAILED, message, details);
    this.name = "NetworkError";
  }
}
/** AI provider error */
export class AiError extends AppError {
  provider;
  constructor(code = ErrorCodes.AI_PROVIDER_ERROR, message, provider, details) {
    super(code, message, details);
    this.name = "AiError";
    this.provider = provider;
  }
  toJSON() {
    return {
      ...super.toJSON(),
      provider: this.provider,
    };
  }
}
/** Check if error is an AppError */
export function isAppError(error) {
  return error instanceof AppError;
}
/** Convert unknown error to AppError */
export function toAppError(error) {
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
