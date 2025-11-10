"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = __importStar(require("./utils/database"));
const models_1 = require("./models");
const rateLimiter_1 = require("./middleware/rateLimiter");
const auth_1 = require("./middleware/auth");
// Import routes
const auth_2 = __importDefault(require("./routes/auth"));
const oauth_1 = __importDefault(require("./routes/oauth"));
const data_1 = __importDefault(require("./routes/data"));
const marketplace_1 = __importDefault(require("./routes/marketplace"));
const sync_1 = __importDefault(require("./routes/sync"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Apply rate limiting
app.use('/api', rateLimiter_1.generalLimiter);
// Health check endpoint
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// API Routes
app.use('/api/auth', auth_2.default);
app.use('/api/oauth', oauth_1.default);
app.use('/api/data', auth_1.authenticate, data_1.default); // Protected data routes
app.use('/api/marketplace', marketplace_1.default);
app.use('/api/sync', sync_1.default);
// Error handling middleware
app.use((err, _req, res, _next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
});
// 404 handler
app.use((_req, res) => {
    res.status(404).json({ error: 'Route not found' });
});
// Initialize database and start server
const startServer = async () => {
    try {
        // Test database connection
        await (0, database_1.testConnection)();
        // Sync database models
        // Set force: true to drop and recreate tables (WARNING: only for development)
        const forceSync = process.env.NODE_ENV === 'development' && process.env.DB_FORCE_SYNC === 'true';
        await (0, models_1.syncDatabase)(forceSync);
        // Start Express server
        app.listen(PORT, () => {
            console.log(`\n🚀 Server running on port ${PORT}`);
            console.log(`📍 API Base URL: http://localhost:${PORT}/api`);
            console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
            console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log('\n✅ Ready to accept requests\n');
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};
// Handle graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM signal received: closing HTTP server');
    await database_1.default.close();
    process.exit(0);
});
process.on('SIGINT', async () => {
    console.log('SIGINT signal received: closing HTTP server');
    await database_1.default.close();
    process.exit(0);
});
startServer();
exports.default = app;
//# sourceMappingURL=index.js.map