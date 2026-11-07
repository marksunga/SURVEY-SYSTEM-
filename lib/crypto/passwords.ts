import * as crypto from 'crypto';

/**
 * Secure One-Way Password Hashing & Verification
 * Uses Node.js crypto.scrypt with a unique 16-byte cryptographically random salt per user.
 * Formatted as: scrypt$<salt_hex>$<derived_key_hex>
 *
 * Scrypt parameters:
 * N = 16384 (CPU/memory cost)
 * r = 8 (block size)
 * p = 1 (parallelization)
 * keylen = 64 bytes
 */

const KEY_LENGTH = 64;
const SALT_LENGTH = 16;
const SCRYPT_OPTIONS = {
  N: 16384,
  r: 8,
  p: 1,
  maxmem: 32 * 1024 * 1024,
};

/**
 * Hashes a plaintext password using scrypt with a unique cryptographically random salt.
 * Never uses reversible AES encryption.
 */
export function hashPassword(password: string): string {
  if (!password || typeof password !== 'string') {
    throw new Error('Password must be a non-empty string');
  }

  const salt = crypto.randomBytes(SALT_LENGTH).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, KEY_LENGTH, SCRYPT_OPTIONS);

  return `scrypt$${salt}$${derivedKey.toString('hex')}`;
}

/**
 * Verifies a plaintext password against a stored one-way hash using timingSafeEqual
 * to protect against timing attacks.
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  if (!password || !storedHash) {
    return false;
  }

  try {
    const parts = storedHash.split('$');
    if (parts.length !== 3 || parts[0] !== 'scrypt') {
      return false;
    }

    const salt = parts[1];
    const expectedKeyHex = parts[2];
    const expectedKey = Buffer.from(expectedKeyHex, 'hex');

    if (expectedKey.length !== KEY_LENGTH) {
      return false;
    }

    const actualKey = crypto.scryptSync(password, salt, KEY_LENGTH, SCRYPT_OPTIONS);

    return crypto.timingSafeEqual(expectedKey, actualKey);
  } catch (error) {
    console.error('[Security] Password verification error:', error);
    return false;
  }
}

/**
 * Validates password complexity requirements:
 * - At least 8 characters
 * - At least one uppercase letter (A-Z)
 * - At least one lowercase letter (a-z)
 * - At least one digit (0-9)
 * - At least one special character
 */
export function validatePasswordStrength(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!password || password.length < 8) {
    errors.push('Password must be at least 8 characters long.');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter (A-Z).');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter (a-z).');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number (0-9).');
  }
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    errors.push('Password must contain at least one special character (e.g. !@#$%^&*).');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

