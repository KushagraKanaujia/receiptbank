import { Request, Response, NextFunction } from 'express';
import { JwtPayload } from '../utils/jwt';
export interface AuthRequest extends Request {
    user?: JwtPayload;
}
/**
 * Middleware to authenticate requests using JWT
 */
export declare const authenticate: (req: Request, res: Response, next: NextFunction) => void;
/**
 * Middleware to check if user has specific role
 */
export declare const requireRole: (role: "user" | "business") => (req: Request, res: Response, next: NextFunction) => void;
/**
 * Optional authentication - attaches user if token is valid but doesn't require it
 */
export declare const optionalAuth: (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.d.ts.map