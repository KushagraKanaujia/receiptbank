"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const models_1 = require("../models");
const auth_1 = require("../middleware/auth");
const joi_1 = __importDefault(require("joi"));
const router = (0, express_1.Router)();
// Validation schemas
const accessRequestSchema = joi_1.default.object({
    userId: joi_1.default.string().uuid().required(),
    providers: joi_1.default.array().items(joi_1.default.string()).min(1).required(),
    dataFields: joi_1.default.array().items(joi_1.default.string()).min(1).required(),
    startDate: joi_1.default.date().optional(),
    endDate: joi_1.default.date().optional(),
    accessFrequency: joi_1.default.string()
        .valid('realtime', 'hourly', 'daily', 'weekly', 'monthly')
        .required(),
    pricingModel: joi_1.default.string().valid('one_time', 'monthly', 'per_request').required(),
    price: joi_1.default.number().min(0).required(),
    description: joi_1.default.string().optional(),
});
/**
 * POST /api/marketplace/request-access
 * Business requests access to user data
 */
router.post('/request-access', auth_1.authenticate, (0, auth_1.requireRole)('business'), async (req, res) => {
    try {
        const { error, value } = accessRequestSchema.validate(req.body);
        if (error) {
            res.status(400).json({ error: error.details[0].message });
            return;
        }
        const businessId = req.user.userId;
        const { userId, providers, dataFields, startDate, endDate, accessFrequency, pricingModel, price, description, } = value;
        // Verify target user exists
        const user = await models_1.User.findByPk(userId);
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        // Create access permission request
        const permission = await models_1.DataAccessPermission.create({
            userId,
            businessId,
            providers: providers,
            dataFields,
            startDate,
            endDate,
            accessFrequency,
            pricingModel,
            price,
            status: 'pending',
            metadata: { description },
        });
        // Log the request
        await models_1.AuditLog.create({
            userId,
            businessId,
            action: 'permission_granted',
            resource: `permission:${permission.id}`,
            metadata: { providers, price },
        });
        res.status(201).json({
            message: 'Access request created successfully',
            permission,
        });
    }
    catch (error) {
        console.error('Request access error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
/**
 * GET /api/marketplace/my-requests
 * Get access requests for businesses (sent) or users (received)
 */
router.get('/my-requests', auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.user.userId;
        const role = req.user.role;
        const status = req.query.status;
        const where = {};
        if (status) {
            where.status = status;
        }
        // If business, get requests they sent; if user, get requests they received
        if (role === 'business') {
            where.businessId = userId;
        }
        else {
            where.userId = userId;
        }
        const permissions = await models_1.DataAccessPermission.findAll({
            where,
            include: [
                {
                    model: models_1.User,
                    as: 'user',
                    attributes: ['id', 'email', 'firstName', 'lastName'],
                },
                {
                    model: models_1.User,
                    as: 'business',
                    attributes: ['id', 'email', 'firstName', 'lastName'],
                },
            ],
            order: [['createdAt', 'DESC']],
        });
        res.json({ permissions });
    }
    catch (error) {
        console.error('Get requests error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
/**
 * PATCH /api/marketplace/permissions/:id/approve
 * User approves a data access request
 */
router.patch('/permissions/:id/approve', auth_1.authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        const permission = await models_1.DataAccessPermission.findByPk(id);
        if (!permission) {
            res.status(404).json({ error: 'Permission not found' });
            return;
        }
        if (permission.userId !== userId) {
            res.status(403).json({ error: 'Unauthorized' });
            return;
        }
        if (permission.status !== 'pending') {
            res.status(400).json({ error: 'Permission already processed' });
            return;
        }
        await permission.update({
            status: 'approved',
            approvedAt: new Date(),
        });
        // Create a transaction for the payment
        const platformFeePercent = 0.2; // 20% platform fee
        const platformFee = parseFloat(permission.price.toString()) * platformFeePercent;
        const netAmount = parseFloat(permission.price.toString()) - platformFee;
        await models_1.Transaction.create({
            userId,
            businessId: permission.businessId,
            permissionId: permission.id,
            type: 'payment',
            status: 'pending',
            amount: parseFloat(permission.price.toString()),
            platformFee,
            netAmount,
            currency: permission.currency,
            description: `Data access payment from ${permission.businessId}`,
        });
        // Log the approval
        await models_1.AuditLog.create({
            userId,
            businessId: permission.businessId,
            action: 'permission_granted',
            resource: `permission:${permission.id}`,
            metadata: { providers: permission.providers },
        });
        res.json({ message: 'Permission approved', permission });
    }
    catch (error) {
        console.error('Approve permission error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
/**
 * PATCH /api/marketplace/permissions/:id/reject
 * User rejects a data access request
 */
router.patch('/permissions/:id/reject', auth_1.authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        const permission = await models_1.DataAccessPermission.findByPk(id);
        if (!permission) {
            res.status(404).json({ error: 'Permission not found' });
            return;
        }
        if (permission.userId !== userId) {
            res.status(403).json({ error: 'Unauthorized' });
            return;
        }
        if (permission.status !== 'pending') {
            res.status(400).json({ error: 'Permission already processed' });
            return;
        }
        await permission.update({ status: 'rejected' });
        res.json({ message: 'Permission rejected', permission });
    }
    catch (error) {
        console.error('Reject permission error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
/**
 * DELETE /api/marketplace/permissions/:id/revoke
 * User revokes previously granted access
 */
router.delete('/permissions/:id/revoke', auth_1.authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        const permission = await models_1.DataAccessPermission.findByPk(id);
        if (!permission) {
            res.status(404).json({ error: 'Permission not found' });
            return;
        }
        if (permission.userId !== userId) {
            res.status(403).json({ error: 'Unauthorized' });
            return;
        }
        if (permission.status !== 'approved') {
            res.status(400).json({ error: 'Can only revoke approved permissions' });
            return;
        }
        await permission.update({
            status: 'revoked',
            revokedAt: new Date(),
        });
        // Log the revocation
        await models_1.AuditLog.create({
            userId,
            businessId: permission.businessId,
            action: 'permission_revoked',
            resource: `permission:${permission.id}`,
            metadata: { providers: permission.providers },
        });
        res.json({ message: 'Permission revoked', permission });
    }
    catch (error) {
        console.error('Revoke permission error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
/**
 * GET /api/marketplace/earnings
 * Get user's earnings from data sales
 */
router.get('/earnings', auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.user.userId;
        const transactions = await models_1.Transaction.findAll({
            where: { userId, type: 'payment' },
            order: [['createdAt', 'DESC']],
        });
        const totalEarnings = transactions.reduce((sum, t) => sum + parseFloat(t.netAmount.toString()), 0);
        const pendingEarnings = transactions
            .filter((t) => t.status === 'pending')
            .reduce((sum, t) => sum + parseFloat(t.netAmount.toString()), 0);
        const completedEarnings = transactions
            .filter((t) => t.status === 'completed')
            .reduce((sum, t) => sum + parseFloat(t.netAmount.toString()), 0);
        res.json({
            totalEarnings,
            pendingEarnings,
            completedEarnings,
            transactions,
        });
    }
    catch (error) {
        console.error('Get earnings error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=marketplace.js.map