export interface JwtPayload {
    userId: string;
    email: string;
    role?: 'user' | 'business';
}
/**
 * Generate JWT token
 * @param payload - User information to encode
 * @returns Signed JWT token
 */
export declare const generateToken: (payload: JwtPayload) => string;
/**
 * Verify and decode JWT token
 * @param token - JWT token to verify
 * @returns Decoded payload
 */
export declare const verifyToken: (token: string) => JwtPayload;
/**
 * Decode JWT without verification (use cautiously)
 * @param token - JWT token to decode
 * @returns Decoded payload or null
 */
export declare const decodeToken: (token: string) => JwtPayload | null;
//# sourceMappingURL=jwt.d.ts.map