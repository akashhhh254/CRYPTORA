# CRYPTORA

> **"Your Images. Your Security. Your Control."**

CRYPTORA is a privacy-focused, zero-knowledge digital image protection platform engineered to securely encrypt image files and restore previously encrypted images using authenticated credentials. Built from scratch with standard NIST SP 800-38D AES-256-GCM authenticated encryption and RFC 8018 PBKDF2-SHA256 key stretching, all operations execute 100% locally within the client browser.

---

## 1. Project Overview & Philosophy

Modern image sharing often compromises confidentiality when sensitive medical scans, personal identification, proprietary diagrams, or confidential photography are uploaded to cloud servers. 

CRYPTORA solves this problem by executing all cryptographic transformations strictly in the client's isolated browser environment using the W3C Web Cryptography API (`window.crypto.subtle`). Unencrypted image pixels and plain-text passwords never leave your device.

---

## 2. Core Features

- **Authenticated Image Encryption**:
  - Implements genuine Galois/Counter Mode (AES-256-GCM) with 128-bit authentication tags.
  - PBKDF2-SHA256 key derivation with 100,000 iterations and 16-byte random salts.
  - Option to generate cryptographically secure 256-bit random master keys (`.cptkey`).
  - Supports all major image formats: PNG, JPEG, WEBP, GIF, SVG, BMP, TIFF (up to 50MB).
  - Preserves exact aspect ratio preview and file metadata.

- **Tamper-Evident Image Decryption**:
  - Restores `.cpt` packages only after verifying the 128-bit GMAC authentication tag.
  - Immediate rejection of incorrect passwords or altered ciphertext bytes.
  - Byte-for-byte SHA-256 checksum verification against original file signatures.
  - 100% fidelity download of restored original images.

- **Verifiable `.cpt` Container Format**:
  - Big-endian binary container format storing magic header bytes, version, KDF configuration, unique CSPRNG nonce, salt, and authenticated metadata.

- **Client-Authoritative Account & Session Security**:
  - Real user registration and sign-in with client-side PBKDF2-SHA256 hashed passwords.
  - Secure 24-hour cryptographic session tokens.
  - Zero-Knowledge client audit log with JSON and CSV export capabilities.

- **Live Cryptographic Proof Engine**:
  - In-browser test runner asserting AES-GCM correctness, wrong-password rejection, single-bit tampering detection, and SHA-256 byte matching.

- **Strict White + Black Visual Identity**:
  - Clean monochrome design system adhering to strict anti-slop guidelines: pure white background (`#FFFFFF`), solid black typography (`#111111`), subtle borders (`#E5E5E5`), zero pills, and full responsiveness from 320px to 1920px.

---

## 3. Technology Stack

- **Frontend Framework**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS v4 (Strict White & Black palette)
- **Cryptography Engine**: Native W3C Web Cryptography API (`window.crypto.subtle`)
- **Icons**: Lucide Icons
- **Fonts**: Plus Jakarta Sans (Prose & Display), JetBrains Mono (Data & Hashes)

---

## 4. Cryptographic Specification

### A. Primitives & Standards
| Parameter | Value | Standard |
| :--- | :--- | :--- |
| **Symmetric Cipher** | AES-256 | FIPS PUB 197 |
| **Cipher Mode** | Galois/Counter Mode (GCM) | NIST SP 800-38D |
| **Authentication Tag** | 128-bit GMAC | NIST SP 800-38D §5.2.1 |
| **Initialization Vector** | 96-bit (12 bytes, unique per run) | NIST SP 800-38D §8.2.1 |
| **Key Derivation** | PBKDF2 with HMAC-SHA-256 | RFC 8018 / PKCS #5 v2.1 |
| **PBKDF2 Iterations** | 100,000 rounds | OWASP Recommended Baseline |
| **Salt Specification** | 128-bit CSPRNG (16 bytes) | RFC 8018 §4.1 |
| **Fidelity Checksum** | SHA-256 | FIPS 180-4 |

### B. The CPT Container Binary Layout
Files encrypted by CRYPTORA are serialized into `.cpt` containers with the following structure:
```
+-----------------------------------------------------------------------+
| Magic Bytes ("CRYPTORA")  | Version (0x01) | KDF Mode (0x01 / 0x02)   |
| (8 bytes)                 | (1 byte)       | (1 byte)                 |
+-----------------------------------------------------------------------+
| Iterations (Uint32BE)     | Salt Length (0x10) | Random Salt          |
| (4 bytes: 100,000)        | (1 byte)           | (16 bytes)           |
+-----------------------------------------------------------------------+
| IV Length (0x0C)          | Nonce / IV (96-bit)| Meta Length (Uint16) |
| (1 byte)                  | (12 bytes)         | (2 bytes)            |
+-----------------------------------------------------------------------+
| Metadata JSON (UTF-8)                                                 |
| { originalName, mimeType, originalSize, timestamp, sha256Checksum }  |
+-----------------------------------------------------------------------+
| AES-256-GCM Ciphertext + 128-bit Authentication Tag                   |
| (Variable length)                                                     |
+-----------------------------------------------------------------------+
```

---

## 5. Development & Local Setup

### Prerequisites
- Node.js >= 18.0.0
- npm, yarn, or pnpm

### Installation
```bash
# Clone or enter repository
cd cryptora

# Install dependencies
npm install

# Start local development server (runs on port 3000)
npm run dev

# Compile TypeScript and build for production
npm run build

# Run linter / type checker
npm run lint
```

---

## 6. Authentication Setup & Credentials

CRYPTORA includes pre-seeded credentials for immediate security auditing:
- **Email**: `security@cryptora.io`
- **Password**: `CryptoraSecure#2026`

Users can also register any new account directly in the application. All credentials are encrypted and validated client-side with PBKDF2-SHA256.

For enterprise OAuth 2.0 / SAML single-sign-on integration with Google Cloud Identity, consult the OAuth section in the application settings.

---

## 7. Deployment Instructions

### Deploying to Vercel
1. Push the codebase to a GitHub or GitLab repository.
2. In the Vercel dashboard, click **"Add New Project"** and select the repository.
3. Framework Preset: **Vite**.
4. Build Command: `npm run build`.
5. Output Directory: `dist`.
6. Click **Deploy**. Single-page URL routing is pre-configured via HTML5 history and hash navigation.

---

## 8. Security Considerations & Best Practices

1. **Password Custody**: Because CRYPTORA does not store passphrases on a remote server, **loss of your passphrase makes recovery mathematically impossible**. Always maintain offline backups of critical passphrases.
2. **Master Key Storage**: If using the Generated 256-Bit Master Key mode, store your downloaded `.cptkey` file in an encrypted physical USB drive or secure offline password manager.
3. **Nonce Freshness**: A fresh 12-byte CSPRNG nonce is generated for every single encryption. Nonces are never reused.
