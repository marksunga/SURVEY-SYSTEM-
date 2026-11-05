import * as crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const DEFAULT_KEY_HEX = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

/**
 * Resolves the 32-byte encryption key from environment or fallback
 */
function getEncryptionKey(): Buffer {
  const envKey = process.env.FEEDBACK_ENCRYPTION_KEY || DEFAULT_KEY_HEX;
  if (envKey.length === 64) {
    return Buffer.from(envKey, 'hex');
  }
  // Derive 32-byte key using SHA-256 if arbitrary passphrase provided
  return crypto.createHash('sha256').update(envKey).digest();
}

export interface EncryptedPayload {
  encrypted: string;
  iv: string;
  tag: string;
}

/**
 * Encrypts plaintext using AES-256-GCM
 */
export function encryptAES256(text: string): EncryptedPayload {
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = getEncryptionKey();
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

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
 * Decrypts AES-256-GCM ciphertext
 */
export function decryptAES256(encryptedHex: string, ivHex: string, tagHex: string): string {
  try {
    const key = getEncryptionKey();
    const iv = Buffer.from(ivHex, 'hex');
    const tag = Buffer.from(tagHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);

    decipher.setAuthTag(tag);

    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error);
    return '[Decryption Failed - Invalid Key or Corrupted Data]';
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

