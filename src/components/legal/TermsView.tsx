/**
 * CRYPTORA Terms and Conditions
 * Authentic legal terms for sovereign image encryption.
 */

import React from 'react';

export const TermsView: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 space-y-8 text-[#111111]">
      <div className="border-b border-[#E5E5E5] pb-4">
        <span className="text-xs font-mono font-bold text-[#666666] uppercase">
          Terms of Service
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mt-1">
          Terms and Conditions
        </h1>
        <p className="text-xs text-[#666666] mt-1">
          Last revised: October 2026 · CRYPTORA Platform Terms
        </p>
      </div>

      <div className="space-y-6 text-xs text-[#666666] leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-[#111111]">
            1. Agreement to Terms
          </h2>
          <p>
            By accessing or using the CRYPTORA web application, you agree to be bound by these Terms and Conditions.
            If you disagree with any part of these terms, you may not access or use the platform.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-[#111111]">
            2. Permitted Use and Intellectual Property
          </h2>
          <p>
            CRYPTORA is provided to empower individuals and organizations to safeguard their digital images.
            You retain 100% intellectual property ownership of any images, containers, and cryptographic assets processed through the application.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-[#111111]">
            3. Irreversible Nature of Authenticated Encryption
          </h2>
          <p>
            You acknowledge that AES-256-GCM is an industry-standard authenticated encryption algorithm.
            If you lose, forget, or misplace the password or master key used to encrypt an image, CRYPTORA personnel cannot recover or decrypt your file under any circumstances.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-[#111111]">
            4. Disclaimer of Warranties
          </h2>
          <p>
            The service is provided on an "AS IS" and "AS AVAILABLE" basis. While we adhere strictly to NIST and RFC cryptographic guidelines, users are advised to maintain verified off-site backups of mission-critical raw assets.
          </p>
        </section>
      </div>
    </div>
  );
};
