import { Router, Response } from 'express';
import { DataAccessPermission, User, Transaction, AuditLog } from '../models';
import { authenticate, AuthRequest, requireRole } from '../middleware/auth';
import { businessDataLimiter } from '../middleware/rateLimiter';
import { ServiceProvider } from '../models/ConnectedService';
import Joi from 'joi';

const router = Router();

// Validation schemas
const accessRequestSchema = Joi.object({
  userId: Joi.string().uuid().required(),
  providers: Joi.array().items(Joi.string()).min(1).required(),
  dataFields: Joi.array().items(Joi.string()).min(1).required(),
  startDate: Joi.date().optional(),
  endDate: Joi.date().optional(),
  accessFrequency: Joi.string()
    .valid('realtime', 'hourly', 'daily', 'weekly', 'monthly')
    .required(),
  pricingModel: Joi.string().valid('one_time', 'monthly', 'per_request').required(),
  price: Joi.number().min(0).required(),
  description: Joi.string().optional(),
});

/**
 * POST /api/marketplace/request-access
 * Business requests access to user data
 */
router.post(
  '/request-access',
  authenticate,
  requireRole('business'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { error, value } = accessRequestSchema.validate(req.body);
      if (error) {
        res.status(400).json({ error: error.details[0].message });
        return;
      }

      const businessId = req.user!.userId;
      const {
        userId,
        providers,
        dataFields,
        startDate,
        endDate,
        accessFrequency,
        pricingModel,
        price,
        description,
      } = value;

      // Verify target user exists
      const user = await User.findByPk(userId);
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      // Create access permission request
      const permission = await DataAccessPermission.create({
        userId,
        businessId,
        providers: providers as ServiceProvider[],
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
      await AuditLog.create({
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
    } catch (error: any) {
      console.error('Request access error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * GET /api/marketplace/my-requests
 * Get access requests for businesses (sent) or users (received)
 */
router.get('/my-requests', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const role = req.user!.role;
    const status = req.query.status as string | undefined;

    const where: any = {};
    if (status) {
      where.status = status;
    }

    // If business, get requests they sent; if user, get requests they received
    if (role === 'business') {
      where.businessId = userId;
    } else {
      where.userId = userId;
    }

    const permissions = await DataAccessPermission.findAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'firstName', 'lastName'],
        },
        {
          model: User,
          as: 'business',
          attributes: ['id', 'email', 'firstName', 'lastName'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json({ permissions });
  } catch (error: any) {
    console.error('Get requests error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PATCH /api/marketplace/permissions/:id/approve
 * User approves a data access request
 */
router.patch(
  '/permissions/:id/approve',
  authenticate,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;

      const permission = await DataAccessPermission.findByPk(id);

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

      await Transaction.create({
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
      await AuditLog.create({
        userId,
        businessId: permission.businessId,
        action: 'permission_granted',
        resource: `permission:${permission.id}`,
        metadata: { providers: permission.providers },
      });

      res.json({ message: 'Permission approved', permission });
    } catch (error: any) {
      console.error('Approve permission error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * PATCH /api/marketplace/permissions/:id/reject
 * User rejects a data access request
 */
router.patch(
  '/permissions/:id/reject',
  authenticate,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;

      const permission = await DataAccessPermission.findByPk(id);

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
    } catch (error: any) {
      console.error('Reject permission error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * DELETE /api/marketplace/permissions/:id/revoke
 * User revokes previously granted access
 */
router.delete(
  '/permissions/:id/revoke',
  authenticate,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;

      const permission = await DataAccessPermission.findByPk(id);

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
      await AuditLog.create({
        userId,
        businessId: permission.businessId,
        action: 'permission_revoked',
        resource: `permission:${permission.id}`,
        metadata: { providers: permission.providers },
      });

      res.json({ message: 'Permission revoked', permission });
    } catch (error: any) {
      console.error('Revoke permission error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * GET /api/marketplace/earnings
 * Get user's earnings from data sales
 */
router.get('/earnings', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;

    const transactions = await Transaction.findAll({
      where: { userId, type: 'payment' },
      order: [['createdAt', 'DESC']],
    });

    const totalEarnings = transactions.reduce(
      (sum, t) => sum + parseFloat(t.netAmount.toString()),
      0
    );

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
  } catch (error: any) {
    console.error('Get earnings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
