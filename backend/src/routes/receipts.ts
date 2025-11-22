import express, { Response } from 'express';
import { Receipt, User, Badge, DailyChallenge } from '../models';
import { authenticate, AuthRequest } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { uploadImage, generateImageHash } from '../utils/imageStorage';
import { extractReceiptData } from '../utils/ocr';
import { detectFraud, shouldRateLimit } from '../utils/fraudDetection';
import { ocrService } from '../services/ocrService';
import { Op } from 'sequelize';

const router = express.Router();

// Preview receipt and calculate potential earnings (no save)
router.post(
  '/preview',
  authenticate as any,
  upload.single('receipt'),
  async (req: AuthRequest, res: Response) => {
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({ error: 'Receipt image is required' });
      }

      // Validate receipt
      const validation = await ocrService.validateReceipt(file.buffer);
      if (!validation.valid) {
        return res.status(400).json({
          valid: false,
          message: validation.reason,
        });
      }

      // Process receipt
      const ocrData = await ocrService.processReceipt(file.buffer);
      const earnings = ocrData.amount && ocrData.amount > 0
        ? ocrService.calculateEarnings(ocrData.amount, ocrData.category || 'retail')
        : 0.10;

      res.json({
        valid: true,
        preview: {
          merchant: ocrData.merchant,
          amount: ocrData.amount,
          category: ocrData.category,
          estimatedEarnings: earnings,
          confidence: ocrData.confidence,
          date: ocrData.date,
        },
        message: `You'll earn approximately $${earnings.toFixed(2)} from this receipt`,
      });
    } catch (error: any) {
      console.error('Error previewing receipt:', error);
      res.status(500).json({ error: 'Failed to preview receipt', details: error.message });
    }
  }
);

// Upload receipt with image, OCR, and fraud detection
router.post(
  '/upload',
  authenticate as any,
  upload.single('receipt'),
  async (req: AuthRequest, res: Response) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // file was uploaded
      const file = req.file;
      if (!file) {
        return res.status(400).json({ error: 'Receipt image is required' });
      }

      // Rate limiting check
      const isRateLimited = await shouldRateLimit(userId);
      if (isRateLimited) {
        return res.status(429).json({
          error: 'Daily upload limit reached',
          message: 'You can upload a maximum of 20 receipts per day. Please try again tomorrow.',
        });
      }

      // Fraud detection
      const fraudCheck = await detectFraud(userId, file.buffer);
      if (!fraudCheck.passed) {
        return res.status(403).json({
          error: 'Upload blocked',
          message: fraudCheck.reason,
          fraudScore: fraudCheck.score,
        });
      }

      // image to Cloudflare R2
      const imageUrl = await uploadImage(file.buffer, file.originalname);

      // image hash for duplicate detection
      const imageHash = await generateImageHash(file.buffer);

      // Validate receipt image quality first
      const validation = await ocrService.validateReceipt(file.buffer);
      if (!validation.valid) {
        return res.status(400).json({
          error: 'Invalid receipt',
          message: validation.reason,
        });
      }

      // Extract receipt data using OCR
      let ocrData = null;
      let merchant = 'Unknown';
      let category = 'retail';
      let amount = 0;

      try {
        ocrData = await ocrService.processReceipt(file.buffer);
        merchant = ocrData.merchant || 'Unknown';
        category = ocrData.category || 'retail';
        amount = ocrData.amount || 0;

        console.log('OCR Success:', {
          merchant,
          category,
          amount,
          confidence: ocrData.confidence,
        });
      } catch (error) {
        console.error('OCR processing failed:', error);
        // Continue with defaults if OCR fails
      }

      // Calculate earnings based on amount and category
      let earnings = 0.10; // Default fallback
      if (amount > 0) {
        earnings = ocrService.calculateEarnings(amount, category);
      } else {
        // Fallback to category-based estimates if no amount detected
        if (category === 'electronics') {
          earnings = 2.00;
        } else if (category === 'grocery') {
          earnings = 0.12;
        } else if (category === 'restaurant') {
          earnings = 0.05;
        } else if (category === 'retail') {
          earnings = 0.15;
        }
      }

      // fraud penalty (reduce earnings if suspicious but not blocked)
      if (fraudCheck.score > 40) {
        earnings = earnings * 0.5; // 50% penalty for suspicious activity
      }

      // receipt
      const receipt = await Receipt.create({
        userId,
        imageUrl,
        imageHash,
        merchant,
        category,
        amount,
        earnings,
        status: fraudCheck.score > 50 ? 'pending' : 'approved',
        ocrData,
        metadata: {
          fraudScore: fraudCheck.score,
          fraudFlags: fraudCheck.flags,
          ocrConfidence: ocrData?.confidence,
        },
      });

    // user stats
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

      // level
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

      // daily challenge progress
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
          // reward
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

// all receipts for user
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

// receipt statistics
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

// user badges
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

// Public stats dashboard (no auth required)
router.get('/public-stats', async (req, res: Response) => {
  try {
    const totalUsers = await User.count();
    const totalReceipts = await Receipt.count({ where: { status: 'approved' } });
    const totalEarningsPaid = await User.sum('totalEarnings');
    const receiptsToday = await Receipt.count({
      where: {
        createdAt: {
          [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0)),
        },
        status: 'approved',
      },
    });

    // Recent receipts (anonymized)
    const recentReceipts = await Receipt.findAll({
      where: { status: 'approved' },
      order: [['createdAt', 'DESC']],
      limit: 10,
      attributes: ['category', 'earnings', 'createdAt'],
    });

    // Category breakdown
    const categoryStats = await Receipt.findAll({
      where: { status: 'approved' },
      attributes: [
        'category',
        [Op.fn('COUNT', Op.col('id')), 'count'],
        [Op.fn('SUM', Op.col('earnings')), 'totalEarnings'],
      ],
      group: ['category'],
      raw: true,
    });

    res.json({
      platform: {
        totalUsers,
        totalReceipts,
        totalEarningsPaid: Math.round(totalEarningsPaid * 100) / 100,
        receiptsToday,
      },
      recentActivity: recentReceipts.map((r: any) => ({
        category: r.category,
        earnings: r.earnings,
        timeAgo: getTimeAgo(r.createdAt),
      })),
      categories: categoryStats,
    });
  } catch (error: any) {
    console.error('Error fetching public stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Helper function for time ago
function getTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);

  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// Daily challenges
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
