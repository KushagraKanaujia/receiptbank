import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const ALGORITHM = 'aes-256-gcm';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const KEY = Buffer.from(ENCRYPTION_KEY.substring(0, 32), 'utf8');

export interface EncryptedData {
  iv: string;
  authTag: string;
  encrypted: string;
}

/**
 * Encrypt sensitive data (like OAuth tokens)
 * @param text - Plain text to encrypt
 * @returns Encrypted data object with IV and auth tag
 */
export const encrypt = (text: string): EncryptedData => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  return {
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
    encrypted,
  };
};

/**
 * Decrypt sensitive data
 * @param encryptedData - Encrypted data object
 * @returns Decrypted plain text
 */
export const decrypt = (encryptedData: EncryptedData): string => {
  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    KEY,
    Buffer.from(encryptedData.iv, 'hex')
  );

  decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));

  let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
};

/**
 * Hash password using bcrypt (for user authentication)
 */
export const hashPassword = async (password: string): Promise<string> => {
  const bcrypt = require('bcrypt');
  return bcrypt.hash(password, 10);
};

/**
 * Compare password with hash
 */
export const comparePassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  const bcrypt = require('bcrypt');
  return bcrypt.compare(password, hash);
};
