"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const SyncWorker_1 = __importDefault(require("../sync/SyncWorker"));
const models_1 = require("../models");
const router = (0, express_1.Router)();
/**
 * POST /api/sync/trigger/:provider
 * Manually trigger sync for a specific provider
 */
router.post('/trigger/:provider', auth_1.authenticate, async (req, res) => {
    try {
        const { provider } = req.params;
        const userId = req.user.userId;
        const service = await models_1.ConnectedService.findOne({
            where: { userId, provider, isActive: true },
        });
        if (!service) {
            res.status(404).json({ error: 'Service not connected' });
            return;
        }
        await SyncWorker_1.default.scheduleSync(userId, service.provider, service.id);
        res.json({ message: 'Sync triggered successfully', provider });
    }
    catch (error) {
        console.error('Trigger sync error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
/**
 * POST /api/sync/trigger-all
 * Manually trigger sync for all connected services
 */
router.post('/trigger-all', auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.user.userId;
        await SyncWorker_1.default.syncAllUserServices(userId);
        res.json({ message: 'Sync triggered for all services' });
    }
    catch (error) {
        console.error('Trigger all sync error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
/**
 * GET /api/sync/status
 * Get sync queue statistics
 */
router.get('/status', auth_1.authenticate, async (req, res) => {
    try {
        const stats = await SyncWorker_1.default.getQueueStats();
        res.json({ stats });
    }
    catch (error) {
        console.error('Get sync status error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=sync.js.map