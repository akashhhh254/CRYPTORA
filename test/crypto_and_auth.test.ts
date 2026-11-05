/**
 * CRYPTORA Automated Verification Suite
 * Tests cryptographic primitives, key derivation, integrity verification,
 * CPT container parsing, password entropy, and Firebase OAuth provider configuration.
 */

import {
  generateSecure256BitKey,
  generateSecurePassword,
  bytesToHex,
  hexToBytes,
} from '../src/services/cryptoEngine';
import { isFirebaseConfigured, firebaseConfig } from '../src/services/firebase';

async function runTests() {
  console.log('--- STARTING CRYPTORA AUTOMATED TEST SUITE ---');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}`);
      failed++;
    }
  }

  // TEST 1: 256-bit Key Generation
  try {
    const key = generateSecure256BitKey();
    assert(key.keyBytes.length === 32, 'Key length is exactly 32 bytes (256 bits)');
    assert(key.hexKey.length === 64, 'Hex key is exactly 64 characters');
    assert(/^[0-9a-f]{64}$/i.test(key.hexKey), 'Hex key contains valid hexadecimal characters');
  } catch (e) {
    assert(false, `Key generation error: ${e}`);
  }

  // TEST 2: Hex to Bytes and Bytes to Hex Roundtrip
  try {
    const sampleHex = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
    const bytes = hexToBytes(sampleHex);
    const roundtripHex = bytesToHex(bytes);
    assert(sampleHex === roundtripHex, 'Hex-to-Bytes and Bytes-to-Hex conversion is lossless');
  } catch (e) {
    assert(false, `Hex conversion error: ${e}`);
  }

  // TEST 3: Secure Password Generator
  try {
    const pw = generateSecurePassword({
      length: 24,
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: true,
      includeSymbols: true,
    });
    assert(pw.password.length === 24, 'Password length matches specified 24 characters');
    assert(pw.entropyBits >= 90, `Entropy meets Enterprise standard (${pw.entropyBits} bits)`);
    assert(pw.strength === 'Enterprise', 'Strength rating is Enterprise');
  } catch (e) {
    assert(false, `Password generator error: ${e}`);
  }

  // TEST 4: Firebase Configuration Validation
  try {
    assert(isFirebaseConfigured === true, 'Firebase configuration flag is validly configured');
    assert(firebaseConfig.projectId === 'ace-anvil-5lxdt', 'Project ID correctly matches ace-anvil-5lxdt');
    assert(firebaseConfig.authDomain === 'ace-anvil-5lxdt.firebaseapp.com', 'Auth domain matches ace-anvil-5lxdt.firebaseapp.com');
  } catch (e) {
    assert(false, `Firebase configuration test error: ${e}`);
  }

  // TEST 5: Firebase Email Authentication Readiness
  try {
    assert(Boolean(firebaseConfig.apiKey), 'Firebase API Key is configured');
    assert(Boolean(firebaseConfig.projectId), 'Firebase Project ID is configured');
    assert(firebaseConfig.projectId === 'ace-anvil-5lxdt', 'Target Firebase Project is ace-anvil-5lxdt');
  } catch (e) {
    assert(false, `Firebase Auth readiness error: ${e}`);
  }

  // TEST 6: Web Crypto API Native Availability
  try {
    const isSubtleAvailable = typeof crypto !== 'undefined' && typeof crypto.subtle !== 'undefined';
    assert(isSubtleAvailable, 'Web Crypto Subtle API is available for zero-knowledge client encryption');
  } catch (e) {
    assert(false, `Web Crypto error: ${e}`);
  }

  // TEST 7: Text Encryption & Decryption Roundtrip (AES-256-GCM)
  try {
    const { encryptText, decryptText } = await import('../src/services/cryptoEngine');
    const secretMessage = 'CRYPTORA_TOP_SECRET_CONFIDENTIAL_PAYLOAD_2026';
    const passphrase = 'SuperSecurePassphrase!@#12345';
    
    const encResult = await encryptText(secretMessage, 'AES-256-GCM', passphrase, 'password');
    assert(Boolean(encResult.ciphertext), 'Ciphertext was generated successfully');
    assert(Boolean(encResult.ivHex), '96-bit IV nonce was generated');
    assert(Boolean(encResult.tagHex), '128-bit authentication tag was generated');

    const decrypted = await decryptText({
      ciphertext: encResult.ciphertext,
      algorithm: 'AES-256-GCM',
      keyOrPass: passphrase,
      ivHex: encResult.ivHex,
      saltHex: encResult.saltHex,
      tagHex: encResult.tagHex,
    });
    assert(decrypted === secretMessage, 'Decrypted text strictly matches original plaintext');
  } catch (e) {
    assert(false, `Text encryption roundtrip error: ${e}`);
  }

  // TEST 8: Authenticated Tag Integrity Protection (Tamper Detection)
  try {
    const { encryptText, decryptText } = await import('../src/services/cryptoEngine');
    const secretMessage = 'AUTHENTICATED_DATA_PACKAGE';
    const passphrase = 'ValidPassphrase123!';
    
    const encResult = await encryptText(secretMessage, 'AES-256-GCM', passphrase, 'password');
    
    // Tamper with ciphertext by flipping one byte
    const tamperedCt = encResult.ciphertext.substring(0, encResult.ciphertext.length - 2) + 'ff';
    let tamperDetected = false;
    try {
      await decryptText({
        ciphertext: tamperedCt,
        algorithm: 'AES-256-GCM',
        keyOrPass: passphrase,
        ivHex: encResult.ivHex,
        saltHex: encResult.saltHex,
        tagHex: encResult.tagHex,
      });
    } catch {
      tamperDetected = true;
    }
    assert(tamperDetected, 'AES-256-GCM correctly detects tampering and rejects corrupted ciphertext');
  } catch (e) {
    assert(false, `Tamper detection test error: ${e}`);
  }

  console.log('--------------------------------------------------');
  console.log(`SUMMARY: ${passed} passed, ${failed} failed`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((e) => {
  console.error('Fatal test runner error:', e);
  process.exit(1);
});
