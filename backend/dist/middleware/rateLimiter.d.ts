/**
 * General API rate limiter
 */
export declare const generalLimiter: import("express-rate-limit").RateLimitRequestHandler;
/**
 * Strict rate limiter for auth endpoints
 */
export declare const authLimiter: import("express-rate-limit").RateLimitRequestHandler;
/**
 * Per-user rate limiter using Redis
 * @param maxRequests - Maximum requests per window
 * @param windowSeconds - Time window in seconds
 */
export declare const perUserLimiter: (maxRequests: number, windowSeconds: number) => (req: any, res: any, next: any) => Promise<any>;
/**
 * Business API rate limiter (stricter limits)
 */
export declare const businessDataLimiter: (req: any, res: any, next: any) => Promise<any>;
//# sourceMappingURL=rateLimiter.d.ts.map