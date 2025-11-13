import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { User, Receipt, Withdrawal } from '../models';
import { AuthorizationError, NotFoundError } from '../utils/errors';
import { Op } from 'sequelize';

const router = Router();

// Middleware to check admin role
const requireAdmin = (req: AuthRequest, res: Response, next: Function) => {
  if (req.user?.role !== 'admin' && req.user?.role !== 'business') {
    throw new AuthorizationError('Admin access required');
  }
  next();
};

/**
 * GET /api/admin/stats
 * Get platform statistics
 */
router.get('/stats', authenticate as any, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const [
      totalUsers,
      totalReceipts,
      pendingReceipts,
      approvedReceipts,
      rejectedReceipts,
      totalWithdrawals,
      pendingWithdrawals,
    ] = await Promise.all([
      User.count(),
      Receipt.count(),
      Receipt.count({ where: { status: 'pending' } }),
      Receipt.count({ where: { status: 'approved' } }),
      Receipt.count({ where: { status: 'rejected' } }),
      Withdrawal.count(),
      Withdrawal.count({ where: { status: 'pending' } }),
    ]);

    // Calculate total earnings
    const receipts = await Receipt.findAll({
      where: { status: 'approved' },
      attributes: ['earnings'],
    });
    const totalEarnings = receipts.reduce((sum, r) => sum + parseFloat(String(r.earnings || 0)), 0);

    // Calculate total payouts
    const withdrawals = await Withdrawal.findAll({
      where: { status: 'completed' },
      attributes: ['amount'],
    });
    const totalPayouts = withdrawals.reduce((sum, w) => sum + parseFloat(String(w.amount)), 0);

    res.json({
      users: {
        total: totalUsers,
      },
      receipts: {
        total: totalReceipts,
        pending: pendingReceipts,
        approved: approvedReceipts,
        rejected: rejectedReceipts,
      },
      withdrawals: {
        total: totalWithdrawals,
        pending: pendingWithdrawals,
      },
      financials: {
        totalEarnings: totalEarnings.toFixed(2),
        totalPayouts: totalPayouts.toFixed(2),
        platformRevenue: (totalEarnings * 0.05).toFixed(2), // 5% platform fee
      },
    });
  } catch (error: any) {
    console.error('Admin stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

/**
 * GET /api/admin/receipts
 * Get all receipts with filters
 */
router.get('/receipts', authenticate as any, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const {
      status,
      limit = 50,
      offset = 0,
      userId,
      startDate,
      endDate,
    } = req.query;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (userId) {
      where.userId = userId;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt[Op.gte] = new Date(startDate as string);
      }
      if (endDate) {
        where.createdAt[Op.lte] = new Date(endDate as string);
      }
    }

    const { rows: receipts, count } = await Receipt.findAndCountAll({
      where,
      include: [{
        model: User,
        attributes: ['id', 'email', 'firstName', 'lastName'],
      }],
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
      order: [['createdAt', 'DESC']],
    });

    res.json({
      receipts,
      total: count,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    });
  } catch (error: any) {
    console.error('Admin receipts error:', error);
    res.status(500).json({ error: 'Failed to fetch receipts' });
  }
});

/**
 * PATCH /api/admin/receipts/:id/approve
 * Approve a receipt
 */
router.patch('/receipts/:id/approve', authenticate as any, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { earnings } = req.body;

    const receipt = await Receipt.findByPk(id);

    if (!receipt) {
      throw new NotFoundError('Receipt not found');
    }

    if (receipt.status !== 'pending') {
      return res.status(400).json({ error: 'Receipt is not pending' });
    }

    // Update receipt
    await receipt.update({
      status: 'approved',
      earnings: earnings || receipt.earnings,
      processedAt: new Date(),
    });

    // Update user balance
    const user = await User.findByPk(receipt.userId);
    if (user) {
      const earningsAmount = parseFloat(earnings || receipt.earnings || '0');
      await user.update({
        availableBalance: parseFloat(String(user.availableBalance)) + earningsAmount,
        totalEarnings: parseFloat(String(user.totalEarnings)) + earningsAmount,
        receiptsUploaded: user.receiptsUploaded + 1,
      });
    }

    res.json({
      message: 'Receipt approved',
      receipt,
    });
  } catch (error: any) {
    console.error('Approve receipt error:', error);
    res.status(500).json({ error: 'Failed to approve receipt' });
  }
});

/**
 * PATCH /api/admin/receipts/:id/reject
 * Reject a receipt
 */
router.patch('/receipts/:id/reject', authenticate as any, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const receipt = await Receipt.findByPk(id);

    if (!receipt) {
      throw new NotFoundError('Receipt not found');
    }

    if (receipt.status !== 'pending') {
      return res.status(400).json({ error: 'Receipt is not pending' });
    }

    await receipt.update({
      status: 'rejected',
      rejectionReason: reason || 'Receipt did not meet quality standards',
      processedAt: new Date(),
    });

    res.json({
      message: 'Receipt rejected',
      receipt,
    });
  } catch (error: any) {
    console.error('Reject receipt error:', error);
    res.status(500).json({ error: 'Failed to reject receipt' });
  }
});

/**
 * GET /api/admin/users
 * Get all users
 */
router.get('/users', authenticate as any, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { limit = 50, offset = 0, search } = req.query;

    const where: any = {};

    if (search) {
      where[Op.or] = [
        { email: { [Op.iLike]: `%${search}%` } },
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { rows: users, count } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
      order: [['createdAt', 'DESC']],
    });

    res.json({
      users,
      total: count,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    });
  } catch (error: any) {
    console.error('Admin users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

/**
 * GET /api/admin/withdrawals
 * Get all withdrawal requests
 */
router.get('/withdrawals', authenticate as any, requireAdmin, async (req: AuthRequest, res: Response) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;

    const where: any = {};

    if (status) {
      where.status = status;
    }

    const { rows: withdrawals, count } = await Withdrawal.findAndCountAll({
      where,
      include: [{
        model: User,
        attributes: ['id', 'email', 'firstName', 'lastName'],
      }],
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
      order: [['createdAt', 'DESC']],
    });

    res.json({
      withdrawals,
      total: count,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    });
  } catch (error: any) {
    console.error('Admin withdrawals error:', error);
    res.status(500).json({ error: 'Failed to fetch withdrawals' });
  }
});

export default router;
