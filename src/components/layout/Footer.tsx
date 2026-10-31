/**
 * CRYPTORA Footer
 * Minimal monochrome footer with product navigation, cryptographic disclosures, and legal notices.
 */

import React from 'react';
import { CryptoraLogo } from '../common/CryptoraLogo';

interface FooterProps {
  onNavigate: (route: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="w-full bg-white border-t border-[#E5E5E5] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Column 1: Brand & Tagline */}
          <div className="md:col-span-1 space-y-3">
            <CryptoraLogo size="md" />
            <p className="text-xs text-[#666666] leading-relaxed">
              Your Images. Your Security. Your Control.
            </p>
            <p className="text-xs text-[#888888] leading-relaxed">
              Standard-compliant AES-256-GCM authenticated encryption and decryption executed locally within your browser.
            </p>
          </div>

          {/* Column 2: Core Platform */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-[#111111] uppercase tracking-wider">
              Platform
            </h4>
            <ul className="space-y-2 text-xs text-[#666666]">
              <li>
                <button
                  onClick={() => onNavigate('encrypt')}
                  className="hover:text-[#111111] transition-colors"
                >
                  Encrypt Image
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('decrypt')}
                  className="hover:text-[#111111] transition-colors"
                >
                  Decrypt Image
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('dashboard')}
                  className="hover:text-[#111111] transition-colors"
                >
                  User Dashboard & Audit
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('security')}
                  className="hover:text-[#111111] transition-colors"
                >
                  Security Architecture
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Cryptography & Tech */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-[#111111] uppercase tracking-wider">
              Cryptography
            </h4>
            <ul className="space-y-2 text-xs text-[#666666]">
              <li>
                <button
                  onClick={() => onNavigate('docs')}
                  className="hover:text-[#111111] transition-colors"
                >
                  CPT Container Specification
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('security')}
                  className="hover:text-[#111111] transition-colors"
                >
                  NIST SP 800-38D AES-GCM
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('security')}
                  className="hover:text-[#111111] transition-colors"
                >
                  RFC 8018 PBKDF2-SHA256
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('docs')}
                  className="hover:text-[#111111] transition-colors"
                >
                  Zero-Knowledge Proofs
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Legal & Compliance */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-[#111111] uppercase tracking-wider">
              Compliance
            </h4>
            <ul className="space-y-2 text-xs text-[#666666]">
              <li>
                <button
                  onClick={() => onNavigate('privacy')}
                  className="hover:text-[#111111] transition-colors"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('terms')}
                  className="hover:text-[#111111] transition-colors"
                >
                  Terms and Conditions
                </button>
              </li>
              <li>
                <span className="text-[#888888]">
                  Zero Server Plaintext Retention
                </span>
              </li>
              <li>
                <span className="text-[#888888]">
                  Client-Side Hardware Acceleration
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Strict Disclosures */}
        <div className="pt-8 border-t border-[#E5E5E5] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#888888]">
          <p>© {new Date().getFullYear()} CRYPTORA Platform. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Client-Authoritative Processing</span>
            <span>·</span>
            <span>Local WebCrypto Implementation</span>
            <span>·</span>
            <button
              onClick={() => onNavigate('privacy')}
              className="hover:text-[#111111] transition-colors"
            >
              Privacy
            </button>
            <button
              onClick={() => onNavigate('terms')}
              className="hover:text-[#111111] transition-colors"
            >
              Terms
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
