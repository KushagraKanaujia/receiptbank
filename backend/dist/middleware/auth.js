"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.requireRole = exports.authenticate = void 0;
const jwt_1 = require("../utils/jwt");
/**
 * Middleware to authenticate requests using JWT
 */
const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'No token provided' });
            return;
        }
        const token = authHeader.substring(7); // Remove 'Bearer ' prefix
        const decoded = (0, jwt_1.verifyToken)(token);
        req.user = decoded;
        next();
    }
    catch (error) {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
};
exports.authenticate = authenticate;
/**
 * Middleware to check if user has specific role
 */
const requireRole = (role) => {
    return (req, res, next) => {
        const user = req.user;
        if (!user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        if (user.role !== role) {
            res.status(403).json({ error: 'Insufficient permissions' });
            return;
        }
        next();
    };
};
exports.requireRole = requireRole;
/**
 * Optional authentication - attaches user if token is valid but doesn't require it
 */
const optionalAuth = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            const decoded = (0, jwt_1.verifyToken)(token);
            req.user = decoded;
        }
    }
    catch (error) {
        // Silently fail for optional auth
    }
    next();
};
exports.optionalAuth = optionalAuth;
//# sourceMappingURL=auth.js.map