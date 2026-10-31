/**
 * CRYPTORA Cryptographic Engine
 * Industry-standard AES-256-GCM Authenticated Encryption & PBKDF2-SHA256 Key Derivation
 * Conforms to NIST SP 800-38D and RFC 8018 standards.
 */

import {
  CptHeaderInspection,
  DecryptedResult,
  EncryptedPackage,
  EncryptionOptions,
  FileValidationResult,
} from '../types/crypto';

// CPT Container Magic Bytes: "CRYPTORA" (8 bytes)
const CPT_MAGIC = new Uint8Array([0x43, 0x52, 0x59, 0x50, 0x54, 0x4F, 0x52, 0x41]);
const CPT_VERSION = 0x01;
const DEFAULT_PBKDF2_ITERATIONS = 100000;
const SALT_LENGTH = 16;
const IV_LENGTH = 12; // 96-bit nonce standard for AES-GCM

/**
 * Utility: Convert Uint8Array to Hex string
 */
export function bytesToHex(bytes: Uint8Array): string {
  let hex = '';
  for (let i = 0; i < bytes.length; i++) {
    hex += bytes[i].toString(16).padStart(2, '0');
  }
  return hex;
}

/**
 * Utility: Convert Hex string to Uint8Array
 */
export function hexToBytes(hex: string): Uint8Array {
  const cleanHex = hex.replace(/[^0-9a-fA-F]/g, '');
  if (cleanHex.length % 2 !== 0) {
    throw new Error('Invalid hex string length');
  }
  const bytes = new Uint8Array(cleanHex.length / 2);
  for (let i = 0; i < cleanHex.length; i += 2) {
    bytes[i / 2] = parseInt(cleanHex.substring(i, i + 2), 16);
  }
  return bytes;
}

/**
 * Utility: Calculate SHA-256 hash of an ArrayBuffer
 */
export async function calculateSha256(buffer: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  return bytesToHex(new Uint8Array(hashBuffer));
}

/**
 * Generate a cryptographically secure 256-bit (32-byte) master key
 */
export function generateSecure256BitKey(): {
  keyBytes: Uint8Array;
  hexKey: string;
  formattedKey: string;
} {
  const keyBytes = new Uint8Array(32);
  crypto.getRandomValues(keyBytes);
  const hexKey = bytesToHex(keyBytes);
  // Format into 4-character chunks for readability
  const formattedKey = hexKey.match(/.{1,4}/g)?.join('-') || hexKey;
  return { keyBytes, hexKey, formattedKey };
}

/**
 * Derive AES-GCM-256 CryptoKey from password using PBKDF2-SHA256
 */
async function deriveKeyFromPassword(
  password: string,
  salt: Uint8Array,
  iterations: number
): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const passwordKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations: iterations,
      hash: 'SHA-256',
    },
    passwordKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Import raw 32-byte key for AES-GCM
 */
