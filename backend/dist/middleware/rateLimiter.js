"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.businessDataLimiter = exports.perUserLimiter = exports.authLimiter = exports.generalLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const redis_1 = __importDefault(require("../utils/redis"));
/**
 * General API rate limiter
 */
exports.generalLimiter = (0, express_rate_limit_1.default)({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    message: 'Too many requests from this IP, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
});
/**
 * Strict rate limiter for auth endpoints
 */
exports.authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    message: 'Too many authentication attempts, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
});
/**
 * Per-user rate limiter using Redis
 * @param maxRequests - Maximum requests per window
 * @param windowSeconds - Time window in seconds
 */
const perUserLimiter = (maxRequests, windowSeconds) => {
    return async (req, res, next) => {
        if (!req.user) {
            return next();
        }
        const key = `rate_limit:${req.user.userId}:${req.path}`;
        try {
            const current = await redis_1.default.incr(key);
            if (current === 1) {
                await redis_1.default.expire(key, windowSeconds);
            }
            if (current > maxRequests) {
                return res.status(429).json({
                    error: 'Rate limit exceeded',
                    retryAfter: await redis_1.default.ttl(key),
                });
            }
            res.setHeader('X-RateLimit-Limit', maxRequests.toString());
            res.setHeader('X-RateLimit-Remaining', (maxRequests - current).toString());
            next();
        }
        catch (error) {
            console.error('Rate limiter error:', error);
            next(); // Fail open on Redis errors
        }
    };
};
exports.perUserLimiter = perUserLimiter;
/**
 * Business API rate limiter (stricter limits)
 */
exports.businessDataLimiter = (0, exports.perUserLimiter)(1000, 3600); // 1000 requests per hour
//# sourceMappingURL=rateLimiter.js.map