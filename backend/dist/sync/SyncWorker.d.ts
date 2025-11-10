import { ServiceProvider } from '../models/ConnectedService';
export declare class SyncWorker {
    private syncQueue;
    constructor();
    /**
     * Set up job processor
     */
    private setupProcessor;
    /**
     * Set up event handlers for queue
     */
    private setupEventHandlers;
    /**
     * Schedule sync for a specific service
     */
    scheduleSync(userId: string, provider: ServiceProvider, serviceId: string): Promise<void>;
    /**
     * Schedule recurring sync for a service
     */
    scheduleRecurringSync(userId: string, provider: ServiceProvider, serviceId: string, intervalHours?: number): Promise<void>;
    /**
     * Sync all services for a user
     */
    syncAllUserServices(userId: string): Promise<void>;
    /**
     * Get queue statistics
     */
    getQueueStats(): Promise<{
        waiting: number;
        active: number;
        completed: number;
        failed: number;
        delayed: number;
    }>;
    /**
     * Clean old jobs from queue
     */
    cleanQueue(): Promise<void>;
}
declare const _default: SyncWorker;
export default _default;
//# sourceMappingURL=SyncWorker.d.ts.map