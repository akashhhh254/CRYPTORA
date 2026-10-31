/**
 * CRYPTORA - Firebase Setup & Integration Guide Modal
 * Complete 9-step production walkthrough for Firebase Auth, Google Sign-In,
 * Firestore setup, authorized domains, and Vercel environment variables.
 */

import React, { useState } from 'react';
import {
  X,
  ExternalLink,
  Copy,
  Check,
  Shield,
  Key,
  Globe,
  Database,
  Lock,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface FirebaseSetupGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenConfigurator?: () => void;
}

export const FirebaseSetupGuideModal: React.FC<FirebaseSetupGuideModalProps> = ({
  isOpen,
  onClose,
  onOpenConfigurator,
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'cryptora-green.vercel.app';

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const steps = [
    {
      step: '1',
      title: 'Create a Firebase Project',
      desc: 'Open Google Firebase Console and create a project for CRYPTORA.',
      action: 'https://console.firebase.google.com/',
      actionLabel: 'Open Firebase Console',
      bullets: [
        'Click "Add project" (or select an existing Google Cloud project).',
        'Enter project name (e.g. cryptora-secure).',
        'Google Analytics can be disabled or enabled based on preference.',
        'Click "Create Project" and wait for provisioning to complete.',
      ],
    },
    {
      step: '2',
      title: 'Register a Web App',
      desc: 'Add a Web App to your Firebase project to get the client configuration.',
      bullets: [
        'On the Project Overview page, click the Web icon ("</>").',
        'Enter App nickname: "CRYPTORA Web App".',
        'Firebase Hosting is optional (you can use Vercel or any hosting).',
        'Click "Register app".',
      ],
    },
    {
      step: '3',
      title: 'Copy Firebase Web App Configuration',
      desc: 'Copy the JavaScript configuration object provided by Firebase.',
      bullets: [
        'Look for the `const firebaseConfig = { ... }` block in the console.',
        'Copy the entire configuration block.',
        'In CRYPTORA, open "Connect Firebase Authentication" and paste it directly into the snippet field.',
      ],
      code: `const firebaseConfig = {
  apiKey: "AIzaSyD-YOUR_ACTUAL_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.firebasestorage.app",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};`,
    },
    {
      step: '4',
      title: 'Enable Google Sign-In',
      desc: 'Activate Google OAuth as a sign-in provider in Firebase Authentication.',
      bullets: [
        'Go to Build > Authentication in the left navigation sidebar.',
        'Click "Get started", then go to the "Sign-in method" tab.',
        'Click "Google", toggle "Enable", choose your project support email, and click "Save".',
      ],
    },
    {
      step: '5',
      title: 'Enable Email and Password Authentication',
      desc: 'Activate Email/Password for registration and login.',
      bullets: [
        'In the same "Sign-in method" tab, click "Email/Password".',
        'Toggle "Enable" on the first switch (Email/Password).',
        'Leave "Email link (passwordless sign-in)" disabled unless required.',
        'Click "Save".',
      ],
    },
    {
      step: '6',
      title: 'Add Authorized Domains',
      desc: 'Authorize CRYPTORA deployment domains for Google Sign-In popups.',
      bullets: [
        'Under Authentication > Settings tab > click "Authorized domains".',
        'Ensure the following domains are listed:',
        `• ${currentHost} (current deployment)`,
        '• cryptora-green.vercel.app (production Vercel app)',
        '• localhost (for local development)',
      ],
      code: currentHost,
    },
    {
      step: '7',
      title: 'Configure Cloud Firestore',
      desc: 'Initialize the Firestore NoSQL database for secure profile storage.',
      bullets: [
        'Go to Build > Firestore Database > click "Create database".',
        'Choose a database location (e.g., us-central1 or europe-west1).',
        'Select "Start in production mode" and click "Create".',
      ],
    },
    {
      step: '8',
      title: 'Configure Firestore Security Rules',
      desc: 'Enforce UID-isolated user privacy so users can only read/write their own records.',
      bullets: [
        'Go to Firestore Database > Rules tab.',
        'Paste the strict user-isolation security rules provided below and click "Publish".',
      ],
      code: `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      match /history/{operationId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
    match /{document=**} {
      allow read, write: if false;
    }
  }
}`,
    },
    {
      step: '9',
      title: 'Add Environment Variables to Vercel (Optional)',
      desc: 'For automated deployments on Vercel without entering keys in the browser.',
      bullets: [
        'In your Vercel Project Dashboard, navigate to Settings > Environment Variables.',
        'Add each of the variables below, then trigger a redeploy.',
      ],
      code: `VITE_FIREBASE_API_KEY="AIzaSy..."
VITE_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your-project"
VITE_FIREBASE_STORAGE_BUCKET="your-project.firebasestorage.app"
VITE_FIREBASE_MESSAGING_SENDER_ID="123456789012"
VITE_FIREBASE_APP_ID="1:123456789012:web:abcdef"`,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        className="w-full max-w-3xl max-h-[90vh] bg-white border border-[#E5E5E5] rounded shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="setup-guide-title"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E5E5E5] flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-[#111111] text-white flex items-center justify-center text-sm font-bold">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h2 id="setup-guide-title" className="text-sm font-bold text-[#111111]">
                Firebase Authentication & Firestore Setup Guide
              </h2>
              <p className="text-[11px] text-[#777777]">
                Step-by-step setup for Google OAuth, Email Login, and zero-knowledge database rules.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#777777] hover:text-[#111111] transition-colors rounded"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs text-[#111111]">
          {/* Top Banner */}
          <div className="p-4 bg-[#F7F7F7] border border-[#E5E5E5] rounded space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#111111]">
                Quick Integration Shortcut
              </span>
              {onOpenConfigurator && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenConfigurator();
                  }}
                  className="px-3 py-1.5 bg-[#111111] hover:bg-[#333333] text-white text-[11px] font-semibold rounded transition-colors"
                >
                  Open Configurator Now
                </button>
              )}
            </div>
            <p className="text-[11px] text-[#777777] leading-relaxed">
              Once you create your Firebase Web App in Step 2, simply copy the <code className="text-[#111111] font-mono font-bold">firebaseConfig</code> object and paste it into CRYPTORA's configuration drawer. No server redeploy is necessary!
            </p>
          </div>

          {/* Steps List */}
          <div className="space-y-5">
            {steps.map((st, idx) => (
              <div
                key={st.step}
                className="p-4 border border-[#E5E5E5] rounded bg-white hover:border-[#111111] transition-colors space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded bg-[#111111] text-white flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5">
                      {st.step}
                    </span>
                    <div>
                      <h3 className="font-bold text-sm text-[#111111]">{st.title}</h3>
                      <p className="text-[11px] text-[#777777] mt-0.5">{st.desc}</p>
                    </div>
                  </div>
                  {st.action && (
                    <a
                      href={st.action}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#111111] hover:underline shrink-0 bg-[#F7F7F7] px-2.5 py-1 rounded border border-[#E5E5E5]"
                    >
                      <span>{st.actionLabel}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                {st.bullets && (
                  <ul className="pl-9 space-y-1 text-[11px] text-[#333333] list-disc">
                    {st.bullets.map((b, bIdx) => (
                      <li key={bIdx}>{b}</li>
                    ))}
                  </ul>
                )}

                {st.code && (
                  <div className="pl-9">
                    <div className="relative group">
                      <pre className="p-3 bg-[#F7F7F7] border border-[#E5E5E5] rounded font-mono text-[10px] text-[#111111] overflow-x-auto leading-relaxed">
                        {st.code}
                      </pre>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(st.code!, idx)}
                        className="absolute right-2 top-2 p-1.5 bg-white border border-[#E5E5E5] rounded text-[#777777] hover:text-[#111111] transition-colors flex items-center gap-1 text-[10px] shadow-xs"
                      >
                        {copiedIndex === idx ? (
                          <>
                            <Check className="w-3 h-3 text-[#16A34A]" />
                            <span className="text-[#16A34A]">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#E5E5E5] bg-[#F7F7F7] flex items-center justify-between shrink-0">
          <span className="text-[11px] text-[#777777]">
            Authorized Domain for current instance: <strong className="font-mono text-[#111111]">{currentHost}</strong>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#111111] hover:bg-[#333333] text-white text-xs font-semibold rounded transition-colors"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
