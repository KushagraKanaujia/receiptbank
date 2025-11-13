import express, { Request, Response } from 'express';
import { User, Withdrawal } from '../models';
import { authenticate } from '../middleware/auth';
import { sendPayout, validatePayPalEmail } from '../utils/paypal';
import { Op } from 'sequelize';

const router = express.Router();

interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role?: 'user' | 'business';
  };
}

// Request a withdrawal
router.post('/request', authenticate as any, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { amount, paymentMethod, paymentEmail } = req.body;

    // Validate inputs
    if (!amount || !paymentMethod || !paymentEmail) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['amount', 'paymentMethod', 'paymentEmail']
      });
    }

    // Validate amount
    const withdrawalAmount = parseFloat(amount);
    if (isNaN(withdrawalAmount) || withdrawalAmount < 10) {
      return res.status(400).json({
        error: 'Invalid amount',
        message: 'Minimum withdrawal amount is $10.00'
      });
    }

    // Validate payment method
    const validMethods = ['paypal', 'venmo', 'bank_transfer'];
    if (!validMethods.includes(paymentMethod)) {
      return res.status(400).json({
        error: 'Invalid payment method',
        message: 'Supported methods: paypal, venmo, bank_transfer'
      });
    }

    // Validate email
    if (!validatePayPalEmail(paymentEmail)) {
      return res.status(400).json({
        error: 'Invalid email address'
      });
    }

    // Get user and check balance
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const availableBalance = parseFloat(user.availableBalance.toString());
    if (availableBalance < withdrawalAmount) {
      return res.status(400).json({
        error: 'Insufficient balance',
        available: availableBalance,
        requested: withdrawalAmount,
      });
    }

    // Check for pending withdrawals
    const pendingWithdrawals = await Withdrawal.count({
      where: {
        userId,
        status: { [Op.in]: ['pending', 'processing'] },
      },
    });

    if (pendingWithdrawals > 0) {
      return res.status(400).json({
        error: 'You already have a pending withdrawal',
        message: 'Please wait for your current withdrawal to complete before requesting another.'
      });
    }

    // Create withdrawal request
    const withdrawal = await Withdrawal.create({
      userId,
      amount: withdrawalAmount,
      paymentMethod,
      paymentEmail,
      status: 'pending',
    });

    // Process payout immediately via PayPal (only for PayPal/Venmo)
    if (paymentMethod === 'paypal' || paymentMethod === 'venmo') {
      await withdrawal.update({ status: 'processing' });

      const payoutResult = await sendPayout({
        recipientEmail: paymentEmail,
        amount: withdrawalAmount,
        senderItemId: withdrawal.id,
        note: `ReceiptBank withdrawal - ${withdrawal.id}`,
      });

      if (payoutResult.success) {
        // Update withdrawal with PayPal details
        await withdrawal.update({
          status: 'completed',
          paypalBatchId: payoutResult.batchId,
          paypalPayoutItemId: payoutResult.payoutItemId,
          transactionId: payoutResult.transactionId,
          processedAt: new Date(),
        });

        // Deduct from user balance
        await user.update({
          availableBalance: availableBalance - withdrawalAmount,
        });

        return res.json({
          success: true,
          withdrawal,
          message: `Your withdrawal of $${withdrawalAmount.toFixed(2)} has been sent to ${paymentEmail}`,
        });
      } else {
        // Payout failed
        await withdrawal.update({
          status: 'failed',
          failureReason: payoutResult.error,
        });

        return res.status(500).json({
          error: 'Payout failed',
          message: payoutResult.error || 'Unable to process your withdrawal at this time. Please try again later.',
          withdrawal,
        });
      }
    } else {
      // For bank_transfer, manual processing required
      return res.json({
        success: true,
        withdrawal,
        message: 'Your withdrawal request has been submitted and will be processed within 3-5 business days.',
      });
    }
  } catch (error: any) {
    console.error('Error requesting withdrawal:', error);
    res.status(500).json({ error: 'Failed to process withdrawal request', details: error.message });
  }
});

// Get withdrawal history
router.get('/', authenticate as any, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { limit = '50', offset = '0', status } = req.query;

    const whereClause: any = { userId };
    if (status) {
      whereClause.status = status;
    }

    const withdrawals = await Withdrawal.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    });

    const total = await Withdrawal.count({ where: { userId } });

    res.json({
      withdrawals,
      total,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    });
  } catch (error: any) {
    console.error('Error fetching withdrawals:', error);
    res.status(500).json({ error: 'Failed to fetch withdrawal history' });
  }
});

// Get specific withdrawal by ID
router.get('/:id', authenticate as any, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;

    const withdrawal = await Withdrawal.findOne({
      where: { id, userId },
    });

    if (!withdrawal) {
      return res.status(404).json({ error: 'Withdrawal not found' });
    }

    res.json({ withdrawal });
  } catch (error: any) {
    console.error('Error fetching withdrawal:', error);
    res.status(500).json({ error: 'Failed to fetch withdrawal' });
  }
});

// Cancel a pending withdrawal
router.post('/:id/cancel', authenticate as any, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { id } = req.params;

    const withdrawal = await Withdrawal.findOne({
      where: { id, userId },
    });

    if (!withdrawal) {
      return res.status(404).json({ error: 'Withdrawal not found' });
    }

    if (withdrawal.status !== 'pending') {
      return res.status(400).json({
        error: 'Cannot cancel withdrawal',
        message: `Only pending withdrawals can be cancelled. Current status: ${withdrawal.status}`
      });
    }

    await withdrawal.update({
      status: 'cancelled',
    });

    res.json({
      success: true,
      message: 'Withdrawal cancelled successfully',
      withdrawal,
    });
  } catch (error: any) {
    console.error('Error cancelling withdrawal:', error);
    res.status(500).json({ error: 'Failed to cancel withdrawal' });
  }
});

// Get withdrawal stats
router.get('/stats/summary', authenticate as any, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const totalWithdrawn = await Withdrawal.sum('amount', {
      where: { userId, status: 'completed' },
    }) || 0;

    const pendingWithdrawals = await Withdrawal.count({
      where: { userId, status: { [Op.in]: ['pending', 'processing'] } },
    });

    const totalWithdrawals = await Withdrawal.count({ where: { userId } });

    res.json({
      availableBalance: user.availableBalance,
      totalEarnings: user.totalEarnings,
      totalWithdrawn: parseFloat(totalWithdrawn.toString()),
      pendingWithdrawals,
      totalWithdrawals,
      minimumWithdrawal: 10.00,
    });
  } catch (error: any) {
    console.error('Error fetching withdrawal stats:', error);
    res.status(500).json({ error: 'Failed to fetch withdrawal statistics' });
  }
});

export default router;
