"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.comparePassword = exports.hashPassword = exports.decrypt = exports.encrypt = void 0;
const crypto_1 = __importDefault(require("crypto"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const ALGORITHM = 'aes-256-gcm';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto_1.default.randomBytes(32).toString('hex');
const KEY = Buffer.from(ENCRYPTION_KEY.substring(0, 32), 'utf8');
/**
 * Encrypt sensitive data (like OAuth tokens)
 * @param text - Plain text to encrypt
 * @returns Encrypted data object with IV and auth tag
 */
const encrypt = (text) => {
    const iv = crypto_1.default.randomBytes(16);
    const cipher = crypto_1.default.createCipheriv(ALGORITHM, KEY, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();
    return {
        iv: iv.toString('hex'),
        authTag: authTag.toString('hex'),
        encrypted,
    };
};
exports.encrypt = encrypt;
/**
 * Decrypt sensitive data
 * @param encryptedData - Encrypted data object
 * @returns Decrypted plain text
 */
const decrypt = (encryptedData) => {
    const decipher = crypto_1.default.createDecipheriv(ALGORITHM, KEY, Buffer.from(encryptedData.iv, 'hex'));
    decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
};
exports.decrypt = decrypt;
/**
 * Hash password using bcrypt (for user authentication)
 */
const hashPassword = async (password) => {
    const bcrypt = require('bcrypt');
    return bcrypt.hash(password, 10);
};
exports.hashPassword = hashPassword;
/**
 * Compare password with hash
 */
const comparePassword = async (password, hash) => {
    const bcrypt = require('bcrypt');
    return bcrypt.compare(password, hash);
};
exports.comparePassword = comparePassword;
//# sourceMappingURL=encryption.js.map