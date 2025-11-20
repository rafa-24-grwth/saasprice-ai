// API Error Handling Utilities
// Provides consistent error handling across all API routes

import { NextResponse } from 'next/server';

/**
 * Standard error codes for API responses
 */
export enum ApiErrorCode {
  // Authentication & Authorization
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  
  // Validation
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  
  // Not Found
  NOT_FOUND = 'NOT_FOUND',
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  
  // Conflict
  CONFLICT = 'CONFLICT',
  DUPLICATE_ENTRY = 'DUPLICATE_ENTRY',
  
  // Rate Limiting
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS',
  
  // Server Errors
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  
  // Business Logic
  OPERATION_FAILED = 'OPERATION_FAILED',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
}

/**
 * HTTP status code mapping for error codes
 */
const ERROR_CODE_TO_STATUS: Record<ApiErrorCode, number> = {
  [ApiErrorCode.UNAUTHORIZED]: 401,
  [ApiErrorCode.FORBIDDEN]: 403,
  [ApiErrorCode.VALIDATION_ERROR]: 400,
  [ApiErrorCode.INVALID_INPUT]: 400,
  [ApiErrorCode.MISSING_REQUIRED_FIELD]: 400,
  [ApiErrorCode.NOT_FOUND]: 404,
  [ApiErrorCode.RESOURCE_NOT_FOUND]: 404,
  [ApiErrorCode.CONFLICT]: 409,
  [ApiErrorCode.DUPLICATE_ENTRY]: 409,
  [ApiErrorCode.RATE_LIMIT_EXCEEDED]: 429,
  [ApiErrorCode.TOO_MANY_REQUESTS]: 429,
  [ApiErrorCode.INTERNAL_SERVER_ERROR]: 500,
  [ApiErrorCode.DATABASE_ERROR]: 500,
  [ApiErrorCode.SERVICE_UNAVAILABLE]: 503,
  [ApiErrorCode.OPERATION_FAILED]: 500,
  [ApiErrorCode.INSUFFICIENT_PERMISSIONS]: 403,
};

/**
 * API Error class extending Error
 * Provides structured error handling with error codes and metadata
 */
export class ApiError extends Error {
  public readonly code: ApiErrorCode;
  public readonly statusCode: number;
  public readonly details?: unknown;

  constructor(
    message: string,
    code: ApiErrorCode = ApiErrorCode.INTERNAL_SERVER_ERROR,
    details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.statusCode = ERROR_CODE_TO_STATUS[code] || 500;
    this.details = details;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }

  /**
   * Create an unauthorized error
   */
  static unauthorized(message: string = 'Unauthorized'): ApiError {
    return new ApiError(message, ApiErrorCode.UNAUTHORIZED);
  }

  /**
   * Create a forbidden error
   */
  static forbidden(message: string = 'Forbidden'): ApiError {
    return new ApiError(message, ApiErrorCode.FORBIDDEN);
  }

  /**
   * Create a validation error
   */
  static validation(message: string, details?: unknown): ApiError {
    return new ApiError(message, ApiErrorCode.VALIDATION_ERROR, details);
  }

  /**
   * Create a not found error
   */
  static notFound(message: string = 'Resource not found'): ApiError {
    return new ApiError(message, ApiErrorCode.NOT_FOUND);
  }

  /**
   * Create a conflict error
   */
  static conflict(message: string, details?: unknown): ApiError {
    return new ApiError(message, ApiErrorCode.CONFLICT, details);
  }

  /**
   * Create a database error
   */
  static database(message: string = 'Database operation failed', details?: unknown): ApiError {
    return new ApiError(message, ApiErrorCode.DATABASE_ERROR, details);
  }
}

/**
 * Standard error response format
 */
export interface ApiErrorResponse {
  success: false;
  error: {
    message: string;
    code: ApiErrorCode;
    details?: unknown;
  };
  timestamp: string;
}

/**
 * Format error response for API routes
 */
export function formatErrorResponse(
  error: unknown,
  defaultMessage: string = 'An unexpected error occurred'
): NextResponse<ApiErrorResponse> {
  // Handle ApiError instances
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error.message,
          code: error.code,
          details: error.details,
        },
        timestamp: new Date().toISOString(),
      },
      { status: error.statusCode }
    );
  }

  // Handle standard Error instances
  if (error instanceof Error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error.message || defaultMessage,
          code: ApiErrorCode.INTERNAL_SERVER_ERROR,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }

  // Handle unknown error types
  return NextResponse.json(
    {
      success: false,
      error: {
        message: defaultMessage,
        code: ApiErrorCode.INTERNAL_SERVER_ERROR,
      },
      timestamp: new Date().toISOString(),
    },
    { status: 500 }
  );
}

/**
 * Wrapper for API route handlers with consistent error handling
 * Usage: export const GET = withErrorHandling(async (request) => { ... })
 */
export function withErrorHandling<T extends Request>(
  handler: (request: T, context?: any) => Promise<NextResponse>
) {
  return async (request: T, context?: any): Promise<NextResponse> => {
    try {
      return await handler(request, context);
    } catch (error) {
      console.error('API Route Error:', error);
      return formatErrorResponse(error);
    }
  };
}

