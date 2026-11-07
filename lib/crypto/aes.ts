import * as crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // 128-bit random IV for AES-GCM
const AUTH_TAG_LENGTH = 16; // 128-bit authentication tag

/**
 * Resolves the 32-byte (256-bit) encryption key from server-side environment variable.
 * The key must never be exposed to client-side bundles.
 */
function getEncryptionKey(): Buffer {
  const envKey = process.env.FEEDBACK_ENCRYPTION_KEY;

  if (envKey) {
    if (envKey.length === 64) {
      return Buffer.from(envKey, 'hex');
    }
    // If a passphrase is provided, derive a 32-byte key using SHA-256
    return crypto.createHash('sha256').update(envKey).digest();
  }

  // Development fallback: Warn and use a dedicated local fallback key if not set
  // Production must always supply FEEDBACK_ENCRYPTION_KEY
  return crypto
    .createHash('sha256')
    .update('it-dept-feedback-internal-default-dev-key')
    .digest();
}

export interface EncryptedPayload {
  encrypted: string;
  iv: string;
  tag: string;
}

/**
 * Encrypts sensitive application data (e.g. feedback) using AES-256-GCM.
 * Generates a unique, cryptographically random IV for every encryption call.
 * NEVER use AES for user password storage.
 */
export function encryptAES256(text: string): EncryptedPayload {
  if (typeof text !== 'string') {
    throw new Error('encryptAES256 expects plaintext string');
  }

  const iv = crypto.randomBytes(IV_LENGTH);
  const key = getEncryptionKey();
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const tag = cipher.getAuthTag();

  return {
    encrypted,
    iv: iv.toString('hex'),
    tag: tag.toString('hex'),
  };
}

/**
 * Decrypts AES-256-GCM ciphertext.
 * Strictly verifies the authentication tag to ensure data integrity and tamper resistance.
 */
export function decryptAES256(encryptedHex: string, ivHex: string, tagHex: string): string {
  try {
    const key = getEncryptionKey();
    const iv = Buffer.from(ivHex, 'hex');
    const tag = Buffer.from(tagHex, 'hex');

    if (iv.length !== IV_LENGTH) {
      throw new Error(`Invalid IV length: expected ${IV_LENGTH} bytes`);
    }

    if (tag.length !== AUTH_TAG_LENGTH) {
      throw new Error(`Invalid authentication tag length: expected ${AUTH_TAG_LENGTH} bytes`);
    }

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, { authTagLength: AUTH_TAG_LENGTH });
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error: any) {
    // Return a safe error indicator without crashing or leaking plaintext
    return '[Decryption Failed: Authentication Tag Mismatch or Corrupted Data]';
  }
}

/**
 * Generates a random cryptographic submission token for anonymous decoupling
 */
export function generateSubmissionToken(): string {
  return `SUB-${crypto.randomBytes(16).toString('hex').toUpperCase()}`;
}

/**
 * Generates an anonymous audit hash from an IP address without storing PII
 */
export function hashAuditIdentifier(value: string, salt = 'it-dept-salt'): string {
  return crypto.createHmac('sha256', salt).update(value).digest('hex').substring(0, 16);
}
