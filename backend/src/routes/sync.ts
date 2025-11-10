import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import SyncWorker from '../sync/SyncWorker';
import { ConnectedService } from '../models';

const router = Router();

/**
 * POST /api/sync/trigger/:provider
 * Manually trigger sync for a specific provider
 */
router.post(
  '/trigger/:provider',
  authenticate,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { provider } = req.params;
      const userId = req.user!.userId;

      const service = await ConnectedService.findOne({
        where: { userId, provider, isActive: true },
      });

      if (!service) {
        res.status(404).json({ error: 'Service not connected' });
        return;
      }

      await SyncWorker.scheduleSync(userId, service.provider, service.id);

      res.json({ message: 'Sync triggered successfully', provider });
    } catch (error: any) {
      console.error('Trigger sync error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * POST /api/sync/trigger-all
 * Manually trigger sync for all connected services
 */
router.post(
  '/trigger-all',
  authenticate,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user!.userId;

      await SyncWorker.syncAllUserServices(userId);

      res.json({ message: 'Sync triggered for all services' });
    } catch (error: any) {
      console.error('Trigger all sync error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

/**
 * GET /api/sync/status
 * Get sync queue statistics
 */
router.get('/status', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const stats = await SyncWorker.getQueueStats();
    res.json({ stats });
  } catch (error: any) {
    console.error('Get sync status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
