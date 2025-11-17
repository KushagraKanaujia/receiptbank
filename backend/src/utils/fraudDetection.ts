import { Receipt } from '../models';
import { Op } from 'sequelize';
import { extractMetadata, generateImageHash } from './imageStorage';

export interface FraudCheck {
  passed: boolean;
  score: number; // 0-100, higher = more suspicious
  flags: string[];
  reason?: string;
}

export const detectFraud = async (
  userId: string,
  imageBuffer: Buffer,
  metadata?: any
): Promise<FraudCheck> => {
  const flags: string[] = [];
  let score = 0;

  try {
    const imageHash = await generateImageHash(imageBuffer);
    const duplicateReceipt = await Receipt.findOne({
      where: { imageHash, status: { [Op.ne]: 'rejected' } },
    });

    if (duplicateReceipt) {
      if (duplicateReceipt.userId === userId) {
        flags.push('duplicate_self');
        score += 80;
      } else {
        flags.push('duplicate_other_user');
        score += 100;
      }
    }
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

    if (metadata) {
      const imageMetadata = await extractMetadata(imageBuffer);

      if (!imageMetadata?.exif && imageMetadata?.format === 'jpeg') {
        flags.push('missing_exif');
        score += 20;
      }

      if (imageMetadata?.width === imageMetadata?.height) {
        flags.push('square_image');
        score += 15;
      }

      if (imageMetadata && imageMetadata.width && imageMetadata.height) {
        const pixels = imageMetadata.width * imageMetadata.height;
        if (pixels < 200000) {
          flags.push('low_resolution');
          score += 25;
        }
      }
    }
    const totalReceipts = await Receipt.count({ where: { userId } });
    const rejectedReceipts = await Receipt.count({
      where: { userId, status: 'rejected' },
    });

    if (totalReceipts > 10 && rejectedReceipts / totalReceipts > 0.3) {
      flags.push('high_rejection_rate');
      score += 50;
    }

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

    const passed = score < 70;

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
    return {
      passed: true,
      score: 0,
      flags: ['fraud_check_error'],
    };
  }
};

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

export const shouldRateLimit = async (userId: string): Promise<boolean> => {
  try {
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
    return false;
  }
};

export const calculateTrustScore = async (userId: string): Promise<number> => {
  try {
    const totalReceipts = await Receipt.count({ where: { userId } });
    const approvedReceipts = await Receipt.count({
      where: { userId, status: 'approved' },
    });
    const rejectedReceipts = await Receipt.count({
      where: { userId, status: 'rejected' },
    });

    if (totalReceipts === 0) return 50;

    const approvalRate = approvedReceipts / totalReceipts;
    const rejectionRate = rejectedReceipts / totalReceipts;

    let score = 50;
    score += approvalRate * 40;
    score -= rejectionRate * 60;

    if (totalReceipts > 50) score += 10;
    if (totalReceipts > 100) score += 10;

    return Math.max(0, Math.min(100, Math.round(score)));
  } catch (error) {
    return 50;
  }
};
