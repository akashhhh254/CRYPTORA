/**
 * CRYPTORA 3-Second Cinematic Splash Screen
 * Displays Cryptora logo, brand mark, official tagline, and minimal loading indicator.
 * Shown once per browser session. Respects reduced-motion preferences.
 */

import React, { useEffect, useState } from 'react';
import { CryptoraLogo } from './CryptoraLogo';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      onComplete();
      return;
    }

    // 3-second progress timer
    const intervalTime = 30; // ~100 steps
    const stepIncrement = 100 / (2800 / intervalTime);

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + stepIncrement;
        if (next >= 100) {
          clearInterval(timer);
          setFadeOut(true);
          setTimeout(() => {
            onComplete();
          }, 350); // smooth fade transition
          return 100;
        }
        return next;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#080808] text-white transition-opacity duration-300 ${
        fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      role="alert"
      aria-live="polite"
      aria-label="Loading CRYPTORA Security Platform"
    >
      <div className="flex flex-col items-center max-w-sm px-6 text-center space-y-6 animate-in fade-in zoom-in-95 duration-500">
        {/* Animated Geometric Shield Logo */}
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-sm">
            <svg
              width="36"
              height="36"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-white"
            >
              <path
                d="M16 2L4 7V16C4 23.5 9.1 28.8 16 30C22.9 28.8 28 23.5 28 16V7L16 2Z"
                stroke="#FFFFFF"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
              <circle cx="16" cy="13" r="3.2" stroke="#FFFFFF" strokeWidth="2" fill="none" />
              <path
                d="M14.2 16.2L13 22H19L17.8 16.2"
                stroke="#FFFFFF"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </div>
        </div>

        {/* Brand Name & Tagline */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            CRYPTORA
          </h1>
          <p className="text-xs font-medium text-[#777777] tracking-wider uppercase">
            Your Data. Your Security. Your Control.
          </p>
        </div>

        {/* Minimal Progress Line */}
        <div className="w-48 space-y-2 pt-2">
          <div className="h-0.5 w-full bg-white/15 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-75 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] text-[#777777] font-mono">
            <span>ISOLATING MEMORY</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>

        {/* Quick Skip Option */}
        <button
          onClick={() => {
            setFadeOut(true);
            setTimeout(onComplete, 150);
          }}
          className="text-[11px] text-[#777777] hover:text-white transition-colors underline decoration-dotted mt-4 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white"
        >
          Skip Intro
        </button>
      </div>
    </div>
  );
};
