import express, { Request, Response } from 'express';
import { Receipt, User, Badge, DailyChallenge } from '../models';
import { authenticate } from '../middleware/auth';
import { Op } from 'sequelize';

const router = express.Router();

interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role?: 'user' | 'business';
  };
}

// Upload receipt
router.post('/upload', authenticate as any, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { imageUrl, merchant, category, amount } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: 'Image URL is required' });
    }

    // Calculate earnings based on category
    let earnings = 0.10; // Default
    if (category === 'Electronics') {
      earnings = 2.00;
    } else if (category === 'Grocery') {
      earnings = 0.12;
    } else if (category === 'Restaurant') {
      earnings = 0.05;
    } else if (category === 'Retail') {
      earnings = 0.15;
    }

    // Create receipt
    const receipt = await Receipt.create({
      userId,
      imageUrl,
      merchant,
      category,
      amount: amount || 0,
      earnings,
      status: 'approved', // For now, auto-approve
    });

    // Update user stats
    const user = await User.findByPk(userId);
    if (user) {
      const newTotal = parseFloat(user.totalEarnings.toString()) + earnings;
      const newBalance = parseFloat(user.availableBalance.toString()) + earnings;
      const receiptsCount = user.receiptsUploaded + 1;

      // Check streak
      const lastUpload = user.lastUploadDate;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      let newStreak = user.streakCount;

      if (lastUpload) {
        const lastUploadDate = new Date(lastUpload);
        lastUploadDate.setHours(0, 0, 0, 0);
        const diffTime = today.getTime() - lastUploadDate.getTime();
        const diffDays = diffTime / (1000 * 60 * 60 * 24);

        if (diffDays === 1) {
          newStreak += 1;
        } else if (diffDays > 1) {
          newStreak = 1;
        }
      } else {
        newStreak = 1;
      }

      // Determine level
      let level: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' = 'Bronze';
      if (receiptsCount >= 500) level = 'Platinum';
      else if (receiptsCount >= 300) level = 'Gold';
      else if (receiptsCount >= 100) level = 'Silver';

      await user.update({
        totalEarnings: newTotal,
        availableBalance: newBalance,
        receiptsUploaded: receiptsCount,
        streakCount: newStreak,
        level,
        lastUploadDate: new Date(),
      });

      // Check for badge unlocks
      if (newStreak === 5 && !await Badge.findOne({ where: { userId, badgeType: '5_day_streak' } })) {
        await Badge.create({
          userId,
          badgeType: '5_day_streak',
          name: '5 Day Streak',
          description: 'Uploaded receipts for 5 days in a row',
          icon: '🔥',
          unlockedAt: new Date(),
        });
      }

      if (receiptsCount === 100 && !await Badge.findOne({ where: { userId, badgeType: 'century_club' } })) {
        await Badge.create({
          userId,
          badgeType: 'century_club',
          name: 'Century Club',
          description: 'Uploaded 100 receipts',
          icon: '💯',
          unlockedAt: new Date(),
        });
      }

      // Update daily challenge progress
      const activeChallenge = await DailyChallenge.findOne({
        where: {
          userId,
          status: 'active',
          expiresAt: { [Op.gt]: new Date() },
        },
      });

      if (activeChallenge) {
        const newProgress = activeChallenge.currentProgress + 1;
        if (newProgress >= activeChallenge.targetCount) {
          await activeChallenge.update({
            currentProgress: newProgress,
            status: 'completed',
            completedAt: new Date(),
          });
          // Add reward
          await user.update({
            availableBalance: newBalance + parseFloat(activeChallenge.rewardAmount.toString()),
          });
        } else {
          await activeChallenge.update({ currentProgress: newProgress });
        }
      }
    }

    res.json({
      success: true,
      receipt,
      earnings,
      message: `Receipt approved! You earned $${earnings.toFixed(2)}`,
    });
  } catch (error: any) {
    console.error('Error uploading receipt:', error);
    res.status(500).json({ error: 'Failed to upload receipt', details: error.message });
  }
});

// Get all receipts for user
router.get('/', authenticate as any, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const receipts = await Receipt.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit: 100,
    });

    res.json({ receipts });
  } catch (error: any) {
    console.error('Error fetching receipts:', error);
    res.status(500).json({ error: 'Failed to fetch receipts' });
  }
});

// Get receipt statistics
router.get('/stats', authenticate as any, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const totalReceipts = await Receipt.count({ where: { userId } });
    const thisMonthReceipts = await Receipt.count({
      where: {
        userId,
        createdAt: {
          [Op.gte]: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    });

    const categoryBreakdown = await Receipt.findAll({
      where: { userId, status: 'approved' },
      attributes: ['category'],
      raw: true,
    });

    const categoryCounts: { [key: string]: number } = {};
    categoryBreakdown.forEach((r: any) => {
      const cat = r.category || 'Other';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    res.json({
      totalEarnings: user.totalEarnings,
      availableBalance: user.availableBalance,
      streakCount: user.streakCount,
      level: user.level,
      receiptsUploaded: user.receiptsUploaded,
      totalReceipts,
      thisMonthReceipts,
      categoryBreakdown: categoryCounts,
    });
  } catch (error: any) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Get user badges
router.get('/badges', authenticate as any, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const badges = await Badge.findAll({
      where: { userId },
      order: [['unlockedAt', 'DESC']],
    });

    res.json({ badges });
  } catch (error: any) {
    console.error('Error fetching badges:', error);
    res.status(500).json({ error: 'Failed to fetch badges' });
  }
});

// Get daily challenges
router.get('/challenges', authenticate as any, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const challenges = await DailyChallenge.findAll({
      where: {
        userId,
        status: 'active',
        expiresAt: { [Op.gt]: new Date() },
      },
      order: [['createdAt', 'DESC']],
    });

    // If no active challenge, create one
    if (challenges.length === 0) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(23, 59, 59, 999);

      const newChallenge = await DailyChallenge.create({
        userId,
        challengeType: 'daily_upload',
        title: 'Upload 3 receipts today',
        description: 'Upload 3 receipts to earn a bonus',
        targetCount: 3,
        currentProgress: 0,
        rewardAmount: 0.50,
        status: 'active',
        expiresAt: tomorrow,
      });

      challenges.push(newChallenge);
    }

    res.json({ challenges });
  } catch (error: any) {
    console.error('Error fetching challenges:', error);
    res.status(500).json({ error: 'Failed to fetch challenges' });
  }
});

export default router;
