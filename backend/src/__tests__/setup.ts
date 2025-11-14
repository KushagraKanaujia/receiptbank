import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key-for-testing-only';
process.env.ENCRYPTION_KEY = 'test-encryption-key-32-characters!';

// Mock external services
jest.mock('../utils/imageStorage', () => ({
  uploadImage: jest.fn().mockResolvedValue('https://test.cloudflare.com/test-image.jpg'),
  generateImageHash: jest.fn().mockReturnValue('test-hash-12345'),
  extractMetadata: jest.fn().mockResolvedValue({ size: 1024, format: 'jpeg' }),
}));

jest.mock('../utils/ocr', () => ({
  extractReceiptData: jest.fn().mockResolvedValue({
    merchant: 'Test Store',
    total: 25.50,
    date: new Date('2024-01-15'),
    items: [{ name: 'Test Item', price: 25.50 }],
    confidence: 0.95,
  }),
}));

jest.mock('../utils/paypal', () => ({
  sendPayout: jest.fn().mockResolvedValue({
    success: true,
    payoutId: 'PAYOUT-123456',
    status: 'SUCCESS',
  }),
  validatePayPalEmail: jest.fn().mockReturnValue(true),
}));

jest.mock('../utils/fraudDetection', () => ({
  detectFraud: jest.fn().mockResolvedValue({
    isFraudulent: false,
    riskScore: 0.15,
    reasons: [],
  }),
  shouldRateLimit: jest.fn().mockResolvedValue(false),
}));

// Suppress console during tests
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
};
