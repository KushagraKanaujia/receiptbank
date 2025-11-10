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
export declare const encrypt: (text: string) => EncryptedData;
/**
 * Decrypt sensitive data
 * @param encryptedData - Encrypted data object
 * @returns Decrypted plain text
 */
export declare const decrypt: (encryptedData: EncryptedData) => string;
/**
 * Hash password using bcrypt (for user authentication)
 */
export declare const hashPassword: (password: string) => Promise<string>;
/**
 * Compare password with hash
 */
export declare const comparePassword: (password: string, hash: string) => Promise<boolean>;
//# sourceMappingURL=encryption.d.ts.map