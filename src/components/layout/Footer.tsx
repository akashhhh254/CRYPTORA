/**
 * CRYPTORA Footer
 * Conforms to Phase 4 Footer Requirements:
 * Cryptora Logo, About, Features, Contact, Security, Privacy Policy, Terms & Conditions, Copyright.
 * All links working.
 */

import React, { useState } from 'react';
import { CryptoraLogo } from '../common/CryptoraLogo';
import { Mail, Shield, Check, X } from 'lucide-react';

interface FooterProps {
  onNavigate: (route: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const [contactOpen, setContactOpen] = useState(false);

  return (
    <footer className="w-full bg-white border-t border-[#E5E5E5] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-10">
          {/* Column 1: Brand & Tagline */}
          <div className="md:col-span-2 space-y-3">
            <CryptoraLogo size="md" />
            <p className="text-xs font-semibold text-[#111111] tracking-wide">
              "Your Data. Your Security. Your Control."
            </p>
            <p className="text-xs text-[#777777] leading-relaxed max-w-sm">
              Standard-compliant AES-256-GCM authenticated encryption, one-way hashes, and verifiable container packaging executed locally within your workstation.
            </p>
          </div>

          {/* Column 2: Platform Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#111111] uppercase tracking-wider">
              Platform
            </h4>
            <ul className="space-y-2 text-xs text-[#777777]">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-[#111111] transition-colors"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('features')}
                  className="hover:text-[#111111] transition-colors"
                >
                  Features
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="hover:text-[#111111] transition-colors"
                >
                  About Cryptora
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('dashboard')}
                  className="hover:text-[#111111] transition-colors"
                >
                  User Dashboard
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Cryptography & Architecture */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#111111] uppercase tracking-wider">
              Cryptography
            </h4>
            <ul className="space-y-2 text-xs text-[#777777]">
              <li>
                <button
                  onClick={() => onNavigate('algorithms')}
                  className="hover:text-[#111111] transition-colors"
                >
                  Algorithms Knowledge Base
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
              <li>
                <button
                  onClick={() => onNavigate('docs')}
                  className="hover:text-[#111111] transition-colors"
                >
                  CPT Container Spec
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('security')}
                  className="hover:text-[#111111] transition-colors"
                >
                  Live Assertion Suite
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Legal & Contact */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#111111] uppercase tracking-wider">
              Legal & Support
            </h4>
            <ul className="space-y-2 text-xs text-[#777777]">
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
                  Terms & Conditions
                </button>
              </li>
              <li>
                <button
                  onClick={() => setContactOpen(true)}
                  className="hover:text-[#111111] transition-colors"
                >
                  Contact & Security Desk
                </button>
              </li>
              <li>
                <span className="text-[#777777] block text-[11px]">
                  Zero Server Plaintext Retention
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Strict Disclosures */}
        <div className="pt-8 border-t border-[#E5E5E5] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#777777]">
          <p>© {new Date().getFullYear()} CRYPTORA Platform. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Client-Authoritative WebCrypto</span>
            <span>·</span>
            <button
              onClick={() => onNavigate('privacy')}
              className="hover:text-[#111111] transition-colors"
            >
              Privacy Policy
            </button>
            <span>·</span>
            <button
              onClick={() => onNavigate('terms')}
              className="hover:text-[#111111] transition-colors"
            >
              Terms & Conditions
            </button>
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      {contactOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white border border-[#E5E5E5] rounded shadow-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#E5E5E5] pb-3">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#111111]" />
                <h3 className="text-sm font-bold text-[#111111]">
                  Contact & Security Office
                </h3>
              </div>
              <button
                onClick={() => setContactOpen(false)}
                className="text-[#777777] hover:text-[#111111]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#777777] leading-relaxed">
              <p>
                For security disclosures, cryptographic vulnerability reports, or enterprise deployment assistance, please reach out directly to our security engineering team:
              </p>
              <div className="p-3 bg-[#F7F7F7] border border-[#E5E5E5] rounded font-mono text-xs text-[#111111] space-y-1">
                <p>Security Desk: security@cryptora.io</p>
                <p>Compliance & Privacy: privacy@cryptora.io</p>
                <p>PGP Key Fingerprint: 4E9A B021 89DF 3C11</p>
              </div>
            </div>

            <button
              onClick={() => setContactOpen(false)}
              className="w-full py-2 bg-[#111111] text-white text-xs font-semibold rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </footer>
  );
};
