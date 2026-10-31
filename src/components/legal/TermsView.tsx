/**
 * CRYPTORA Terms and Conditions
 * Comprehensive 13-section legal and cryptographic disclosure.
 * Route: #/terms
 */

import React from 'react';

export const TermsView: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 space-y-8 text-[#111111]">
      <div className="border-b border-[#E5E5E5] pb-4">
        <span className="text-xs font-mono font-bold text-[#777777] uppercase">
          Legal & Compliance
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mt-1">
          Terms and Conditions
        </h1>
        <p className="text-xs text-[#777777] mt-1 font-mono">
          Last Updated: October 2026 · CRYPTORA Version 1.0
        </p>
      </div>

      <div className="space-y-6 text-xs text-[#777777] leading-relaxed">
        <section className="space-y-1.5">
          <h2 className="text-sm font-bold text-[#111111]">1. Acceptance of Terms</h2>
          <p>
            By accessing or using the CRYPTORA web application and services, you agree to be legally bound by these Terms and Conditions. If you do not agree to all terms, you must immediately terminate use of the platform.
          </p>
        </section>

        <section className="space-y-1.5">
          <h2 className="text-sm font-bold text-[#111111]">2. Description of Services</h2>
          <p>
            CRYPTORA provides client-side cryptographic utilities, including authenticated symmetric encryption (AES-256-GCM, AES-256-CBC), one-way cryptographic hashing (SHA-256, SHA-512), binary container packaging (.cpt), CSPRNG password generation, and local operation auditing.
          </p>
        </section>

        <section className="space-y-1.5">
          <h2 className="text-sm font-bold text-[#111111]">3. User Responsibilities</h2>
          <p>
            You are exclusively responsible for maintaining the confidentiality of your passwords, master keys, and account access. You agree to use the service in compliance with all applicable local, national, and international laws.
          </p>
        </section>

        <section className="space-y-1.5">
          <h2 className="text-sm font-bold text-[#111111]">4. Encryption and Decryption Limitations</h2>
          <p>
            CRYPTORA enforces standard authenticated encryption algorithms. The platform does not incorporate backdoors, master recovery keys, or cryptographic bypasses under any circumstances.
          </p>
        </section>

        <section className="space-y-1.5">
          <h2 className="text-sm font-bold text-[#111111]">5. Irreversible Nature of Authentication</h2>
          <p>
            If a ciphertext or binary package is tampered with, corrupted, or paired with an incorrect key, AES-256-GCM authentication verification will fail. In such events, data recovery is mathematically impossible.
          </p>
        </section>

        <section className="space-y-1.5">
          <h2 className="text-sm font-bold text-[#111111]">6. Encryption Key Responsibility</h2>
          <p className="font-semibold text-[#111111]">
            Lost, forgotten, or deleted encryption keys cannot be recovered by CRYPTORA personnel or systems.
          </p>
          <p>
            You acknowledge and accept sole custody and risk regarding the archival and retention of your secret keys and passphrases.
          </p>
        </section>

        <section className="space-y-1.5">
          <h2 className="text-sm font-bold text-[#111111]">7. Prohibited Activities</h2>
          <p>
            You may not attempt to reverse engineer proprietary infrastructure, introduce malware, execute denial-of-service attacks, or utilize CRYPTORA for illegal extortion, malware distribution, or unlawful interception.
          </p>
        </section>

        <section className="space-y-1.5">
          <h2 className="text-sm font-bold text-[#111111]">8. Intellectual Property</h2>
          <p>
            You retain 100% intellectual property ownership of all plaintext texts, images, and files processed through the application. CRYPTORA claims no ownership or license to user data.
          </p>
        </section>

        <section className="space-y-1.5">
          <h2 className="text-sm font-bold text-[#111111]">9. Disclaimer of Warranties</h2>
          <p>
            The service is provided strictly on an "AS IS" and "AS AVAILABLE" basis without warranties of any kind, whether express or implied. Users are strongly advised to keep redundant offline backups of mission-critical raw data.
          </p>
        </section>

        <section className="space-y-1.5">
          <h2 className="text-sm font-bold text-[#111111]">10. Limitation of Liability</h2>
          <p>
            Under no circumstances shall CRYPTORA, its developers, or affiliates be liable for any direct, indirect, incidental, or consequential damages resulting from data loss, key misplacement, or transmission failure.
          </p>
        </section>

        <section className="space-y-1.5">
          <h2 className="text-sm font-bold text-[#111111]">11. Service Availability</h2>
          <p>
            We strive to maintain high service availability; however, we do not guarantee uninterrupted platform uptime or that the service will remain bug-free across all legacy browser environments.
          </p>
        </section>

        <section className="space-y-1.5">
          <h2 className="text-sm font-bold text-[#111111]">12. Changes to Terms</h2>
          <p>
            We reserve the right to modify these Terms and Conditions at any time. Continued usage of CRYPTORA following any updates signifies your binding acceptance of the revised terms.
          </p>
        </section>

        <section className="space-y-1.5">
          <h2 className="text-sm font-bold text-[#111111]">13. Contact Information</h2>
          <p>
            Inquiries regarding these terms and cryptographic specifications may be directed to <span className="font-mono text-[#111111]">security@cryptora.io</span>.
          </p>
        </section>
      </div>
    </div>
  );
};
