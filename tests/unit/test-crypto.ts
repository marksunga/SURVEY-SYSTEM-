import { encryptAES256, decryptAES256, generateSubmissionToken, hashAuditIdentifier } from '../lib/crypto/aes';
import { hashPassword, verifyPassword, validatePasswordStrength } from '../lib/crypto/passwords';

function testCrypto() {
  console.log('========================================================');
  console.log('RUNNING CRYPTOGRAPHY & SECURITY VERIFICATION SUITE');
  console.log('========================================================\n');

  // 1. AES-256-GCM Encryption & Decryption
  console.log('[1/5] Testing AES-256-GCM Encryption for Application Data...');
  const originalMessage = 'Confidential student feedback regarding laboratory hardware issues in Lab 402.';
  const payload1 = encryptAES256(originalMessage);

  console.log('  Original Message:', originalMessage);
  console.log('  Encrypted Hex (sample):', payload1.encrypted.substring(0, 32) + '...');
  console.log('  Unique IV (Hex):', payload1.iv);
  console.log('  Auth Tag (Hex):', payload1.tag);

  const decrypted = decryptAES256(payload1.encrypted, payload1.iv, payload1.tag);
  if (decrypted !== originalMessage) {
    throw new Error('Decryption mismatch!');
  }
  console.log('  ✓ Verified: Decrypted payload exactly matches original message.');

  // 2. Nonce Uniqueness Verification
  console.log('\n[2/5] Testing Nonce/IV Uniqueness on Consecutive Encryptions...');
  const payload2 = encryptAES256(originalMessage);
  if (payload1.iv === payload2.iv) {
    throw new Error('CRITICAL: Reused IV across encryptions with the same key!');
  }
  if (payload1.encrypted === payload2.encrypted) {
    throw new Error('CRITICAL: Identical ciphertext generated for repeated plaintext!');
  }
  console.log('  ✓ Verified: Unique IVs and distinct ciphertexts generated for identical plaintext.');

  // 3. Authenticated Encryption Tamper Resistance (GCM Auth Tag)
  console.log('\n[3/5] Testing AES-256-GCM Tamper Resistance & Auth Tag Validation...');
  // Tamper with ciphertext by flipping bits
  const tamperedCiphertext =
    (payload1.encrypted.startsWith('00') ? 'ff' : '00') + payload1.encrypted.substring(2);
  const tamperedResult = decryptAES256(tamperedCiphertext, payload1.iv, payload1.tag);
  if (!tamperedResult.includes('Authentication Tag Mismatch') && !tamperedResult.includes('Failed')) {
    throw new Error('CRITICAL: Decryption did not reject tampered ciphertext!');
  }
  console.log('  ✓ Verified: Tampered ciphertext was rejected by GCM authentication tag.');

  // Tamper with auth tag
  const tamperedTag =
    (payload1.tag.startsWith('00') ? 'ff' : '00') + payload1.tag.substring(2);
  const tamperedTagResult = decryptAES256(payload1.encrypted, payload1.iv, tamperedTag);
  if (!tamperedTagResult.includes('Authentication Tag Mismatch') && !tamperedTagResult.includes('Failed')) {
    throw new Error('CRITICAL: Decryption did not reject tampered auth tag!');
  }
  console.log('  ✓ Verified: Tampered authentication tag was rejected.');

  // 4. One-Way Password Hashing (Scrypt with Salt)
  console.log('\n[4/5] Testing One-Way Password Hashing (NEVER Reversible AES)...');
  const password = 'Password123!';
  const passwordHash1 = hashPassword(password);
  const passwordHash2 = hashPassword(password);

  console.log('  Generated Hash (sample):', passwordHash1.substring(0, 36) + '...');
  if (!passwordHash1.startsWith('scrypt$')) {
    throw new Error('Password hash does not use scrypt format!');
  }
  if (passwordHash1 === passwordHash2) {
    throw new Error('Expected different salts to generate different serialized hashes!');
  }

  // Verify correct password matches
  const validCheck = verifyPassword(password, passwordHash1);
  if (!validCheck) {
    throw new Error('Failed to verify correct password against hash!');
  }
  console.log('  ✓ Verified: Correct password matches stored scrypt hash.');

  // Verify incorrect password is rejected
  const wrongCheck = verifyPassword('WrongPassword999!', passwordHash1);
  if (wrongCheck) {
    throw new Error('CRITICAL: Incorrect password was accepted!');
  }
  console.log('  ✓ Verified: Incorrect password is strictly rejected.');

  // 5. Password Complexity Validation
  console.log('\n[5/5] Testing Password Complexity Requirements...');
  const weakCheck1 = validatePasswordStrength('short');
  if (weakCheck1.valid) throw new Error('Weak password was accepted (too short)');

  const weakCheck2 = validatePasswordStrength('nocapital123!');
  if (weakCheck2.valid) throw new Error('Weak password was accepted (no uppercase)');

  const weakCheck3 = validatePasswordStrength('NOLOWERCASE123!');
  if (weakCheck3.valid) throw new Error('Weak password was accepted (no lowercase)');

  const weakCheck4 = validatePasswordStrength('NoSpecialNumbers');
  if (weakCheck4.valid) throw new Error('Weak password was accepted (no number/special)');

  const strongCheck = validatePasswordStrength('StrongP@ssw0rd!');
  if (!strongCheck.valid) throw new Error(`Strong password was rejected: ${strongCheck.errors.join(', ')}`);
  console.log('  ✓ Verified: Password complexity rules enforced (length, case, numbers, special chars).');

  // Miscellaneous tokens
  const token = generateSubmissionToken();
  if (!token.startsWith('SUB-')) throw new Error('Token format invalid!');
  const hash = hashAuditIdentifier('192.168.1.100');
  if (!hash) throw new Error('Audit hash failed');

  console.log('\n========================================================');
  console.log('ALL CRYPTOGRAPHY & SECURITY TESTS PASSED SUCCESSFULLY');
  console.log('========================================================');
}

testCrypto();
