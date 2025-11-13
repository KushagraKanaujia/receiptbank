/**
 * Custom error classes for better error handling
 */

export class AppError extends Error {
  public statusCode: number;
  public code: string;
  public isOperational: boolean;

  constructor(message: string, statusCode: number = 500, code: string = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, code: string = 'VALIDATION_ERROR') {
    super(message, 400, code);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required', code: string = 'AUTH_REQUIRED') {
    super(message, 401, code);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions', code: string = 'FORBIDDEN') {
    super(message, 403, code);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found', code: string = 'NOT_FOUND') {
    super(message, 404, code);
  }
}

export class ConflictError extends AppError {
  constructor(message: string, code: string = 'CONFLICT') {
    super(message, 409, code);
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests', code: string = 'RATE_LIMIT_EXCEEDED') {
    super(message, 429, code);
  }
}

// Receipt-specific errors
export class ReceiptError extends AppError {
  constructor(message: string, code: string) {
    super(message, 400, code);
  }
}

export class ReceiptQualityError extends ReceiptError {
  constructor(message: string = 'Receipt image quality too low') {
    super(message, 'RECEIPT_QUALITY_LOW');
  }
}

export class DuplicateReceiptError extends ReceiptError {
  constructor(message: string = 'This receipt has already been uploaded') {
    super(message, 'RECEIPT_DUPLICATE');
  }
}

export class ReceiptProcessingError extends ReceiptError {
  constructor(message: string = 'Unable to process receipt') {
    super(message, 'RECEIPT_PROCESSING_FAILED');
  }
}

export class DailyLimitError extends ReceiptError {
  constructor(message: string = 'Daily upload limit reached') {
    super(message, 'DAILY_LIMIT_REACHED');
  }
}

// Withdrawal-specific errors
export class WithdrawalError extends AppError {
  constructor(message: string, code: string) {
    super(message, 400, code);
  }
}

export class InsufficientBalanceError extends WithdrawalError {
  constructor(message: string = 'Insufficient balance for withdrawal') {
    super(message, 'INSUFFICIENT_BALANCE');
  }
}

export class MinimumWithdrawalError extends WithdrawalError {
  constructor(amount: number) {
    super(`Minimum withdrawal amount is $${amount.toFixed(2)}`, 'MINIMUM_WITHDRAWAL_NOT_MET');
  }
}

export class PaymentProviderError extends AppError {
  constructor(message: string, code: string = 'PAYMENT_PROVIDER_ERROR') {
    super(message, 502, code);
  }
}

// Helper to check if error is operational
export const isOperationalError = (error: Error): boolean => {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
};