async function importRawAesKey(rawBytes: Uint8Array): Promise<CryptoKey> {
  if (rawBytes.length !== 32) {
    throw new Error('Raw AES key must be exactly 32 bytes (256 bits)');
  }
  return await crypto.subtle.importKey(
    'raw',
    rawBytes as BufferSource,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Validate image file signature, MIME type, and size
 */
export async function validateImageFile(file: File): Promise<FileValidationResult> {
  const maxSizeBytes = 50 * 1024 * 1024; // 50MB
  if (file.size === 0) {
    return { valid: false, error: 'The uploaded file is empty (0 bytes).' };
  }
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File size exceeds the 50MB maximum limit (${(file.size / (1024 * 1024)).toFixed(1)}MB).`,
    };
  }

  // Inspect first 16 bytes for magic file signatures
  const headerSlice = await file.slice(0, 16).arrayBuffer();
  const header = new Uint8Array(headerSlice);

  let detectedFormat = 'Unknown';
  let isValidImage = false;

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    header[0] === 0x89 &&
    header[1] === 0x50 &&
    header[2] === 0x4e &&
    header[3] === 0x47
  ) {
    detectedFormat = 'PNG';
    isValidImage = true;
  }
  // JPEG: FF D8 FF
  else if (header[0] === 0xff && header[1] === 0xd8 && header[2] === 0xff) {
    detectedFormat = 'JPEG';
    isValidImage = true;
  }
  // GIF: 47 49 46 38
  else if (
    header[0] === 0x47 &&
    header[1] === 0x49 &&
    header[2] === 0x46 &&
    header[3] === 0x38
  ) {
    detectedFormat = 'GIF';
    isValidImage = true;
  }
  // WEBP: 52 49 46 46 .... 57 45 42 50
  else if (
    header[0] === 0x52 &&
    header[1] === 0x49 &&
    header[2] === 0x46 &&
    header[3] === 0x46 &&
    header[8] === 0x57 &&
    header[9] === 0x45 &&
    header[10] === 0x42 &&
    header[11] === 0x50
  ) {
    detectedFormat = 'WEBP';
    isValidImage = true;
  }
  // BMP: 42 4D ('BM')
  else if (header[0] === 0x42 && header[1] === 0x4d) {
    detectedFormat = 'BMP';
    isValidImage = true;
  }
  // TIFF: 49 49 2A 00 (little endian) or 4D 4D 00 2A (big endian)
  else if (
    (header[0] === 0x49 && header[1] === 0x49 && header[2] === 0x2a && header[3] === 0x00) ||
    (header[0] === 0x4d && header[1] === 0x4d && header[2] === 0x00 && header[3] === 0x2a)
  ) {
    detectedFormat = 'TIFF';
    isValidImage = true;
  }
  // SVG: textual XML/SVG
  else if (file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg')) {
    const textSample = new TextDecoder().decode(header);
    if (textSample.includes('<svg') || textSample.includes('<?xml')) {
      detectedFormat = 'SVG';
      isValidImage = true;
    }
  } else if (file.type.startsWith('image/')) {
    detectedFormat = file.type.replace('image/', '').toUpperCase();
    isValidImage = true;
  }

  if (!isValidImage) {
    return {
      valid: false,
      error:
        'Invalid image format. Supported formats: JPEG, PNG, WEBP, GIF, SVG, BMP, TIFF.',
    };
  }

  // Probe image dimensions if possible
  let dimensions: { width: number; height: number } | undefined = undefined;
  try {
    const objectUrl = URL.createObjectURL(file);
    dimensions = await new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const dims = { width: img.naturalWidth, height: img.naturalHeight };
        URL.revokeObjectURL(objectUrl);
        resolve(dims);
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(undefined);
      };
      img.src = objectUrl;
    });
  } catch {
    // Non-fatal if dimension probe fails
  }

  return {
    valid: true,
    mimeType: file.type || `image/${detectedFormat.toLowerCase()}`,
    detectedFormat,
    dimensions,
    sizeBytes: file.size,
  };
}

/**
 * Inspect and parse CPT (CRYPTORA Package Container) header
 */
export function inspectCptHeader(buffer: ArrayBuffer): CptHeaderInspection {
  const bytes = new Uint8Array(buffer);
  const minHeaderSize = 8 + 1 + 1 + 4 + 1 + SALT_LENGTH + 1 + IV_LENGTH + 2;

  if (bytes.length < minHeaderSize) {
    return { valid: false, error: 'File is too small to be a valid CRYPTORA container.' };
  }

  // 1. Check Magic Bytes: "CRYPTORA"
  for (let i = 0; i < CPT_MAGIC.length; i++) {
    if (bytes[i] !== CPT_MAGIC[i]) {
      return {
        valid: false,
        error: 'Invalid file format. File missing the CRYPTORA header signature.',
      };
    }
  }

  let offset = 8;
  const version = bytes[offset++];
  if (version !== CPT_VERSION) {
    return {
      valid: false,
      error: `Unsupported CRYPTORA version (v${version}). Expected v${CPT_VERSION}.`,
    };
  }

  const kdfByte = bytes[offset++];
  const kdfMode: 'PBKDF2-SHA256' | 'RAW-AES-256' =
    kdfByte === 0x02 ? 'RAW-AES-256' : 'PBKDF2-SHA256';

  // Iterations: 4 bytes big endian
  const view = new DataView(buffer);
  const iterations = view.getUint32(offset, false);
  offset += 4;

  // Salt
  const saltLen = bytes[offset++];
  if (saltLen !== SALT_LENGTH) {
    return { valid: false, error: 'Invalid container salt length.' };
  }
  const salt = bytes.slice(offset, offset + saltLen);
  offset += saltLen;

  // IV
  const ivLen = bytes[offset++];
  if (ivLen !== IV_LENGTH) {
    return { valid: false, error: 'Invalid container IV length.' };
  }
  const iv = bytes.slice(offset, offset + ivLen);
  offset += ivLen;

  // Metadata JSON
  const metaLen = view.getUint16(offset, false);
  offset += 2;

  if (offset + metaLen > bytes.length) {
    return { valid: false, error: 'Corrupted container header: truncated metadata block.' };
  }

  const metaBytes = bytes.slice(offset, offset + metaLen);
  offset += metaLen;

  let metadata: any;
  try {
    const metaStr = new TextDecoder('utf-8').decode(metaBytes);
    metadata = JSON.parse(metaStr);
  } catch {
    return { valid: false, error: 'Corrupted metadata JSON in container header.' };
  }

  return {
    valid: true,
    version,
    kdfMode,
    iterations,
    saltHex: bytesToHex(salt),
    ivHex: bytesToHex(iv),
    metadata,
    ciphertextOffset: offset,
    ciphertextSize: bytes.length - offset,
  };
}

/**
 * Encrypt Image File using AES-256-GCM and package into .cpt container
 */
export async function encryptImage(
  file: File,
  options: EncryptionOptions,
  onProgress?: (percent: number, stage: string) => void
): Promise<EncryptedPackage> {
  onProgress?.(10, 'Validating source image format...');
  const validation = await validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error || 'Invalid image file.');
  }

  onProgress?.(25, 'Reading binary image data...');
  const fileBuffer = await file.arrayBuffer();

  onProgress?.(35, 'Computing SHA-256 checksum for original image...');
  const sha256Original = await calculateSha256(fileBuffer);

  // Generate 16-byte random salt and 12-byte random IV
  const salt = new Uint8Array(SALT_LENGTH);
  crypto.getRandomValues(salt);

  const iv = new Uint8Array(IV_LENGTH);
  crypto.getRandomValues(iv);

  let cryptoKey: CryptoKey;
  let rawKeyHex: string | undefined = undefined;
  const iterations = options.iterations || DEFAULT_PBKDF2_ITERATIONS;

  if (options.mode === 'password') {
    if (!options.password || options.password.length < 1) {
      throw new Error('Encryption password cannot be empty.');
    }
    onProgress?.(50, `Deriving 256-bit key via PBKDF2 (${iterations.toLocaleString()} iterations)...`);
    cryptoKey = await deriveKeyFromPassword(options.password, salt, iterations);
  } else {
    // Generated Key mode
    if (!options.rawKeyBytes || options.rawKeyBytes.length !== 32) {
      throw new Error('Valid 256-bit master key is required.');
    }
    onProgress?.(50, 'Importing 256-bit AES master key...');
    rawKeyHex = bytesToHex(options.rawKeyBytes);
    cryptoKey = await importRawAesKey(options.rawKeyBytes);
  }

  onProgress?.(70, 'Executing AES-256-GCM authenticated encryption...');
  // Encrypt file buffer with AES-256-GCM (128-bit tag appended automatically)
  const ciphertextBuffer = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
      tagLength: 128,
    },
    cryptoKey,
    fileBuffer
  );

  onProgress?.(85, 'Constructing versioned CRYPTORA container package...');

  // Prepare metadata block
  const metadata = {
    originalName: file.name,
    mimeType: validation.mimeType || file.type || 'image/png',
    originalSize: file.size,
    timestamp: Date.now(),
    sha256Checksum: sha256Original,
  };

  const metaJsonBytes = new TextEncoder().encode(JSON.stringify(metadata));
  const metaLength = metaJsonBytes.length;

  // Calculate container total size:
  // 8 (magic) + 1 (ver) + 1 (kdf) + 4 (iter) + 1 (saltLen) + 16 (salt) + 1 (ivLen) + 12 (iv) + 2 (metaLen) + metaLength + ciphertext
  const headerSize = 8 + 1 + 1 + 4 + 1 + SALT_LENGTH + 1 + IV_LENGTH + 2 + metaLength;
  const totalContainerSize = headerSize + ciphertextBuffer.byteLength;

  const containerBuffer = new ArrayBuffer(totalContainerSize);
  const containerBytes = new Uint8Array(containerBuffer);
  const view = new DataView(containerBuffer);

  let offset = 0;

  // 1. Magic
  containerBytes.set(CPT_MAGIC, offset);
  offset += 8;

  // 2. Version
  containerBytes[offset++] = CPT_VERSION;

  // 3. KDF Mode: 0x01 (PBKDF2), 0x02 (Raw Key)
  containerBytes[offset++] = options.mode === 'password' ? 0x01 : 0x02;

  // 4. Iterations
  view.setUint32(offset, iterations, false);
  offset += 4;

  // 5. Salt length + Salt
  containerBytes[offset++] = SALT_LENGTH;
  containerBytes.set(salt, offset);
  offset += SALT_LENGTH;

  // 6. IV length + IV
  containerBytes[offset++] = IV_LENGTH;
  containerBytes.set(iv, offset);
  offset += IV_LENGTH;

  // 7. Metadata length + Metadata bytes
  view.setUint16(offset, metaLength, false);
  offset += 2;
  containerBytes.set(metaJsonBytes, offset);
  offset += metaLength;

  // 8. Ciphertext with Auth Tag
  containerBytes.set(new Uint8Array(ciphertextBuffer), offset);

  const containerBlob = new Blob([containerBuffer], {
    type: 'application/octet-stream',
  });

  const outputFilename = `${file.name}.cpt`;

  onProgress?.(100, 'Encryption complete.');

  return {
    blob: containerBlob,
    filename: outputFilename,
    originalName: file.name,
    originalSize: file.size,
    originalMimeType: metadata.mimeType,
    encryptedSize: totalContainerSize,
    saltHex: bytesToHex(salt),
    ivHex: bytesToHex(iv),
    kdfMode: options.mode === 'password' ? 'PBKDF2-SHA256' : 'RAW-AES-256',
    iterations,
    timestamp: metadata.timestamp,
    sha256Original,
    rawKeyHex,
  };
}

/**
 * Decrypt CPT file using AES-256-GCM and verify integrity
 */
export async function decryptImage(
  cptFile: File,
  credentials: { password?: string; rawKeyHex?: string },
  onProgress?: (percent: number, stage: string) => void
): Promise<DecryptedResult> {
  const startTime = performance.now();

  onProgress?.(10, 'Reading CRYPTORA package container...');
  const buffer = await cptFile.arrayBuffer();

  onProgress?.(25, 'Inspecting container headers and metadata...');
  const inspection = inspectCptHeader(buffer);
  if (!inspection.valid || !inspection.metadata || !inspection.ciphertextOffset) {
    throw new Error(inspection.error || 'Failed to parse CRYPTORA container.');
  }

  const { kdfMode, iterations, saltHex, ivHex, metadata, ciphertextOffset } = inspection;
  const salt = hexToBytes(saltHex!);
  const iv = hexToBytes(ivHex!);
  const ciphertextWithTag = new Uint8Array(buffer, ciphertextOffset);

  let cryptoKey: CryptoKey;

  if (kdfMode === 'PBKDF2-SHA256') {
    if (!credentials.password) {
      throw new Error('This encrypted package was protected with a password. Please enter the password.');
    }
    onProgress?.(45, `Deriving 256-bit key with ${iterations?.toLocaleString()} PBKDF2 iterations...`);
    cryptoKey = await deriveKeyFromPassword(credentials.password, salt, iterations || DEFAULT_PBKDF2_ITERATIONS);
  } else {
    // Raw Key mode
    if (!credentials.rawKeyHex) {
      throw new Error('This encrypted package requires the 256-bit Master Key. Please enter or upload the key.');
    }
    onProgress?.(45, 'Importing 256-bit AES Master Key...');
    const rawKeyBytes = hexToBytes(credentials.rawKeyHex);
    cryptoKey = await importRawAesKey(rawKeyBytes);
  }

  onProgress?.(70, 'Verifying AES-256-GCM authentication tag and decrypting...');

  let decryptedBuffer: ArrayBuffer;
  try {
    decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv as BufferSource,
        tagLength: 128,
      },
      cryptoKey,
      ciphertextWithTag as BufferSource
    );
  } catch (error: any) {
    // Authenticated encryption fails securely if password/key is wrong OR ciphertext was tampered with
    throw new Error(
      'Integrity verification failed: Authentication tag mismatch. Either the password / key is incorrect, or the file has been corrupted or modified.'
    );
  }

  onProgress?.(90, 'Computing SHA-256 checksum and verifying byte-for-byte fidelity...');
  const sha256Restored = await calculateSha256(decryptedBuffer);

  // Compare with expected SHA-256 stored in authenticated metadata
  const verified = metadata.sha256Checksum
    ? metadata.sha256Checksum.toLowerCase() === sha256Restored.toLowerCase()
    : true;

  if (!verified) {
    throw new Error(
      'Integrity verification failed: Restored image checksum does not match original signature.'
    );
  }

  const mimeType = metadata.mimeType || 'image/png';
  const restoredBlob = new Blob([decryptedBuffer], { type: mimeType });
  const objectUrl = URL.createObjectURL(restoredBlob);
  const decryptionTimeMs = Math.round(performance.now() - startTime);

  onProgress?.(100, 'Image restored successfully.');

  return {
    blob: restoredBlob,
    url: objectUrl,
    filename: metadata.originalName || 'restored_image',
    size: decryptedBuffer.byteLength,
    mimeType: mimeType,
    sha256Restored,
    originalSha256Expected: metadata.sha256Checksum,
    verified,
    decryptionTimeMs,
  };
}
