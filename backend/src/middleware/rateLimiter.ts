import rateLimit from 'express-rate-limit';
import redisClient from '../utils/redis';

/**
 * General API rate limiter
 */
export const generalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Strict rate limiter for auth endpoints
 */
export const authLimiter = rateLimit({
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
export const perUserLimiter = (maxRequests: number, windowSeconds: number) => {
  return async (req: any, res: any, next: any) => {
    if (!req.user) {
      return next();
    }

    const key = `rate_limit:${req.user.userId}:${req.path}`;

    try {
      const current = await redisClient.incr(key);

      if (current === 1) {
        await redisClient.expire(key, windowSeconds);
      }

      if (current > maxRequests) {
        return res.status(429).json({
          error: 'Rate limit exceeded',
          retryAfter: await redisClient.ttl(key),
        });
      }

      res.setHeader('X-RateLimit-Limit', maxRequests.toString());
      res.setHeader('X-RateLimit-Remaining', (maxRequests - current).toString());

      next();
    } catch (error) {
      console.error('Rate limiter error:', error);
      next(); // Fail open on Redis errors
    }
  };
};

/**
 * Business API rate limiter (stricter limits)
 */
export const businessDataLimiter = perUserLimiter(1000, 3600); // 1000 requests per hour
