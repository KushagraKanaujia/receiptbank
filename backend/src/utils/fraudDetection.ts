import { Receipt } from '../models';
import { Op } from 'sequelize';
import { extractMetadata, generateImageHash } from './imageStorage';

export interface FraudCheck {
  passed: boolean;
  score: number; // 0-100, higher = more suspicious
  flags: string[];
  reason?: string;
}

/**
 * Comprehensive fraud detection for receipt uploads
 * Based on research: avoid false positives (main user complaint)
 */
export const detectFraud = async (
  userId: string,
  imageBuffer: Buffer,
  metadata?: any
): Promise<FraudCheck> => {
  const flags: string[] = [];
  let score = 0;

  try {
    // 1. Check for duplicate image (perceptual hash)
    const imageHash = await generateImageHash(imageBuffer);
    const duplicateReceipt = await Receipt.findOne({
      where: { imageHash, status: { [Op.ne]: 'rejected' } },
    });

    if (duplicateReceipt) {
      if (duplicateReceipt.userId === userId) {
        flags.push('duplicate_self');
        score += 80; // High score = likely fraud
      } else {
        flags.push('duplicate_other_user');
        score += 100; // Definite fraud
      }
    }

    // 2. Velocity check (max 20 receipts per day)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const receiptsToday = await Receipt.count({
      where: {
        userId,
        createdAt: { [Op.gte]: today },
      },
    });

    if (receiptsToday >= 20) {
      flags.push('velocity_limit_exceeded');
      score += 60;
    } else if (receiptsToday >= 15) {
      flags.push('high_velocity');
      score += 30;
    }

    // 3. Rapid submission check (multiple uploads within 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const recentReceipts = await Receipt.count({
      where: {
        userId,
        createdAt: { [Op.gte]: fiveMinutesAgo },
      },
    });

    if (recentReceipts >= 5) {
      flags.push('rapid_submission');
      score += 40;
    }

    // 4. EXIF metadata analysis
    if (metadata) {
      const imageMetadata = await extractMetadata(imageBuffer);

      // Check for edited images (no EXIF data often means Photoshop)
      if (!imageMetadata?.exif && imageMetadata?.format === 'jpeg') {
        flags.push('missing_exif');
        score += 20;
      }

      // Check for suspicious dimensions (too perfect = screenshot?)
      if (imageMetadata?.width === imageMetadata?.height) {
        flags.push('square_image');
        score += 15;
      }

      // Very low resolution = likely screenshot of screenshot
      if (imageMetadata && imageMetadata.width && imageMetadata.height) {
        const pixels = imageMetadata.width * imageMetadata.height;
        if (pixels < 200000) {
          // Less than 0.2MP
          flags.push('low_resolution');
          score += 25;
        }
      }
    }

    // 5. Historical pattern analysis
    const totalReceipts = await Receipt.count({ where: { userId } });
    const rejectedReceipts = await Receipt.count({
      where: { userId, status: 'rejected' },
    });

    if (totalReceipts > 10 && rejectedReceipts / totalReceipts > 0.3) {
      flags.push('high_rejection_rate');
      score += 50;
    }

    // 6. New account with high activity (suspicious)
    const userReceipts = await Receipt.findAll({
      where: { userId },
      order: [['createdAt', 'ASC']],
      limit: 1,
    });

    if (userReceipts.length > 0) {
      const firstUpload = userReceipts[0].createdAt;
      const hoursSinceFirstUpload = (Date.now() - firstUpload.getTime()) / (1000 * 60 * 60);

      if (hoursSinceFirstUpload < 24 && receiptsToday >= 10) {
        flags.push('new_account_high_activity');
        score += 45;
      }
    }

    // Decision logic: Be lenient to avoid false positives
    const passed = score < 70; // Only block if score is 70+

    return {
      passed,
      score,
      flags,
      reason: passed
        ? undefined
        : `Suspicious activity detected (score: ${score}). ${flags.join(', ')}`,
    };
  } catch (error: any) {
    console.error('Fraud detection error:', error);
    // On error, allow upload but log the issue
    return {
      passed: true,
      score: 0,
      flags: ['fraud_check_error'],
    };
  }
};

/**
 * Flag suspicious receipt for manual review
 */
export const flagForReview = async (receiptId: string, reason: string): Promise<void> => {
  try {
    await Receipt.update(
      {
        status: 'pending',
        rejectionReason: `Flagged for review: ${reason}`,
      },
      { where: { id: receiptId } }
    );
  } catch (error: any) {
    console.error('Error flagging receipt:', error);
  }
};

/**
 * Check if user should be rate-limited
 */
export const shouldRateLimit = async (userId: string): Promise<boolean> => {
  try {
    // Check daily limit
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const receiptsToday = await Receipt.count({
      where: {
        userId,
        createdAt: { [Op.gte]: today },
      },
    });

    return receiptsToday >= 20;
  } catch (error) {
    console.error('Rate limit check error:', error);
    return false; // On error, don't rate limit
  }
};

/**
 * Calculate user trust score (0-100, higher = more trustworthy)
 */
export const calculateTrustScore = async (userId: string): Promise<number> => {
  try {
    const totalReceipts = await Receipt.count({ where: { userId } });
    const approvedReceipts = await Receipt.count({
      where: { userId, status: 'approved' },
    });
    const rejectedReceipts = await Receipt.count({
      where: { userId, status: 'rejected' },
    });

    if (totalReceipts === 0) return 50; // New users start at 50

    const approvalRate = approvedReceipts / totalReceipts;
    const rejectionRate = rejectedReceipts / totalReceipts;

    let score = 50;
    score += approvalRate * 40; // Up to +40 for high approval rate
    score -= rejectionRate * 60; // Up to -60 for high rejection rate

    // Bonus for consistent users
    if (totalReceipts > 50) score += 10;
    if (totalReceipts > 100) score += 10;

    return Math.max(0, Math.min(100, Math.round(score)));
  } catch (error) {
    return 50; // Default to neutral score on error
  }
};
