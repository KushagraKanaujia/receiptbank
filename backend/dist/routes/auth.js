"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const models_1 = require("../models");
const jwt_1 = require("../utils/jwt");
const encryption_1 = require("../utils/encryption");
const rateLimiter_1 = require("../middleware/rateLimiter");
const joi_1 = __importDefault(require("joi"));
const router = (0, express_1.Router)();
// Validation schemas
const registerSchema = joi_1.default.object({
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().min(8).required(),
    firstName: joi_1.default.string().optional(),
    lastName: joi_1.default.string().optional(),
    role: joi_1.default.string().valid('user', 'business').default('user'),
});
const loginSchema = joi_1.default.object({
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().required(),
});
/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', rateLimiter_1.authLimiter, async (req, res) => {
    try {
        const { error, value } = registerSchema.validate(req.body);
        if (error) {
            res.status(400).json({ error: error.details[0].message });
            return;
        }
        const { email, password, firstName, lastName, role } = value;
        // Check if user already exists
        const existingUser = await models_1.User.findOne({ where: { email } });
        if (existingUser) {
            res.status(409).json({ error: 'User already exists' });
            return;
        }
        // Hash password and create user
        const hashedPassword = await (0, encryption_1.hashPassword)(password);
        const user = await models_1.User.create({
            email,
            password: hashedPassword,
            firstName,
            lastName,
            role,
        });
        // Generate JWT token
        const token = (0, jwt_1.generateToken)({
            userId: user.id,
            email: user.email,
            role: user.role,
        });
        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
            },
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
/**
 * POST /api/auth/login
 * Login user
 */
router.post('/login', rateLimiter_1.authLimiter, async (req, res) => {
    try {
        const { error, value } = loginSchema.validate(req.body);
        if (error) {
            res.status(400).json({ error: error.details[0].message });
            return;
        }
        const { email, password } = value;
        // Find user
        const user = await models_1.User.findOne({ where: { email } });
        if (!user || !user.password) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }
        // Verify password
        const isValidPassword = await (0, encryption_1.comparePassword)(password, user.password);
        if (!isValidPassword) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }
        // Generate JWT token
        const token = (0, jwt_1.generateToken)({
            userId: user.id,
            email: user.email,
            role: user.role,
        });
        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
            },
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
/**
 * GET /api/auth/me
 * Get current user profile
 */
router.get('/me', async (req, res) => {
    try {
        // Note: This requires authenticate middleware to be applied in index.ts
        const userId = req.user?.userId;
        if (!userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const user = await models_1.User.findByPk(userId, {
            attributes: { exclude: ['password'] },
        });
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        res.json({ user });
    }
    catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map