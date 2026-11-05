import { encryptAES256, decryptAES256, generateSubmissionToken, hashAuditIdentifier } from '../lib/crypto/aes';

function testCrypto() {
  console.log('Testing AES-256 Encryption & Security Functions...');

  const originalMessage = 'Confidential student feedback regarding laboratory hardware issues in Lab 402.';
  const payload = encryptAES256(originalMessage);

  console.log('Original Message:', originalMessage);
  console.log('Encrypted Hex:', payload.encrypted.substring(0, 32) + '...');
  console.log('IV (Hex):', payload.iv);
  console.log('Auth Tag (Hex):', payload.tag);

  const decrypted = decryptAES256(payload.encrypted, payload.iv, payload.tag);
  console.log('Decrypted Message:', decrypted);

  if (decrypted !== originalMessage) {
    throw new Error('Decryption mismatch!');
  }

  const token = generateSubmissionToken();
  console.log('Generated Anonymous Token:', token);
  if (!token.startsWith('SUB-')) {
    throw new Error('Token format invalid!');
  }

  const hash = hashAuditIdentifier('192.168.1.100');
  console.log('Hashed Audit ID:', hash);

  console.log('AES-256 Crypto Verification: PASSED!');
}

testCrypto();
