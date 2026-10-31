# CRYPTORA

> **"Your Data. Your Security. Your Control."**

CRYPTORA is an enterprise-grade digital cryptography and data protection platform engineered to securely encrypt, decrypt, hash, and verify sensitive files and texts using authenticated standards. Built with NIST SP 800-38D AES-256-GCM, RFC 8018 PBKDF2-SHA256, and official Firebase Authentication, all operations execute 100% locally within the client browser.

---

## 1. Project Overview & Architecture

Modern digital operations require uncompromising confidentiality. CRYPTORA guarantees that unencrypted texts and files are never sent across the network. All encryption, decryption, hashing, and password generation procedures execute within the browser's isolated memory space via the W3C Web Cryptography API (`window.crypto.subtle`).

### Architecture Highlights
- **100% Client-Side Cryptographic Isolation**: Plaintext never transits to external servers.
- **Firebase Authentication & Firestore Sync**: Seamless Google Sign-In, Email/Password auth, and cloud-synchronized audit history with graceful local PBKDF2 fallback.
- **CPT Container Format**: Self-contained, tamper-evident binary envelope format storing magic headers, version, KDF configuration, 96-bit unique CSPRNG nonce, 16-byte salt, metadata, and 128-bit authentication tag.
- **Strict Monochrome Design System**: High-contrast, accessibility-tested `#FFFFFF` and `#111111` visual system.

---

## 2. Core Modules

1. **3-Second Cinematic Splash Screen**:
   - Introduces the platform, logo mark, and official tagline.
   - Executes once per session via `sessionStorage` with instant skip option and `prefers-reduced-motion` compliance.

2. **Public Landing Page**:
   - Hero: *"Secure Your Digital World with Cryptora."*
   - Why Cryptora? section with 6 core principles.
   - 10 feature cards with direct routing.
   - 6-step operational workflow.
   - Security Overview: *"Your Data Deserves Strong Protection."*

3. **Text Encryption & Hashing**:
   - AES-256-GCM (Authenticated Encryption).
   - AES-256-CBC (Legacy support).
   - SHA-256 & SHA-512 (One-way deterministic cryptographic digests).
   - Exportable formatted JSON packages.

4. **Text Decryption**:
   - Parses raw inputs or formatted JSON envelopes.
   - Validates 128-bit GMAC authentication tags to reject tampering.

5. **Universal File Encryption**:
   - Drag & drop images, PDFs, archives, spreadsheets, and binaries up to 100MB.
   - Encapsulates into verifiable `.cpt` binary packages.

6. **Universal File Decryption**:
   - Validates CPT header structure, verifies bit-for-bit SHA-256 checksums, and restores exact MIME types.

7. **Cryptographic Algorithm Knowledge Base**:
   - In-depth specifications, working principles, key sizes, advantages, and limitations for AES-GCM, AES-CBC, ChaCha20-Poly1305, RSA-OAEP, SHA-2, SHA-3, PBKDF2, and Argon2id.

8. **Operation History & Audit Vault**:
   - Search, filter by category (Text / File / Encrypt / Decrypt), view detailed record modal, individual deletion, and CSV/JSON export.
   - Synchronizes to Firestore when Firebase is connected.
   - **Strict Guarantee**: Plaintext, passwords, and private keys are never recorded.

9. **Cryptographically Secure Password Generator**:
   - Generates passphrases using hardware-grade `crypto.getRandomValues()`.
   - Length (8 to 64), uppercase, lowercase, numbers, symbols, and mathematical entropy metrics in bits.

10. **Security Center & Live Proof Suite**:
    - Live in-browser assertion runner asserting AES-GCM decryption correctness, SHA-256 byte matching, wrong-password rejection, and single-bit tampering detection.

11. **User Profile & Account Settings**:
    - Manage display name, master password change, Firebase configuration diagnostics, local cache clearing, and account deletion.

12. **Legal & Compliance**:
    - 13-section comprehensive **Terms & Conditions** (`#/terms`).
    - 13-section transparent **Privacy Policy** (`#/privacy`).

---

## 3. Technology Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS v4 (Strict White & Black palette)
- **Cryptography**: W3C Web Cryptography API (`window.crypto.subtle`)
- **Authentication & Database**: Firebase Authentication (Google Sign-In, Email/Password) & Cloud Firestore
- **Icons**: Lucide Icons
- **Fonts**: Plus Jakarta Sans, JetBrains Mono

---

## 4. Environment Configuration

Copy `.env.example` to `.env.local` to configure Firebase:
```bash
# Firebase Authentication & Firestore (Optional - activates remote Google Auth & Cloud Sync)
VITE_FIREBASE_API_KEY="AIzaSy..."
VITE_FIREBASE_AUTH_DOMAIN="your-project-id.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your-project-id"
VITE_FIREBASE_STORAGE_BUCKET="your-project-id.firebasestorage.app"
VITE_FIREBASE_MESSAGING_SENDER_ID="123456789012"
VITE_FIREBASE_APP_ID="1:123456789012:web:abcdef123456"
```

If these environment variables are not supplied, CRYPTORA automatically operates in **Client Cryptographic Vault Mode** using local PBKDF2 salted credentials.

---

## 5. Pre-Configured Security Auditor Credentials

For immediate security audits and testing without registering a new email:
- **Email**: `security@cryptora.io`
- **Password**: `CryptoraSecure#2026`

---

## 6. Vercel Production Deployment

The project is fully pre-configured for Vercel:
1. `.npmrc` with `legacy-peer-deps=true` resolves peer dependency resolution during `npm install`.
2. `vercel.json` ensures single-page route rewrites (`"destination": "/index.html"`).
3. Build command: `npm run build`.
4. Output directory: `dist`.
